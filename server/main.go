package main

import (
	"log"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
	"github.com/tejas161/Cinema-Flix/internal/routes"
)

func main() {
	_ = godotenv.Load()

	app := fiber.New()

	// Add request logging middleware
	app.Use(logger.New(logger.Config{
		Format:     "[${time}] ${status} - ${method} ${path} - ${ip} - ${latency}\n",
		TimeFormat: "2006-01-02 15:04:05",
		TimeZone:   "Local",
	}))

	// Add custom authentication logging middleware
	app.Use(func(c *fiber.Ctx) error {
		start := time.Now()

		// Log incoming requests to auth endpoints
		if c.Path() == "/auth/google/login" || c.Path() == "/auth/google/callback" || c.Path() == "/auth/logout" {
			log.Printf("[REQUEST] %s %s from %s", c.Method(), c.Path(), c.IP())
			log.Printf("  User Agent: %s", c.Get("User-Agent"))
			log.Printf("  Query Params: %s", c.Request().URI().QueryArgs())
		}

		// Continue to next middleware
		err := c.Next()

		// Log response for auth endpoints
		if c.Path() == "/auth/google/login" || c.Path() == "/auth/google/callback" || c.Path() == "/auth/logout" {
			duration := time.Since(start)
			log.Printf("[RESPONSE] %s %s - Status: %d - Duration: %v",
				c.Method(), c.Path(), c.Response().StatusCode(), duration)
		}

		return err
	})

	// Get environment variables
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	clientURL := os.Getenv("CLIENT_URL")
	if clientURL == "" {
		clientURL = "http://localhost:3000"
	}

	// Add CORS middleware
	app.Use(cors.New(cors.Config{
		AllowOrigins:     clientURL,
		AllowHeaders:     "Origin, Content-Type, Accept, X-User-ID, X-User-Email",
		AllowMethods:     "GET, POST, PUT, DELETE, OPTIONS",
		AllowCredentials: true,
	}))

	// Register routes
	routes.SetupRoutes(app)

	log.Printf("[SERVER] Cinema Flix Backend Starting...")
	log.Printf("  Port: %s", port)
	log.Printf("  Client URL: %s", clientURL)
	log.Printf("  Started at: %s", time.Now().Format("2006-01-02 15:04:05"))
	log.Printf("[SERVER] Server is ready and listening on port %s", port)

	log.Fatal(app.Listen(":" + port))
}
