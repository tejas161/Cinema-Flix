package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

// User represents a user in the cinema_db database
type User struct {
	ID        bson.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	GoogleID  string        `bson:"google_id" json:"google_id"`
	Email     string        `bson:"email" json:"email"`
	Name      string        `bson:"name" json:"name"`
	Picture   string        `bson:"picture" json:"picture"`
	CreatedAt time.Time     `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time     `bson:"updated_at" json:"updated_at"`
}

// NewUser creates a new User instance with current timestamps
func NewUser(googleID, email, name, picture string) *User {
	now := time.Now()
	return &User{
		GoogleID:  googleID,
		Email:     email,
		Name:      name,
		Picture:   picture,
		CreatedAt: now,
		UpdatedAt: now,
	}
}

// UpdateTimestamp updates the UpdatedAt field to current time
func (u *User) UpdateTimestamp() {
	u.UpdatedAt = time.Now()
}
