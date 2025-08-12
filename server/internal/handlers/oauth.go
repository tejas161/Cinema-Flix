package handlers

import (
    "context"
    "encoding/json"
    "log"
    "os"

    "github.com/gofiber/fiber/v2"
    "golang.org/x/oauth2"
    "golang.org/x/oauth2/google"
		"github.com/joho/godotenv"
)

var googleOauthConfig *oauth2.Config

func init() {
	_ = godotenv.Load()
    clientID := os.Getenv("GOOGLE_CLIENT_ID")
    clientSecret := os.Getenv("GOOGLE_CLIENT_SECRET")
    
    if clientID == "" {
        log.Fatal("GOOGLE_CLIENT_ID environment variable is not set. Please create a .env file with your Google OAuth credentials.")
    }
    
    if clientSecret == "" {
        log.Fatal("GOOGLE_CLIENT_SECRET environment variable is not set. Please create a .env file with your Google OAuth credentials.")
    }
    
    googleOauthConfig = &oauth2.Config{
        RedirectURL:  "http://localhost:8080/auth/google/callback", // change if needed
        ClientID:     clientID,
        ClientSecret: clientSecret,
        Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"},
        Endpoint:     google.Endpoint,
    }
}

func GoogleLogin(c *fiber.Ctx) error {
    url := googleOauthConfig.AuthCodeURL("cinema-flix-random-state", oauth2.AccessTypeOffline)
    return c.Redirect(url, fiber.StatusTemporaryRedirect)
}

func GoogleCallback(c *fiber.Ctx) error {
    code := c.Query("code")

    token, err := googleOauthConfig.Exchange(context.Background(), code)
    if err != nil {
        log.Println("Token exchange error:", err)
        return c.Status(fiber.StatusUnauthorized).SendString("Failed to exchange token")
    }

    client := googleOauthConfig.Client(context.Background(), token)
    resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
    if err != nil {
        log.Println("Failed to get user info:", err)
        return c.Status(fiber.StatusUnauthorized).SendString("Failed to get user info")
    }
    defer resp.Body.Close()

    var userInfo map[string]interface{}
    if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
        log.Println("Failed to decode user info:", err)
        return c.Status(fiber.StatusInternalServerError).SendString("Failed to decode user info")
    }

    log.Println("User info:", userInfo)

    // You can send response or redirect frontend here
    return c.JSON(userInfo)
}
