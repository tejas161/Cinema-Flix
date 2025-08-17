package middleware

import (
	"context"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/tejas161/Cinema-Flix/db"
)

// RequireAuth middleware validates user authentication
// Expects user ID to be passed in X-User-ID header
func RequireAuth() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Get user information from auth headers
		// Get userId from JSON body (googleId or id field)
		var userPayload struct {
			GoogleID string `json:"googleId"`
			ID       string `json:"id"`
		}
		_ = c.BodyParser(&userPayload)
		userID := userPayload.GoogleID
		if userID == "" {
			userID = userPayload.ID
		}

		log.Printf("google user id %s", userID);

		if userID == "" {
			return c.Status(401).JSON(fiber.Map{
				"success": false,
				"error":   "User authentication required",
			})
		}

		
		// Verify user exists in database
		userRepo := db.NewUserRepository()
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		user, err := userRepo.FindUserByID(ctx, userID)
		if err != nil {
			log.Printf("[AUTH] Database error during auth check: %v", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"error":   "Authentication verification failed",
			})
		}

		if user == nil {
			log.Printf("[AUTH] Invalid user ID in auth header: %s", userID)
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"error":   "Invalid authentication",
			})
		}

		// Store user info in context for use in handlers
		c.Locals("user", user)
		c.Locals("userID", user.ID.Hex())

		log.Printf("[AUTH] Authenticated user: %s (%s)", user.Name, user.Email)

		return c.Next()
	}
}

// OptionalAuth middleware validates user authentication if provided
// Similar to RequireAuth but doesn't fail if no auth is provided
func OptionalAuth() fiber.Handler {
	return func(c *fiber.Ctx) error {
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
			// No authentication provided, continue without user context
			return c.Next()
		}

		// Verify user exists in database
		userRepo := db.NewUserRepository()
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		user, err := userRepo.FindUserByID(ctx, userID)
		if err != nil {
			log.Printf("[AUTH] Database error during optional auth check: %v", err)
			// Continue without authentication on database error
			return c.Next()
		}

		if user == nil {
			log.Printf("[AUTH] Invalid user ID in optional auth header: %s", userID)
			// Continue without authentication for invalid user ID
			return c.Next()
		}

		// Store user info in context for use in handlers
		c.Locals("user", user)
		c.Locals("userID", user.ID.Hex())

		log.Printf("[AUTH] Optionally authenticated user: %s (%s)", user.Name, user.Email)

		return c.Next()
	}
}
