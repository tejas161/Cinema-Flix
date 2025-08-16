package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/url"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/tejas161/Cinema-Flix/db"
	"github.com/tejas161/Cinema-Flix/models"
	"golang.org/x/oauth2"
)

// GoogleLogin returns a handler function for Google OAuth login
func GoogleLogin(googleConfig *oauth2.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Log the login attempt

		log.Printf("[AUTH] Login attempt initiated")
		log.Printf("  Redirect URI: %s", googleConfig.RedirectURL)

		url := googleConfig.AuthCodeURL("cinema-flix-random-state", oauth2.AccessTypeOffline)

		log.Printf("  Redirecting to Google OAuth: %s", url)

		return c.Redirect(url, fiber.StatusTemporaryRedirect)
	}
}

// UserInfo represents the user data structure
type UserInfo struct {
	ID      string `json:"id"`
	Email   string `json:"email"`
	Name    string `json:"name"`
	Picture string `json:"picture"`
}

// GoogleCallback returns a handler function for Google OAuth callback
func GoogleCallback(googleConfig *oauth2.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		clientIP := c.IP()
		code := c.Query("code")
		state := c.Query("state")

		log.Printf("[AUTH] OAuth callback received")
		log.Printf("  Client IP: %s", clientIP)
		log.Printf("  Auth Code: %s...", code[:min(len(code), 20)]) // Only show first 20 chars for security
		log.Printf("  State: %s", state)

		if code == "" {
			log.Printf("[AUTH] ERROR: No authorization code received")
			return c.Redirect(getClientURL()+"/login?error=auth_failed", fiber.StatusTemporaryRedirect)
		}

		// Exchange authorization code for token
		log.Printf("[AUTH] Exchanging authorization code for token...")
		token, err := googleConfig.Exchange(context.Background(), code)
		if err != nil {
			log.Printf("[AUTH] ERROR: Token exchange failed: %v", err)
			log.Printf("  Client IP: %s", clientIP)
			return c.Redirect(getClientURL()+"/login?error=auth_failed", fiber.StatusTemporaryRedirect)
		}

		log.Printf("[AUTH] Token exchange successful")

		// Get user information from Google
		log.Printf("[AUTH] Fetching user information from Google...")
		client := googleConfig.Client(context.Background(), token)
		resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
		if err != nil {
			log.Printf("[AUTH] ERROR: Failed to get user info: %v", err)
			log.Printf("  Client IP: %s", clientIP)
			return c.Redirect(getClientURL()+"/login?error=user_info_failed", fiber.StatusTemporaryRedirect)
		}
		defer resp.Body.Close()

		var userInfo UserInfo
		if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
			return c.Redirect(getClientURL()+"/login?error=decode_failed", fiber.StatusTemporaryRedirect)
		}

		// Save/update user in MongoDB
		log.Printf("[AUTH] Saving user to database...")
		userRepo := db.NewUserRepository()

		// Create user model from Google user info
		user := models.NewUser(userInfo.ID, userInfo.Email, userInfo.Name, userInfo.Picture)

		// Upsert user in database
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		savedUser, err := userRepo.UpsertUser(ctx, user)
		if err != nil {
			log.Printf("[AUTH] ERROR: Failed to save user to database: %v", err)
			return c.Redirect(getClientURL()+"/login?error=database_failed", fiber.StatusTemporaryRedirect)
		}

		log.Printf("[AUTH] User successfully saved to database")

		// Create response with database user info
		responseData := fiber.Map{
			"id":         savedUser.ID.Hex(),
			"google_id":  savedUser.GoogleID,
			"email":      savedUser.Email,
			"name":       savedUser.Name,
			"picture":    savedUser.Picture,
			"created_at": savedUser.CreatedAt,
			"updated_at": savedUser.UpdatedAt,
		}

		// Encode user data as URL parameters
		userDataJSON, err := json.Marshal(responseData)
		if err != nil {
			log.Printf("[AUTH] ERROR: Failed to marshal user data: %v", err)
			return c.Redirect(getClientURL()+"/login?error=marshal_failed", fiber.StatusTemporaryRedirect)
		}
		encodedUserData := url.QueryEscape(string(userDataJSON))

		log.Printf("[AUTH] Redirecting user to frontend...")
		log.Printf("  Redirect URL: %s/auth/callback", getClientURL())

		// Redirect to frontend with user data
		return c.Redirect(getClientURL()+"/auth/callback?user="+encodedUserData, fiber.StatusTemporaryRedirect)
	}
}

// Helper functions
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func getCurrentTimestamp() string {
	return time.Now().Format("2006-01-02 15:04:05")
}

func getClientURL() string {
	clientURL := os.Getenv("CLIENT_URL")
	if clientURL == "" {
		clientURL = "http://localhost:3000" // fallback to default
	}
	return clientURL
}

// GetUser returns user information by user ID
func GetUser() fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := c.Params("id")
		if userID == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"error":   "User ID is required",
			})
		}

		// Get user from database
		userRepo := db.NewUserRepository()
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		user, err := userRepo.FindUserByID(ctx, userID)
		if err != nil {
			log.Printf("[AUTH] ERROR: Failed to get user from database: %v", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to retrieve user information",
			})
		}

		if user == nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"success": false,
				"error":   "User not found",
			})
		}

		return c.JSON(fiber.Map{
			"success": true,
			"user": fiber.Map{
				"id":         user.ID.Hex(),
				"google_id":  user.GoogleID,
				"email":      user.Email,
				"name":       user.Name,
				"picture":    user.Picture,
				"created_at": user.CreatedAt,
				"updated_at": user.UpdatedAt,
			},
		})
	}
}

// Logout handles user logout
func Logout() fiber.Handler {
	return func(c *fiber.Ctx) error {

		log.Printf("[AUTH] User logout initiated")

		// In a real application, you might want to:
		// - Invalidate tokens in database
		// - Clear server-side sessions
		// - Log to audit trail

		log.Printf("[AUTH] User logout completed successfully")

		return c.JSON(fiber.Map{
			"success":   true,
			"message":   "Logged out successfully",
			"timestamp": getCurrentTimestamp(),
		})
	}
}

// GetProfile returns the current user's profile information
// This endpoint requires authentication via middleware
func GetProfile() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// User info is available from middleware context
		user := c.Locals("user")
		if user == nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"error":   "Authentication required",
			})
		}

		// Type assert the user
		userModel, ok := user.(*models.User)
		if !ok {
			log.Printf("[AUTH] ERROR: Invalid user type in context")
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"error":   "Internal server error",
			})
		}

		return c.JSON(fiber.Map{
			"success": true,
			"user": fiber.Map{
				"id":         userModel.ID.Hex(),
				"google_id":  userModel.GoogleID,
				"email":      userModel.Email,
				"name":       userModel.Name,
				"picture":    userModel.Picture,
				"created_at": userModel.CreatedAt,
				"updated_at": userModel.UpdatedAt,
			},
		})
	}
}
