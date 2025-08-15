package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/url"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
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

		// Log successful authentication
		log.Printf("[AUTH] User authentication successful")
		log.Printf("  Email: %s", userInfo.Email)
		log.Printf("  Name: %s", userInfo.Name)
		log.Printf("  Picture: %s", userInfo.Picture)
		log.Printf("  Login Time: %s", getCurrentTimestamp())

		// Encode user data as URL parameters
		userDataJSON, _ := json.Marshal(userInfo)
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

// Logout handles user logout
func Logout() fiber.Handler {
	return func(c *fiber.Ctx) error {
		clientIP := c.IP()
		userAgent := c.Get("User-Agent")

		// Extract user info from request if available (e.g., from headers or body)
		userID := c.Get("X-User-ID")
		userEmail := c.Get("X-User-Email")

		log.Printf("[AUTH] User logout initiated")
		log.Printf("  Client IP: %s", clientIP)
		log.Printf("  User Agent: %s", userAgent)
		if userID != "" {
			log.Printf("  User ID: %s", userID)
		}
		if userEmail != "" {
			log.Printf("  Email: %s", userEmail)
		}
		log.Printf("  Logout Time: %s", getCurrentTimestamp())

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
