package handlers

import (
	"context"
	"fmt"
	"log"
	"math/rand"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/tejas161/Cinema-Flix/internal/config"
	"github.com/tejas161/Cinema-Flix/models"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type BookingsHandler struct {
	bookingsCollection  *mongo.Collection
	showtimesCollection *mongo.Collection
	theatersCollection  *mongo.Collection
}

func NewBookingsHandler() *BookingsHandler {
	return &BookingsHandler{
		bookingsCollection:  config.GetCollection("bookings"),
		showtimesCollection: config.GetCollection("showtimes"),
		theatersCollection:  config.GetCollection("theaters"),
	}
}

// CreateBooking creates a new booking
func (h *BookingsHandler) CreateBooking() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Get user information from auth headers
		// Get userId from JSON body (googleId or id field)
		var userPayload struct {
			GoogleID string `json:"googleId"`
			ID       string `json:"id"`
		}
		_ = c.BodyParser(&userPayload)
		log.Printf("User payload: %v", userPayload);
		userID := userPayload.GoogleID
		if userID == "" {
			userID = userPayload.ID
		}

		if userID == "" {
			return c.Status(401).JSON(fiber.Map{
				"success": false,
				"error":   "User authentication required",
			})
		}
		
		var request struct {
			ShowtimeID      string                `json:"showtime_id"`
			SeatIDs         []string             `json:"seat_ids"`
		}

		if err := c.BodyParser(&request); err != nil {
			return c.Status(400).JSON(fiber.Map{
				"success": false,
				"error":   "Invalid request body",
			})
		}

		// Validate input
		if len(request.SeatIDs) == 0 {
			return c.Status(400).JSON(fiber.Map{
				"success": false,
				"error":   "At least one seat must be selected",
			})
		}

		showtimeID, err := bson.ObjectIDFromHex(request.ShowtimeID)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{
				"success": false,
				"error":   "Invalid showtime ID",
			})
		}

		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()

		// Start transaction for booking
		session, err := config.MongoClient.StartSession()
		if err != nil {
			log.Printf("Error starting session: %v", err)
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to start booking process",
			})
		}
		defer session.EndSession(ctx)

		var bookingResult *models.Booking

		// Execute transaction
		err = mongo.WithSession(ctx, session, func(sc context.Context) error {
			// Get showtime details
			var showtime models.Showtime
			err := h.showtimesCollection.FindOne(sc, bson.M{"_id": showtimeID}).Decode(&showtime)
			if err != nil {
				if err == mongo.ErrNoDocuments {
					return fmt.Errorf("showtime not found")
				}
				return fmt.Errorf("failed to fetch showtime: %v", err)
			}

			// Check if showtime is available
			if !showtime.IsAvailable() {
				return fmt.Errorf("showtime is not available for booking")
			}

			// Validate and block seats
			totalPrice := 0.0
			var bookedSeats []models.BookedSeat

			for _, seatID := range request.SeatIDs {
				seat := showtime.GetSeatByID(seatID)
				if seat == nil {
					return fmt.Errorf("seat %s not found", seatID)
				}

				if seat.Status != "available" {
					return fmt.Errorf("seat %s is not available", seatID)
				}

				// Block the seat
				if !showtime.BookSeat(seatID, userID) {
					return fmt.Errorf("failed to book seat %s", seatID)
				}

				// Add to booked seats
				bookedSeat := models.BookedSeat{
					SeatID:     seat.SeatID,
					RowID:      seat.RowID,
					SeatNumber: seat.SeatNumber,
					SeatType:   seat.SeatType,
					Price:      seat.Price,
				}
				bookedSeats = append(bookedSeats, bookedSeat)
				totalPrice += seat.Price
			}

			// Update showtime in database
			updateShowtime := bson.M{
				"$set": bson.M{
					"seats":        showtime.Seats,
					"booked_seats": showtime.BookedSeats,
					"updated_at":   time.Now(),
				},
			}

			_, err = h.showtimesCollection.UpdateOne(sc, bson.M{"_id": showtimeID}, updateShowtime)
			if err != nil {
				return fmt.Errorf("failed to update showtime: %v", err)
			}

			// Generate booking ID
			bookingID := h.generateBookingID()

			// Create Google user info
			googleUserInfo := models.GoogleUserInfo{
				GoogleID: userID,
			}
			
			// Create booking
			booking := models.NewBooking(
				bookingID,
				googleUserInfo,
				showtime.ID,
				showtime.MovieID,
				showtime.TheaterID,
				showtime.ScreenID,
				showtime.ShowDate,
				showtime.ShowTime,
			)

			// Add seats to booking
			for _, seat := range bookedSeats {
				booking.AddSeat(seat.SeatID, seat.RowID, seat.SeatNumber, seat.SeatType, seat.Price)
			}

			// Calculate pricing (2% convenience fee, 18% tax, no discount)
			booking.CalculatePricing(2.0, 18.0, 0.0)

			// Insert booking
			result, err := h.bookingsCollection.InsertOne(sc, booking)
			if err != nil {
				return fmt.Errorf("failed to create booking: %v", err)
			}

			booking.ID = result.InsertedID.(bson.ObjectID)
			bookingResult = booking

			return nil
		})

		if err != nil {
			log.Printf("Booking transaction failed: %v", err)
			return c.Status(400).JSON(fiber.Map{
				"success": false,
				"error":   err.Error(),
			})
		}

		// Get additional details for response
		theater, _ := h.getTheaterDetails(bookingResult.TheaterID)
		
		response := map[string]interface{}{
			"booking":  bookingResult,
			"theater":  theater,
			"message":  "Booking created successfully. Please complete payment within 15 minutes.",
		}

		return c.Status(201).JSON(fiber.Map{
			"success": true,
			"data":    response,
		})
	}
}

