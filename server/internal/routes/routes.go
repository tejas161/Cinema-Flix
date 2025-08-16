package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/tejas161/Cinema-Flix/internal/config"
	"github.com/tejas161/Cinema-Flix/internal/handlers"
	"github.com/tejas161/Cinema-Flix/internal/middleware"
)

func SetupRoutes(app *fiber.App) {
	// Initialize OAuth configuration
	oauthConfig := config.NewOAuthConfig()

	// Public routes
	app.Get("/health", handlers.HealthCheck)
	app.Get("/auth/google/login", handlers.GoogleLogin(oauthConfig.GoogleConfig))
	app.Get("/auth/google/callback", handlers.GoogleCallback(oauthConfig.GoogleConfig))
	app.Get("/api/user/:id", handlers.GetUser())
	app.Post("/auth/logout", handlers.Logout())

	// Protected routes (require authentication)
	app.Get("/api/profile", middleware.RequireAuth(), handlers.GetProfile())
}
