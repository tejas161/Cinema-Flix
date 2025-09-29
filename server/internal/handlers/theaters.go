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

		// Simple showtime query for demo (no date filtering needed)

		// Find all showtimes for this movie (no time filtering for demo)
		showtimeFilter := bson.M{
			"movie_id": movieID,
			"status":   "active",
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

		// If no showtimes exist, create them for this movie
		if len(showtimes) == 0 {
			log.Printf("[API] No showtimes found for movie %d, creating them...", movieID)
			
			// Create showtimes synchronously for this movie
			err := h.CreateShowtimesForMovie(movieID)
			if err != nil {
				log.Printf("[API] Failed to create showtimes for movie %d: %v", movieID, err)
				return c.JSON(fiber.Map{
					"success": true,
					"data":    []interface{}{},
					"message": "No theaters available for this movie at the moment.",
				})
			}

			// Now fetch the newly created showtimes
			showtimesCursor, err = h.showtimesCollection.Find(ctx, showtimeFilter)
			if err != nil {
				return c.Status(500).JSON(fiber.Map{
					"success": false,
					"error":   "Failed to fetch newly created showtimes",
				})
			}
			defer showtimesCursor.Close(ctx)

			if err := showtimesCursor.All(ctx, &showtimes); err != nil {
				return c.Status(500).JSON(fiber.Map{
					"success": false,
					"error":   "Failed to decode newly created showtimes",
				})
			}

			// Update theater IDs map with new showtimes
			theaterIDsMap = make(map[bson.ObjectID]bool)
			for _, showtime := range showtimes {
				theaterIDsMap[showtime.TheaterID] = true
			}

			theaterIDs = nil
			for theaterID := range theaterIDsMap {
				theaterIDs = append(theaterIDs, theaterID)
			}

			log.Printf("[API] Created and fetched %d showtimes for movie %d", len(showtimes), movieID)
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
		// Filter showtimes for this theater only
		var theaterShowtimes []models.Showtime
		for _, showtime := range showtimes {
			// CRITICAL: Only include showtimes that belong to THIS theater
			// Also filter out lock documents and creating status
			if showtime.TheaterID == theater.ID &&
				showtime.Status == "active" &&
				showtime.TimeString != "__CREATING__" &&
				showtime.Language != "test" {
				theaterShowtimes = append(theaterShowtimes, showtime)
			}
		}

		log.Printf("[DEBUG] Theater %s has %d filtered showtimes", theater.Name, len(theaterShowtimes))

		// Group showtimes by date
		showtimesByDate := make(map[string][]map[string]interface{})
		for _, showtime := range theaterShowtimes {
			dateKey := showtime.ShowDate.Format("2006-01-02")

			availableSeats := showtime.AvailableSeats()

			// Try multiple string fields - user's brilliant solution!
			var displayTime string
			if showtime.TimeString != "" {
				displayTime = showtime.TimeString
			} else if showtime.DisplayTime != "" {
				displayTime = showtime.DisplayTime
			} else if showtime.FormattedTime != "" {
				displayTime = showtime.FormattedTime
			} else {
				displayTime = showtime.ShowTime.Format("3:04 PM") // Fallback
			}

			showtimeData := map[string]interface{}{
				"id":          showtime.ID.Hex(),
				"time":        displayTime,
				"price":       fmt.Sprintf("₹%.0f", showtime.Pricing.Regular.TotalPrice),
				"seats":       availableSeats,
				"format":      showtime.Format,
				"language":    showtime.Language,
				"screen_name": h.getScreenName(theater, showtime.ScreenID),
			}

			showtimesByDate[dateKey] = append(showtimesByDate[dateKey], showtimeData)
		}

		// For static demo, use all showtimes regardless of date
		var allShowtimes []map[string]interface{}
		for _, showtimeList := range showtimesByDate {
			allShowtimes = append(allShowtimes, showtimeList...)
		}

		theaterData := map[string]interface{}{
			"id":        theater.ID.Hex(),
			"name":      theater.Name,
			"address":   theater.Address,
			"phone":     theater.Phone,
			"rating":    theater.Rating,
			"distance":  theater.Distance,
			"amenities": theater.Amenities,
			"showtimes": allShowtimes,    // All showtimes for static demo
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