// GetBookingByID returns booking details
func (h *BookingsHandler) GetBookingByID() fiber.Handler {
	return func(c *fiber.Ctx) error {
		bookingIDStr := c.Params("id")
		bookingID, err := bson.ObjectIDFromHex(bookingIDStr)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{
				"success": false,
				"error":   "Invalid booking ID",
			})
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var booking models.Booking
		err = h.bookingsCollection.FindOne(ctx, bson.M{"_id": bookingID}).Decode(&booking)
		if err != nil {
			if err == mongo.ErrNoDocuments {
				return c.Status(404).JSON(fiber.Map{
					"success": false,
					"error":   "Booking not found",
				})
			}
			log.Printf("Error finding booking: %v", err)
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to fetch booking",
			})
		}

		// Get theater details
		theater, _ := h.getTheaterDetails(booking.TheaterID)

		response := map[string]interface{}{
			"booking": booking,
			"theater": theater,
		}

		return c.JSON(fiber.Map{
			"success": true,
			"data":    response,
		})
	}
}

// GetUserBookings returns all bookings for a user
func (h *BookingsHandler) GetUserBookings() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Get user information from auth headers
		var userPayload struct {
			GoogleID string `json:"googleId"`
			ID       string `json:"id"`
		}
		_ = c.BodyParser(&userPayload)
		log.Printf("User payload: %v", userPayload);
		userID := userPayload.GoogleID
		if userID == "" {
			userID = userPayload.ID
		}
		if userID == "" {
			return c.Status(401).JSON(fiber.Map{
				"success": false,
				"error":   "User authentication required",
			})
		}

		// Parse query parameters
		limit, _ := strconv.Atoi(c.Query("limit", "10"))
		page, _ := strconv.Atoi(c.Query("page", "1"))
		skip := (page - 1) * limit

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		// Find user bookings
		filter := bson.M{"google_user_id": userID}
		
		// Count total bookings
		total, err := h.bookingsCollection.CountDocuments(ctx, filter)
		if err != nil {
			log.Printf("Error counting bookings: %v", err)
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to count bookings",
			})
		}

		// Find bookings with pagination
		findOptions := options.Find()
		findOptions.SetSkip(int64(skip))
		findOptions.SetLimit(int64(limit))
		findOptions.SetSort(bson.D{{"created_at", -1}}) // Latest first
		
		cursor, err := h.bookingsCollection.Find(ctx, filter, findOptions)
		if err != nil {
			log.Printf("Error finding bookings: %v", err)
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to fetch bookings",
			})
		}
		defer cursor.Close(ctx)

		var bookings []models.Booking
		if err := cursor.All(ctx, &bookings); err != nil {
			log.Printf("Error decoding bookings: %v", err)
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to decode bookings",
			})
		}

		response := map[string]interface{}{
			"bookings": bookings,
			"pagination": map[string]interface{}{
				"current_page": page,
				"total_pages":  (total + int64(limit) - 1) / int64(limit),
				"total_items":  total,
				"limit":        limit,
			},
		}

		return c.JSON(fiber.Map{
			"success": true,
			"data":    response,
		})
	}
}

