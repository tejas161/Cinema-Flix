package db

import (
	"context"
	"fmt"
	"time"

	"github.com/tejas161/Cinema-Flix/internal/config"
	"github.com/tejas161/Cinema-Flix/models"
	"go.mongodb.org/mongo-driver/v2/bson"

	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

const UsersCollection = "users"

// UserRepository handles user database operations
type UserRepository struct {
	collection *mongo.Collection
}

// NewUserRepository creates a new UserRepository instance
func NewUserRepository() *UserRepository {
	return &UserRepository{
		collection: config.GetCollection(UsersCollection),
	}
}

// UpsertUser finds a user by googleId and updates their details if found,
// otherwise inserts a new user record
func (r *UserRepository) UpsertUser(ctx context.Context, user *models.User) (*models.User, error) {
	if ctx == nil {
		ctx = context.Background()
	}

	// Set timeout for the operation
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	// Create filter to find user by GoogleID
	filter := bson.M{"google_id": user.GoogleID}

	// Update the timestamp for upsert operation
	user.UpdateTimestamp()

	// Create update document
	update := bson.M{
		"$set": bson.M{
			"email":      user.Email,
			"name":       user.Name,
			"picture":    user.Picture,
			"updated_at": user.UpdatedAt,
		},
		"$setOnInsert": bson.M{
			"google_id":  user.GoogleID,
			"created_at": user.CreatedAt,
		},
	}

	// Set upsert options
	opts := options.UpdateOne().SetUpsert(true)

	// Perform the upsert operation
	result, err := r.collection.UpdateOne(ctx, filter, update, opts)
	if err != nil {
		return nil, fmt.Errorf("failed to upsert user: %w", err)
	}

	// If a new document was inserted, get the inserted ID
	if result.UpsertedID != nil {
		user.ID = result.UpsertedID.(bson.ObjectID)
	}

	// Find and return the updated/inserted user
	var updatedUser models.User
	err = r.collection.FindOne(ctx, filter).Decode(&updatedUser)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve upserted user: %w", err)
	}

	return &updatedUser, nil
}

// FindUserByGoogleID finds a user by their Google ID
func (r *UserRepository) FindUserByGoogleID(ctx context.Context, googleID string) (*models.User, error) {
	if ctx == nil {
		ctx = context.Background()
	}

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var user models.User
	filter := bson.M{"google_id": googleID}

	err := r.collection.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil // User not found
		}
		return nil, fmt.Errorf("failed to find user by Google ID: %w", err)
	}

	return &user, nil
}

// FindUserByID finds a user by their MongoDB ObjectID
func (r *UserRepository) FindUserByID(ctx context.Context, id string) (*models.User, error) {
	if ctx == nil {
		ctx = context.Background()
	}

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	objectID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID format: %w", err)
	}

	var user models.User
	filter := bson.M{"_id": objectID}

	err = r.collection.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil // User not found
		}
		return nil, fmt.Errorf("failed to find user by ID: %w", err)
	}

	return &user, nil
}
