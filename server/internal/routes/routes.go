package routes

import (
    "github.com/gofiber/fiber/v2"
    "github.com/tejas161/Cinema-Flix/internal/handlers"
)

func SetupRoutes(app *fiber.App) {
    app.Get("/health", handlers.HealthCheck)
    app.Get("/auth/google/login", handlers.GoogleLogin)
    app.Get("/auth/google/callback", handlers.GoogleCallback)
}
