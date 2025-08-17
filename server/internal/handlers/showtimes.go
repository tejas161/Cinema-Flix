package handlers

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/tejas161/Cinema-Flix/internal/config"
	"github.com/tejas161/Cinema-Flix/models"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type ShowtimesHandler struct {
	showtimesCollection *mongo.Collection
	theatersCollection  *mongo.Collection
}

func NewShowtimesHandler() *ShowtimesHandler {
	return &ShowtimesHandler{
		showtimesCollection: config.GetCollection("showtimes"),
		theatersCollection:  config.GetCollection("theaters"),
	}
}

// CreateShowtime creates a new showtime
func (h *ShowtimesHandler) CreateShowtime() fiber.Handler {
	return func(c *fiber.Ctx) error {
		var showtimeData models.Showtime
		if err := c.BodyParser(&showtimeData); err != nil {
			return c.Status(400).JSON(fiber.Map{
				"success": false,
				"error":   "Invalid request body",
			})
		}

		// Validate theater and screen exist
		if err := h.validateTheaterAndScreen(showtimeData.TheaterID, showtimeData.ScreenID); err != nil {
			return c.Status(400).JSON(fiber.Map{
				"success": false,
				"error":   err.Error(),
			})
		}

		// Get screen details to initialize seats
		screen, err := h.getScreenDetails(showtimeData.TheaterID, showtimeData.ScreenID)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to get screen details",
			})
		}

		// Initialize seats for the showtime
		showtimeData.Seats = h.initializeSeats(screen)
		showtimeData.TotalSeats = screen.TotalSeats
		showtimeData.BookedSeats = 0

		// Set timestamps
		now := time.Now()
		showtimeData.CreatedAt = now
		showtimeData.UpdatedAt = now

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		result, err := h.showtimesCollection.InsertOne(ctx, showtimeData)
		if err != nil {
			log.Printf("Error creating showtime: %v", err)
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to create showtime",
			})
		}

		showtimeData.ID = result.InsertedID.(bson.ObjectID)

		return c.Status(201).JSON(fiber.Map{
			"success": true,
			"data":    showtimeData,
		})
	}
}

// GetShowtimeByID returns a specific showtime with seat layout
func (h *ShowtimesHandler) GetShowtimeByID() fiber.Handler {
	return func(c *fiber.Ctx) error {
		showtimeIDStr := c.Params("id")
		showtimeID, err := bson.ObjectIDFromHex(showtimeIDStr)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{
				"success": false,
				"error":   "Invalid showtime ID",
			})
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var showtime models.Showtime
		err = h.showtimesCollection.FindOne(ctx, bson.M{"_id": showtimeID}).Decode(&showtime)
		if err != nil {
			if err == mongo.ErrNoDocuments {
				return c.Status(404).JSON(fiber.Map{
					"success": false,
					"error":   "Showtime not found",
				})
			}
			log.Printf("Error finding showtime: %v", err)
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to fetch showtime",
			})
		}

		// Get theater and screen details
		theater, err := h.getTheaterByID(showtime.TheaterID)
		if err != nil {
			log.Printf("Error finding theater: %v", err)
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to fetch theater details",
			})
		}

		screen, err := h.getScreenDetails(showtime.TheaterID, showtime.ScreenID)
		if err != nil {
			log.Printf("Error finding screen: %v", err)
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to fetch screen details",
			})
		}

		// Build response with additional details
		response := map[string]interface{}{
			"showtime":    showtime,
			"theater":     theater,
			"screen":      screen,
			"seat_layout": h.buildSeatLayoutResponse(showtime.Seats, screen.SeatLayout),
		}

		return c.JSON(fiber.Map{
			"success": true,
			"data":    response,
		})
	}
}

// validateTheaterAndScreen validates that theater and screen exist
func (h *ShowtimesHandler) validateTheaterAndScreen(theaterID, screenID bson.ObjectID) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var theater models.Theater
	err := h.theatersCollection.FindOne(ctx, bson.M{"_id": theaterID}).Decode(&theater)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return fmt.Errorf("theater not found")
		}
		return fmt.Errorf("failed to validate theater")
	}

	// Check if screen exists in theater
	screenExists := false
	for _, screen := range theater.Screens {
		if screen.ID == screenID {
			screenExists = true
			break
		}
	}

	if !screenExists {
		return fmt.Errorf("screen not found in theater")
	}

	return nil
}

// getScreenDetails gets screen details from theater
func (h *ShowtimesHandler) getScreenDetails(theaterID, screenID bson.ObjectID) (*models.Screen, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var theater models.Theater
	err := h.theatersCollection.FindOne(ctx, bson.M{"_id": theaterID}).Decode(&theater)
	if err != nil {
		return nil, err
	}

	for _, screen := range theater.Screens {
		if screen.ID == screenID {
			return &screen, nil
		}
	}

	return nil, fmt.Errorf("screen not found")
}

