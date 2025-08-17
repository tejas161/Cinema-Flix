package handlers

import (
	"context"
	"fmt"
	"log"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/tejas161/Cinema-Flix/internal/config"
	"github.com/tejas161/Cinema-Flix/models"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type TheatersHandler struct {
	theatersCollection  *mongo.Collection
	showtimesCollection *mongo.Collection
	bookingsCollection  *mongo.Collection
}

func NewTheatersHandler() *TheatersHandler {
	return &TheatersHandler{
		theatersCollection:  config.GetCollection("theaters"),
		showtimesCollection: config.GetCollection("showtimes"),
		bookingsCollection:  config.GetCollection("bookings"),
	}
}

// GetTheatersByMovie returns theaters showing a specific movie
func (h *TheatersHandler) GetTheatersByMovie() fiber.Handler {
	return func(c *fiber.Ctx) error {
		movieIDStr := c.Params("id")
		movieID, err := strconv.Atoi(movieIDStr)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{
				"success": false,
				"error":   "Invalid movie ID",
			})
		}

		// Get current date for finding showtimes
		today := time.Now()
		startOfDay := time.Date(today.Year(), today.Month(), today.Day(), 0, 0, 0, 0, today.Location())
		endOfWeek := startOfDay.AddDate(0, 0, 7) // Next 7 days

		// Find all showtimes for this movie in the next 7 days
		showtimeFilter := bson.M{
			"movie_id": movieID,
			"show_date": bson.M{
				"$gte": startOfDay,
				"$lt":  endOfWeek,
			},
			"status": "active",
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		showtimesCursor, err := h.showtimesCollection.Find(ctx, showtimeFilter)
		if err != nil {
			log.Printf("Error finding showtimes: %v", err)
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to fetch showtimes",
			})
		}
		defer showtimesCursor.Close(ctx)

		var showtimes []models.Showtime
		if err := showtimesCursor.All(ctx, &showtimes); err != nil {
			log.Printf("Error decoding showtimes: %v", err)
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to decode showtimes",
			})
		}

		// Get unique theater IDs from showtimes
		theaterIDsMap := make(map[bson.ObjectID]bool)
		for _, showtime := range showtimes {
			theaterIDsMap[showtime.TheaterID] = true
		}

		var theaterIDs []bson.ObjectID
		for theaterID := range theaterIDsMap {
			theaterIDs = append(theaterIDs, theaterID)
		}

		if len(theaterIDs) == 0 {
			// No existing showtimes found, create fallback showtimes
			log.Printf("[FALLBACK] No showtimes found for movie ID: %d, creating fallback showtimes", movieID)

			// Create fallback showtimes in background
			go func() {
				if err := h.CreateFallbackShowtimes(movieID); err != nil {
					log.Printf("[FALLBACK] Failed to create fallback showtimes for movie %d: %v", movieID, err)
				}
			}()

			// For immediate response, return empty array but indicate fallback is in progress
			return c.JSON(fiber.Map{
				"success": true,
				"data":    []interface{}{},
				"message": "Showtimes are being prepared for this movie. Please check back in a moment.",
			})
		}

		// Find theaters
		theaterFilter := bson.M{
			"_id": bson.M{"$in": theaterIDs},
		}

		theatersCursor, err := h.theatersCollection.Find(ctx, theaterFilter)
		if err != nil {
			log.Printf("Error finding theaters: %v", err)
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to fetch theaters",
			})
		}
		defer theatersCursor.Close(ctx)

		var theaters []models.Theater
		if err := theatersCursor.All(ctx, &theaters); err != nil {
			log.Printf("Error decoding theaters: %v", err)
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to decode theaters",
			})
		}

		// Build response with theaters and their showtimes
		theatersWithShowtimes := h.buildTheatersResponse(theaters, showtimes)

		return c.JSON(fiber.Map{
			"success": true,
			"data":    theatersWithShowtimes,
		})
	}
}

