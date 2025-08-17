package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

// Showtime represents a movie showtime
type Showtime struct {
	ID         bson.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	MovieID    int           `bson:"movie_id" json:"movie_id"`       // TMDB Movie ID
	TheaterID  bson.ObjectID `bson:"theater_id" json:"theater_id"`   // Reference to Theater
	ScreenID   bson.ObjectID `bson:"screen_id" json:"screen_id"`     // Reference to Screen
	ShowDate   time.Time     `bson:"show_date" json:"show_date"`     // Date of the show
	ShowTime   time.Time     `bson:"show_time" json:"show_time"`     // Time of the show
	Duration   int           `bson:"duration" json:"duration"`       // Movie duration in minutes
	Language   string        `bson:"language" json:"language"`       // Movie language
	Format     string        `bson:"format" json:"format"`           // 2D, 3D, IMAX, 4DX
	Status     string        `bson:"status" json:"status"`           // active, cancelled, house_full
	Pricing    ShowPricing   `bson:"pricing" json:"pricing"`         // Pricing for this show
	Seats      []Seat        `bson:"seats" json:"seats"`             // Seat availability
	BookedSeats int          `bson:"booked_seats" json:"booked_seats"` // Count of booked seats
	TotalSeats  int          `bson:"total_seats" json:"total_seats"`   // Total seats available
	CreatedAt   time.Time     `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time     `bson:"updated_at" json:"updated_at"`
}

// ShowPricing represents pricing for different seat categories
type ShowPricing struct {
	Premium PriceRange `bson:"premium" json:"premium"`
	Regular PriceRange `bson:"regular" json:"regular"`
}

// PriceRange represents the price range for seat categories
type PriceRange struct {
	BasePrice    float64 `bson:"base_price" json:"base_price"`
	ConvenienceFee float64 `bson:"convenience_fee" json:"convenience_fee"`
	Tax          float64 `bson:"tax" json:"tax"`
	TotalPrice   float64 `bson:"total_price" json:"total_price"`
}

// Seat represents an individual seat in a showtime
type Seat struct {
	SeatID     string `bson:"seat_id" json:"seat_id"`         // A1, A2, B1, etc.
	RowID      string `bson:"row_id" json:"row_id"`           // A, B, C, etc.
	SeatNumber int    `bson:"seat_number" json:"seat_number"` // 1, 2, 3, etc.
	SeatType   string `bson:"seat_type" json:"seat_type"`     // premium, regular
	Status     string `bson:"status" json:"status"`           // available, booked, blocked, maintenance
	Price      float64 `bson:"price" json:"price"`            // Final price for this seat
	BookedBy   string `bson:"booked_by,omitempty" json:"booked_by,omitempty"` // User ID who booked
	BlockedAt  *time.Time `bson:"blocked_at,omitempty" json:"blocked_at,omitempty"` // When seat was temporarily blocked
}

// NewShowtime creates a new Showtime instance
func NewShowtime(movieID int, theaterID, screenID bson.ObjectID, showDate, showTime time.Time, duration int, language, format string) *Showtime {
	now := time.Now()
	return &Showtime{
		MovieID:     movieID,
		TheaterID:   theaterID,
		ScreenID:    screenID,
		ShowDate:    showDate,
		ShowTime:    showTime,
		Duration:    duration,
		Language:    language,
		Format:      format,
		Status:      "active",
		BookedSeats: 0,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
}

// UpdateTimestamp updates the UpdatedAt field
func (s *Showtime) UpdateTimestamp() {
	s.UpdatedAt = time.Now()
}

// IsAvailable checks if the showtime is available for booking
func (s *Showtime) IsAvailable() bool {
	return s.Status == "active" && s.ShowTime.After(time.Now())
}

// AvailableSeats returns the count of available seats
func (s *Showtime) AvailableSeats() int {
	return s.TotalSeats - s.BookedSeats
}

// GetSeatByID returns a seat by its ID
func (s *Showtime) GetSeatByID(seatID string) *Seat {
	for i := range s.Seats {
		if s.Seats[i].SeatID == seatID {
			return &s.Seats[i]
		}
	}
	return nil
}

// BookSeat marks a seat as booked
func (s *Showtime) BookSeat(seatID, userID string) bool {
	seat := s.GetSeatByID(seatID)
	if seat != nil && seat.Status == "available" {
		seat.Status = "booked"
		seat.BookedBy = userID
		s.BookedSeats++
		s.UpdateTimestamp()
		return true
	}
	return false
}

// BlockSeat temporarily blocks a seat (for payment processing)
func (s *Showtime) BlockSeat(seatID string, duration time.Duration) bool {
	seat := s.GetSeatByID(seatID)
	if seat != nil && seat.Status == "available" {
		seat.Status = "blocked"
		blockTime := time.Now()
		seat.BlockedAt = &blockTime
		s.UpdateTimestamp()
		return true
	}
	return false
}

// ReleaseSeat releases a blocked or booked seat
func (s *Showtime) ReleaseSeat(seatID string) bool {
	seat := s.GetSeatByID(seatID)
	if seat != nil && (seat.Status == "blocked" || seat.Status == "booked") {
		if seat.Status == "booked" {
			s.BookedSeats--
		}
		seat.Status = "available"
		seat.BookedBy = ""
		seat.BlockedAt = nil
		s.UpdateTimestamp()
		return true
	}
	return false
}