// getTheaterByID gets theater by ID
func (h *ShowtimesHandler) getTheaterByID(theaterID bson.ObjectID) (*models.Theater, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var theater models.Theater
	err := h.theatersCollection.FindOne(ctx, bson.M{"_id": theaterID}).Decode(&theater)
	if err != nil {
		return nil, err
	}

	return &theater, nil
}

// initializeSeats creates seat array for a new showtime
func (h *ShowtimesHandler) initializeSeats(screen *models.Screen) []models.Seat {
	var seats []models.Seat

	for _, row := range screen.SeatLayout.Rows {
		for seatNum := 1; seatNum <= row.SeatCount; seatNum++ {
			seatID := fmt.Sprintf("%s%d", row.RowID, seatNum)

			// Determine price based on time (simplified logic)
			var price float64
			switch row.RowType {
			case "premium":
				price = row.Price.Evening // Use evening price as default
			case "regular":
				price = row.Price.Afternoon // Use afternoon price as default
			default:
				price = row.Price.Afternoon
			}

			seat := models.Seat{
				SeatID:     seatID,
				RowID:      row.RowID,
				SeatNumber: seatNum,
				SeatType:   row.RowType,
				Status:     "available",
				Price:      price,
			}

			seats = append(seats, seat)
		}
	}

	return seats
}

// buildSeatLayoutResponse builds seat layout for frontend
func (h *ShowtimesHandler) buildSeatLayoutResponse(seats []models.Seat, layout models.SeatLayout) map[string]interface{} {
	// Group seats by row
	seatsByRow := make(map[string][]models.Seat)
	for _, seat := range seats {
		seatsByRow[seat.RowID] = append(seatsByRow[seat.RowID], seat)
	}

	// Build response
	response := map[string]interface{}{
		"rows":   seatsByRow,
		"layout": layout,
		"legend": map[string]string{
			"available":   "Available",
			"booked":      "Booked",
			"blocked":     "Temporarily Blocked",
			"maintenance": "Under Maintenance",
		},
	}

	return response
}

// UpdateSeatStatus updates seat status (for booking/blocking)
func (h *ShowtimesHandler) UpdateSeatStatus() fiber.Handler {
	return func(c *fiber.Ctx) error {
		showtimeIDStr := c.Params("id")
		showtimeID, err := bson.ObjectIDFromHex(showtimeIDStr)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{
				"success": false,
				"error":   "Invalid showtime ID",
			})
		}

		var request struct {
			SeatIDs []string `json:"seat_ids"`
			Action  string   `json:"action"` // block, book, release
			UserID  string   `json:"user_id,omitempty"`
		}

		if err := c.BodyParser(&request); err != nil {
			return c.Status(400).JSON(fiber.Map{
				"success": false,
				"error":   "Invalid request body",
			})
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		// Find the showtime
		var showtime models.Showtime
		err = h.showtimesCollection.FindOne(ctx, bson.M{"_id": showtimeID}).Decode(&showtime)
		if err != nil {
			if err == mongo.ErrNoDocuments {
				return c.Status(404).JSON(fiber.Map{
					"success": false,
					"error":   "Showtime not found",
				})
			}
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to fetch showtime",
			})
		}

		// Update seat status based on action
		success := true
		for _, seatID := range request.SeatIDs {
			switch request.Action {
			case "block":
				if !showtime.BlockSeat(seatID, 15*time.Minute) {
					success = false
				}
			case "book":
				if !showtime.BookSeat(seatID, request.UserID) {
					success = false
				}
			case "release":
				if !showtime.ReleaseSeat(seatID) {
					success = false
				}
			default:
				return c.Status(400).JSON(fiber.Map{
					"success": false,
					"error":   "Invalid action",
				})
			}
		}

		if !success {
			return c.Status(400).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to update some seats",
			})
		}

		// Update showtime in database
		update := bson.M{
			"$set": bson.M{
				"seats":        showtime.Seats,
				"booked_seats": showtime.BookedSeats,
				"updated_at":   time.Now(),
			},
		}

		_, err = h.showtimesCollection.UpdateOne(ctx, bson.M{"_id": showtimeID}, update)
		if err != nil {
			log.Printf("Error updating showtime: %v", err)
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to update showtime",
			})
		}

		return c.JSON(fiber.Map{
			"success": true,
			"data": map[string]interface{}{
				"showtime_id":     showtimeID.Hex(),
				"updated_seats":   request.SeatIDs,
				"action":          request.Action,
				"available_seats": showtime.AvailableSeats(),
			},
		})
	}
}
