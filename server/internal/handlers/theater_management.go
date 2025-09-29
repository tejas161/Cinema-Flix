package handlers

import (
	"context"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/tejas161/Cinema-Flix/models"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

// TheaterManagementHandler handles CRUD operations for theaters
type TheaterManagementHandler struct {
	collection *mongo.Collection
}

// NewTheaterManagementHandler creates a new theater management handler
func NewTheaterManagementHandler(collection *mongo.Collection) *TheaterManagementHandler {
	return &TheaterManagementHandler{
		collection: collection,
	}
}

// CreateTheater creates a new theater
func (h *TheaterManagementHandler) CreateTheater() fiber.Handler {
	return func(c *fiber.Ctx) error {
		var theater models.Theater
		
		if err := c.BodyParser(&theater); err != nil {
			return c.Status(400).JSON(fiber.Map{
				"success": false,
				"error":   "Invalid request body: " + err.Error(),
			})
		}

		// Validate required fields
		if theater.Name == "" {
			return c.Status(400).JSON(fiber.Map{
				"success": false,
				"error":   "Theater name is required",
			})
		}

		if theater.Address == "" {
			return c.Status(400).JSON(fiber.Map{
				"success": false,
				"error":   "Theater address is required",
			})
		}

		if len(theater.Screens) == 0 {
			return c.Status(400).JSON(fiber.Map{
				"success": false,
				"error":   "Theater must have at least one screen",
			})
		}

		// Set timestamps and IDs
		now := time.Now()
		theater.CreatedAt = now
		theater.UpdatedAt = now
		theater.ID = bson.NewObjectID()

		// Generate IDs for screens
		for i := range theater.Screens {
			theater.Screens[i].ID = bson.NewObjectID()
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		result, err := h.collection.InsertOne(ctx, theater)
		if err != nil {
			log.Printf("Error creating theater: %v", err)
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to create theater",
			})
		}

		theater.ID = result.InsertedID.(bson.ObjectID)

		log.Printf("Created new theater: %s with %d screens", theater.Name, len(theater.Screens))

		return c.Status(201).JSON(fiber.Map{
			"success": true,
			"data":    theater,
			"message": "Theater created successfully",
		})
	}
}

// GetAllTheaters retrieves all theaters
func (h *TheaterManagementHandler) GetAllTheaters() fiber.Handler {
	return func(c *fiber.Ctx) error {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		// Optional query parameters
		city := c.Query("city")
		state := c.Query("state")
		
		filter := bson.M{}
		if city != "" {
			filter["city"] = bson.M{"$regex": city, "$options": "i"}
		}
		if state != "" {
			filter["state"] = bson.M{"$regex": state, "$options": "i"}
		}

		cursor, err := h.collection.Find(ctx, filter)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to fetch theaters",
			})
		}
		defer cursor.Close(ctx)

		var theaters []models.Theater
		if err := cursor.All(ctx, &theaters); err != nil {
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to decode theaters",
			})
		}

		return c.JSON(fiber.Map{
			"success": true,
			"data":    theaters,
			"count":   len(theaters),
		})
	}
}

// GetTheaterByID retrieves a specific theater
func (h *TheaterManagementHandler) GetTheaterByID() fiber.Handler {
	return func(c *fiber.Ctx) error {
		theaterID := c.Params("id")
		
		objectID, err := bson.ObjectIDFromHex(theaterID)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{
				"success": false,
				"error":   "Invalid theater ID",
			})
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var theater models.Theater
		err = h.collection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&theater)
		if err != nil {
			if err == mongo.ErrNoDocuments {
				return c.Status(404).JSON(fiber.Map{
					"success": false,
					"error":   "Theater not found",
				})
			}
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

// UpdateTheater updates an existing theater
func (h *TheaterManagementHandler) UpdateTheater() fiber.Handler {
	return func(c *fiber.Ctx) error {
		theaterID := c.Params("id")
		
		objectID, err := bson.ObjectIDFromHex(theaterID)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{
				"success": false,
				"error":   "Invalid theater ID",
			})
		}

		var updateData models.Theater
		if err := c.BodyParser(&updateData); err != nil {
			return c.Status(400).JSON(fiber.Map{
				"success": false,
				"error":   "Invalid request body: " + err.Error(),
			})
		}

		// Update timestamp
		updateData.UpdatedAt = time.Now()
		updateData.ID = objectID

		// Generate IDs for new screens if they don't have them
		for i := range updateData.Screens {
			if updateData.Screens[i].ID.IsZero() {
				updateData.Screens[i].ID = bson.NewObjectID()
			}
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		result, err := h.collection.ReplaceOne(ctx, bson.M{"_id": objectID}, updateData)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to update theater",
			})
		}

		if result.MatchedCount == 0 {
			return c.Status(404).JSON(fiber.Map{
				"success": false,
				"error":   "Theater not found",
			})
		}

		log.Printf("Updated theater: %s", updateData.Name)

		return c.JSON(fiber.Map{
			"success": true,
			"data":    updateData,
			"message": "Theater updated successfully",
		})
	}
}

