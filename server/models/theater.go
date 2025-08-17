package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

// Theater represents a movie theater
type Theater struct {
	ID          bson.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Name        string        `bson:"name" json:"name"`
	Address     string        `bson:"address" json:"address"`
	Phone       string        `bson:"phone" json:"phone"`
	Email       string        `bson:"email" json:"email"`
	Rating      float64       `bson:"rating" json:"rating"`
	Distance    string        `bson:"distance" json:"distance"`
	City        string        `bson:"city" json:"city"`
	State       string        `bson:"state" json:"state"`
	Pincode     string        `bson:"pincode" json:"pincode"`
	Amenities   []string      `bson:"amenities" json:"amenities"`
	Coordinates struct {
		Latitude  float64 `bson:"latitude" json:"latitude"`
		Longitude float64 `bson:"longitude" json:"longitude"`
	} `bson:"coordinates" json:"coordinates"`
	Screens   []Screen  `bson:"screens" json:"screens"`
	CreatedAt time.Time `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time `bson:"updated_at" json:"updated_at"`
}

// Screen represents a screen within a theater
type Screen struct {
	ID           bson.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Name         string        `bson:"name" json:"name"`
	Type         string        `bson:"type" json:"type"` // IMAX, 3D, 4DX, Standard
	TotalSeats   int           `bson:"total_seats" json:"total_seats"`
	SeatLayout   SeatLayout    `bson:"seat_layout" json:"seat_layout"`
	SoundSystem  string        `bson:"sound_system" json:"sound_system"`
	ScreenSize   string        `bson:"screen_size" json:"screen_size"`
	Features     []string      `bson:"features" json:"features"`
}

// SeatLayout represents the seating arrangement
type SeatLayout struct {
	Rows    []SeatRow `bson:"rows" json:"rows"`
	Premium []string  `bson:"premium" json:"premium"` // Premium seat row identifiers
	Regular []string  `bson:"regular" json:"regular"` // Regular seat row identifiers
}

// SeatRow represents a row of seats
type SeatRow struct {
	RowID    string `bson:"row_id" json:"row_id"`     // A, B, C, etc.
	RowType  string `bson:"row_type" json:"row_type"` // premium, regular
	SeatCount int   `bson:"seat_count" json:"seat_count"`
	Price     Price  `bson:"price" json:"price"`
}

// Price represents pricing for different times
type Price struct {
	Morning   float64 `bson:"morning" json:"morning"`     // Before 12 PM
	Afternoon float64 `bson:"afternoon" json:"afternoon"` // 12 PM - 6 PM
	Evening   float64 `bson:"evening" json:"evening"`     // 6 PM - 9 PM
	Night     float64 `bson:"night" json:"night"`         // After 9 PM
}

// NewTheater creates a new Theater instance
func NewTheater(name, address, phone, email, city, state, pincode string, amenities []string) *Theater {
	now := time.Now()
	return &Theater{
		Name:      name,
		Address:   address,
		Phone:     phone,
		Email:     email,
		City:      city,
		State:     state,
		Pincode:   pincode,
		Amenities: amenities,
		Rating:    4.0, // Default rating
		CreatedAt: now,
		UpdatedAt: now,
	}
}

// UpdateTimestamp updates the UpdatedAt field
func (t *Theater) UpdateTimestamp() {
	t.UpdatedAt = time.Now()
}