// ConfirmPayment confirms payment for a booking
func (h *BookingsHandler) ConfirmPayment() fiber.Handler {
	return func(c *fiber.Ctx) error {
		bookingIDStr := c.Params("id")
		bookingID, err := bson.ObjectIDFromHex(bookingIDStr)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{
				"success": false,
				"error":   "Invalid booking ID",
			})
		}

		var request struct {
			TransactionID string  `json:"transaction_id"`
			PaymentMethod string  `json:"payment_method"`
			PaidAmount    float64 `json:"paid_amount"`
		}

		if err := c.BodyParser(&request); err != nil {
			return c.Status(400).JSON(fiber.Map{
				"success": false,
				"error":   "Invalid request body",
			})
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		// Find and update booking
		filter := bson.M{
			"_id":            bookingID,
			"payment_status": "pending",
		}

		update := bson.M{
			"$set": bson.M{
				"payment_status": "completed",
				"transaction_id": request.TransactionID,
				"payment_method": request.PaymentMethod,
				"pricing.paid_amount": request.PaidAmount,
				"updated_at":     time.Now(),
			},
		}

		result, err := h.bookingsCollection.UpdateOne(ctx, filter, update)
		if err != nil {
			log.Printf("Error updating booking: %v", err)
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to confirm payment",
			})
		}

		if result.MatchedCount == 0 {
			return c.Status(404).JSON(fiber.Map{
				"success": false,
				"error":   "Booking not found or already paid",
			})
		}

		return c.JSON(fiber.Map{
			"success": true,
			"data": map[string]interface{}{
				"booking_id":     bookingID.Hex(),
				"payment_status": "completed",
				"message":        "Payment confirmed successfully",
			},
		})
	}
}

// CancelBooking cancels a booking and releases seats
func (h *BookingsHandler) CancelBooking() fiber.Handler {
	return func(c *fiber.Ctx) error {
		bookingIDStr := c.Params("id")
		bookingID, err := bson.ObjectIDFromHex(bookingIDStr)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{
				"success": false,
				"error":   "Invalid booking ID",
			})
		}

		ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
		defer cancel()

		// Start transaction for cancellation
		session, err := config.MongoClient.StartSession()
		if err != nil {
			log.Printf("Error starting session: %v", err)
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to start cancellation process",
			})
		}
		defer session.EndSession(ctx)

		err = mongo.WithSession(ctx, session, func(sc context.Context) error {
			// Find booking
			var booking models.Booking
			err := h.bookingsCollection.FindOne(sc, bson.M{"_id": bookingID}).Decode(&booking)
			if err != nil {
				if err == mongo.ErrNoDocuments {
					return fmt.Errorf("booking not found")
				}
				return fmt.Errorf("failed to fetch booking: %v", err)
			}

			// Check if booking can be cancelled
			if booking.BookingStatus == "cancelled" {
				return fmt.Errorf("booking is already cancelled")
			}

			// Get showtime and release seats
			var showtime models.Showtime
			err = h.showtimesCollection.FindOne(sc, bson.M{"_id": booking.ShowtimeID}).Decode(&showtime)
			if err != nil {
				log.Printf("Warning: Could not find showtime for seat release: %v", err)
			} else {
				// Release seats
				for _, seat := range booking.Seats {
					showtime.ReleaseSeat(seat.SeatID)
				}

				// Update showtime
				updateShowtime := bson.M{
					"$set": bson.M{
						"seats":        showtime.Seats,
						"booked_seats": showtime.BookedSeats,
						"updated_at":   time.Now(),
					},
				}

				_, err = h.showtimesCollection.UpdateOne(sc, bson.M{"_id": booking.ShowtimeID}, updateShowtime)
				if err != nil {
					log.Printf("Warning: Failed to update showtime seats: %v", err)
				}
			}

			// Cancel booking
			updateBooking := bson.M{
				"$set": bson.M{
					"booking_status": "cancelled",
					"payment_status": "refunded",
					"updated_at":     time.Now(),
				},
			}

			_, err = h.bookingsCollection.UpdateOne(sc, bson.M{"_id": bookingID}, updateBooking)
			if err != nil {
				return fmt.Errorf("failed to cancel booking: %v", err)
			}

			return nil
		})

		if err != nil {
			log.Printf("Cancellation transaction failed: %v", err)
			return c.Status(400).JSON(fiber.Map{
				"success": false,
				"error":   err.Error(),
			})
		}

		return c.JSON(fiber.Map{
			"success": true,
			"data": map[string]interface{}{
				"booking_id": bookingID.Hex(),
				"status":     "cancelled",
				"message":    "Booking cancelled successfully",
			},
		})
	}
}

// generateBookingID generates a unique booking ID
func (h *BookingsHandler) generateBookingID() string {
	// Generate booking ID in format: CF{YYYYMMDD}{6-digit-random}
	now := time.Now()
	dateStr := now.Format("20060102")
	randomNum := rand.Intn(900000) + 100000 // 6-digit random number
	return fmt.Sprintf("CF%s%d", dateStr, randomNum)
}

// getTheaterDetails gets theater details by ID
func (h *BookingsHandler) getTheaterDetails(theaterID bson.ObjectID) (*models.Theater, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var theater models.Theater
	err := h.theatersCollection.FindOne(ctx, bson.M{"_id": theaterID}).Decode(&theater)
	if err != nil {
		return nil, err
	}

	return &theater, nil
}