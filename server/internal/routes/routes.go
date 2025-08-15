package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/tejas161/Cinema-Flix/internal/config"
	"github.com/tejas161/Cinema-Flix/internal/handlers"
)

func SetupRoutes(app *fiber.App) {
	// Initialize OAuth configuration
	oauthConfig := config.NewOAuthConfig()

	app.Get("/health", handlers.HealthCheck)
	app.Get("/auth/google/login", handlers.GoogleLogin(oauthConfig.GoogleConfig))
	app.Get("/auth/google/callback", handlers.GoogleCallback(oauthConfig.GoogleConfig))
	app.Post("/auth/logout", handlers.Logout())
}