// DeleteTheater deletes a theater
func (h *TheaterManagementHandler) DeleteTheater() fiber.Handler {
	return func(c *fiber.Ctx) error {
		theaterID := c.Params("id")
		
		objectID, err := bson.ObjectIDFromHex(theaterID)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{
				"success": false,
				"error":   "Invalid theater ID",
			})
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		result, err := h.collection.DeleteOne(ctx, bson.M{"_id": objectID})
		if err != nil {
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to delete theater",
			})
		}

		if result.DeletedCount == 0 {
			return c.Status(404).JSON(fiber.Map{
				"success": false,
				"error":   "Theater not found",
			})
		}

		log.Printf("Deleted theater with ID: %s", theaterID)

		return c.JSON(fiber.Map{
			"success": true,
			"message": "Theater deleted successfully",
		})
	}
}

// BulkCreateTheaters creates multiple theaters at once
func (h *TheaterManagementHandler) BulkCreateTheaters() fiber.Handler {
	return func(c *fiber.Ctx) error {
		var theaters []models.Theater
		
		if err := c.BodyParser(&theaters); err != nil {
			return c.Status(400).JSON(fiber.Map{
				"success": false,
				"error":   "Invalid request body: " + err.Error(),
			})
		}

		if len(theaters) == 0 {
			return c.Status(400).JSON(fiber.Map{
				"success": false,
				"error":   "No theaters provided",
			})
		}

		// Validate and prepare theaters
		now := time.Now()
		var documents []interface{}
		
		for i := range theaters {
			if theaters[i].Name == "" {
				return c.Status(400).JSON(fiber.Map{
					"success": false,
					"error":   "Theater name is required for all theaters",
				})
			}

			theaters[i].ID = bson.NewObjectID()
			theaters[i].CreatedAt = now
			theaters[i].UpdatedAt = now

			// Generate IDs for screens
			for j := range theaters[i].Screens {
				theaters[i].Screens[j].ID = bson.NewObjectID()
			}

			documents = append(documents, theaters[i])
		}

		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()

		result, err := h.collection.InsertMany(ctx, documents)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to create theaters: " + err.Error(),
			})
		}

		log.Printf("Bulk created %d theaters", len(result.InsertedIDs))

		return c.Status(201).JSON(fiber.Map{
			"success": true,
			"data":    theaters,
			"count":   len(result.InsertedIDs),
			"message": "Theaters created successfully",
		})
	}
}

// GetTheaterStats returns statistics about theaters
func (h *TheaterManagementHandler) GetTheaterStats() fiber.Handler {
	return func(c *fiber.Ctx) error {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		// Count total theaters
		totalTheaters, err := h.collection.CountDocuments(ctx, bson.M{})
		if err != nil {
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to count theaters",
			})
		}

		// Get theaters by city
		pipeline := mongo.Pipeline{
			{{Key: "$group", Value: bson.M{
				"_id":   "$city",
				"count": bson.M{"$sum": 1},
			}}},
			{{Key: "$sort", Value: bson.M{"count": -1}}},
		}

		cursor, err := h.collection.Aggregate(ctx, pipeline)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to get theater statistics",
			})
		}
		defer cursor.Close(ctx)

		var cityStats []bson.M
		if err := cursor.All(ctx, &cityStats); err != nil {
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to decode statistics",
			})
		}

		return c.JSON(fiber.Map{
			"success": true,
			"data": fiber.Map{
				"total_theaters": totalTheaters,
				"by_city":        cityStats,
			},
		})
	}
}
