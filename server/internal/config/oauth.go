package config

import (
	"log"
	"os"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"github.com/joho/godotenv"
)

type OAuthConfig struct {
	GoogleConfig *oauth2.Config
}

// NewOAuthConfig creates and returns a new OAuth configuration
func NewOAuthConfig() *OAuthConfig {
	_ = godotenv.Load()
	
	clientID := os.Getenv("GOOGLE_CLIENT_ID")
	clientSecret := os.Getenv("GOOGLE_CLIENT_SECRET")
	redirectURL := os.Getenv("redirectURL")
	
	if clientID == "" {
		log.Fatal("GOOGLE_CLIENT_ID environment variable is not set. Please create a .env file with your Google OAuth credentials.")
	}
	
	if clientSecret == "" {
		log.Fatal("GOOGLE_CLIENT_SECRET environment variable is not set. Please create a .env file with your Google OAuth credentials.")
	}
	
	googleConfig := &oauth2.Config{
		RedirectURL:  redirectURL + "/auth/google/callback",
		ClientID:     clientID,
		ClientSecret: clientSecret,
		Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"},
		Endpoint:     google.Endpoint,
	}
	
	return &OAuthConfig{
		GoogleConfig: googleConfig,
	}
}