// buildTheatersResponse builds the response format expected by frontend
func (h *TheatersHandler) buildTheatersResponse(theaters []models.Theater, showtimes []models.Showtime) []map[string]interface{} {
	var response []map[string]interface{}

	for _, theater := range theaters {
		// Filter showtimes for this theater
		var theaterShowtimes []models.Showtime
		for _, showtime := range showtimes {
			if showtime.TheaterID == theater.ID {
				theaterShowtimes = append(theaterShowtimes, showtime)
			}
		}

		// Group showtimes by date
		showtimesByDate := make(map[string][]map[string]interface{})
		for _, showtime := range theaterShowtimes {
			dateKey := showtime.ShowDate.Format("2006-01-02")

			availableSeats := showtime.AvailableSeats()

			showtimeData := map[string]interface{}{
				"id":          showtime.ID.Hex(),
				"time":        showtime.ShowTime.Format("3:04 PM"),
				"price":       fmt.Sprintf("$%.2f", showtime.Pricing.Regular.TotalPrice),
				"seats":       availableSeats,
				"format":      showtime.Format,
				"language":    showtime.Language,
				"screen_name": h.getScreenName(theater, showtime.ScreenID),
			}

			showtimesByDate[dateKey] = append(showtimesByDate[dateKey], showtimeData)
		}

		// For today's showtimes (backward compatibility with frontend)
		todayKey := time.Now().Format("2006-01-02")
		todayShowtimes := showtimesByDate[todayKey]
		if todayShowtimes == nil {
			todayShowtimes = []map[string]interface{}{}
		}

		theaterData := map[string]interface{}{
			"id":        theater.ID.Hex(),
			"name":      theater.Name,
			"address":   theater.Address,
			"phone":     theater.Phone,
			"rating":    theater.Rating,
			"distance":  theater.Distance,
			"amenities": theater.Amenities,
			"showtimes": todayShowtimes,  // Today's showtimes for backward compatibility
			"schedule":  showtimesByDate, // All showtimes grouped by date
		}

		response = append(response, theaterData)
	}

	return response
}

// getScreenName returns the screen name for a given screen ID
func (h *TheatersHandler) getScreenName(theater models.Theater, screenID bson.ObjectID) string {
	for _, screen := range theater.Screens {
		if screen.ID == screenID {
			return screen.Name
		}
	}
	return "Screen"
}

// CreateTheater creates a new theater
func (h *TheatersHandler) CreateTheater() fiber.Handler {
	return func(c *fiber.Ctx) error {
		var theaterData models.Theater
		if err := c.BodyParser(&theaterData); err != nil {
			return c.Status(400).JSON(fiber.Map{
				"success": false,
				"error":   "Invalid request body",
			})
		}

		// Set timestamps
		now := time.Now()
		theaterData.CreatedAt = now
		theaterData.UpdatedAt = now

		// Generate IDs for screens
		for i := range theaterData.Screens {
			theaterData.Screens[i].ID = bson.NewObjectID()
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		result, err := h.theatersCollection.InsertOne(ctx, theaterData)
		if err != nil {
			log.Printf("Error creating theater: %v", err)
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to create theater",
			})
		}

		theaterData.ID = result.InsertedID.(bson.ObjectID)

		return c.Status(201).JSON(fiber.Map{
			"success": true,
			"data":    theaterData,
		})
	}
}

// GetAllTheaters returns all theaters
func (h *TheatersHandler) GetAllTheaters() fiber.Handler {
	return func(c *fiber.Ctx) error {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		cursor, err := h.theatersCollection.Find(ctx, bson.M{})
		if err != nil {
			log.Printf("Error finding theaters: %v", err)
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to fetch theaters",
			})
		}
		defer cursor.Close(ctx)

		var theaters []models.Theater
		if err := cursor.All(ctx, &theaters); err != nil {
			log.Printf("Error decoding theaters: %v", err)
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to decode theaters",
			})
		}

		return c.JSON(fiber.Map{
			"success": true,
			"data":    theaters,
		})
	}
}

// GetTheaterByID returns a specific theater
func (h *TheatersHandler) GetTheaterByID() fiber.Handler {
	return func(c *fiber.Ctx) error {
		theaterIDStr := c.Params("id")
		theaterID, err := bson.ObjectIDFromHex(theaterIDStr)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{
				"success": false,
				"error":   "Invalid theater ID",
			})
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var theater models.Theater
		err = h.theatersCollection.FindOne(ctx, bson.M{"_id": theaterID}).Decode(&theater)
		if err != nil {
			if err == mongo.ErrNoDocuments {
				return c.Status(404).JSON(fiber.Map{
					"success": false,
					"error":   "Theater not found",
				})
			}
			log.Printf("Error finding theater: %v", err)
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to fetch theater",
			})
		}

		return c.JSON(fiber.Map{
			"success": true,
			"data":    theater,
		})
	}
}
