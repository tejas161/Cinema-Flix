package config

import (
	"log"
	"os"

	"github.com/joho/godotenv" // third-party: load env vars
)

type Config struct {
	Port string
}

// LoadConfig loads environment variables from .env and OS environment
func LoadConfig() Config {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	return Config{
		Port: port,
	}
}
