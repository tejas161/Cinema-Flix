package config

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

var (
	MongoClient *mongo.Client
	MongoDB     *mongo.Database
)

// InitMongoDB initializes the MongoDB connection to Atlas cluster
func InitMongoDB() error {
	uri := os.Getenv("MONGODB_URI")
	if uri == "" {
		return fmt.Errorf("MONGODB_URI environment variable is not set")
	}

	// Create context with timeout for connection
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Set client options
	clientOptions := options.Client().ApplyURI(uri)

	// Connect to MongoDB
	client, err := mongo.Connect(clientOptions)
	if err != nil {
		return fmt.Errorf("failed to connect to MongoDB: %w", err)
	}

	// Test the connection
	err = client.Ping(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to ping MongoDB: %w", err)
	}

	// Set global variables
	MongoClient = client
	MongoDB = client.Database("cinema_db")

	log.Println("[MONGO] Successfully connected to MongoDB Atlas")
	log.Printf("[MONGO] Database: %s", MongoDB.Name())

	return nil
}

// DisconnectMongoDB closes the MongoDB connection
func DisconnectMongoDB() error {
	if MongoClient != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		err := MongoClient.Disconnect(ctx)
		if err != nil {
			return fmt.Errorf("failed to disconnect from MongoDB: %w", err)
		}

		log.Println("[MONGO] Disconnected from MongoDB")
	}
	return nil
}

// GetCollection returns a MongoDB collection
func GetCollection(name string) *mongo.Collection {
	return MongoDB.Collection(name)
}
