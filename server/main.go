package main

import (
    "log"
    "os"

    "github.com/gofiber/fiber/v2"
    "github.com/joho/godotenv"
    "github.com/tejas161/Cinema-Flix/internal/routes"
)

func main() {
    _ = godotenv.Load()

    app := fiber.New()

    // Register routes
    routes.SetupRoutes(app)

    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }

    log.Printf("Server running on port %s", port)
    log.Fatal(app.Listen(":" + port))
}
