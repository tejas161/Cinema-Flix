package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

// Booking represents a movie ticket booking
type Booking struct {
	ID              bson.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	BookingID       string        `bson:"booking_id" json:"booking_id"`           // Unique booking ID
	GoogleUserID    string        `bson:"google_user_id" json:"google_user_id"`   // Google Client ID
	UserEmail       string        `bson:"user_email" json:"user_email"`           // User's Google email
	UserName        string        `bson:"user_name" json:"user_name"`             // User's Google display name
	UserPicture     string        `bson:"user_picture" json:"user_picture"`       // User's Google profile picture
	ShowtimeID      bson.ObjectID `bson:"showtime_id" json:"showtime_id"`         // Reference to Showtime
	MovieID         int           `bson:"movie_id" json:"movie_id"`               // TMDB Movie ID
	TheaterID       bson.ObjectID `bson:"theater_id" json:"theater_id"`           // Reference to Theater
	ScreenID        bson.ObjectID `bson:"screen_id" json:"screen_id"`             // Reference to Screen
	ShowDate        time.Time     `bson:"show_date" json:"show_date"`             // Date of the show
	ShowTime        time.Time     `bson:"show_time" json:"show_time"`             // Time of the show
	Seats           []BookedSeat  `bson:"seats" json:"seats"`                     // Booked seats
	TotalSeats      int           `bson:"total_seats" json:"total_seats"`         // Number of seats booked
	Pricing         BookingPricing `bson:"pricing" json:"pricing"`               // Pricing breakdown
	PaymentStatus   string        `bson:"payment_status" json:"payment_status"`   // pending, completed, failed, refunded
	BookingStatus   string        `bson:"booking_status" json:"booking_status"`   // confirmed, cancelled, expired
	PaymentMethod   string        `bson:"payment_method" json:"payment_method"`   // card, wallet, upi, netbanking
	TransactionID   string        `bson:"transaction_id" json:"transaction_id"`   // Payment gateway transaction ID
	BookedAt        time.Time     `bson:"booked_at" json:"booked_at"`             // When booking was made
	ExpiresAt       time.Time     `bson:"expires_at" json:"expires_at"`           // When booking expires (if unpaid)
	CreatedAt       time.Time     `bson:"created_at" json:"created_at"`
	UpdatedAt       time.Time     `bson:"updated_at" json:"updated_at"`
}

// BookedSeat represents a seat in a booking
type BookedSeat struct {
	SeatID     string  `bson:"seat_id" json:"seat_id"`         // A1, A2, B1, etc.
	RowID      string  `bson:"row_id" json:"row_id"`           // A, B, C, etc.
	SeatNumber int     `bson:"seat_number" json:"seat_number"` // 1, 2, 3, etc.
	SeatType   string  `bson:"seat_type" json:"seat_type"`     // premium, regular
	Price      float64 `bson:"price" json:"price"`             // Price paid for this seat
}

// BookingPricing represents the pricing breakdown for a booking
type BookingPricing struct {
	BaseAmount      float64 `bson:"base_amount" json:"base_amount"`           // Total base price of seats
	ConvenienceFee  float64 `bson:"convenience_fee" json:"convenience_fee"`   // Platform convenience fee
	Tax             float64 `bson:"tax" json:"tax"`                           // Tax amount
	Discount        float64 `bson:"discount" json:"discount"`                 // Discount applied
	TotalAmount     float64 `bson:"total_amount" json:"total_amount"`         // Final amount to be paid
	PaidAmount      float64 `bson:"paid_amount" json:"paid_amount"`           // Amount actually paid
}

// CustomerInfo represents customer information for booking
type CustomerInfo struct {
	Name  string `bson:"name" json:"name"`
	Email string `bson:"email" json:"email"`
	Phone string `bson:"phone" json:"phone"`
}

// GoogleUserInfo represents Google user information for booking
type GoogleUserInfo struct {
	GoogleID string `json:"google_id"`
	Email    string `json:"email"`
	Name     string `json:"name"`
	Picture  string `json:"picture"`
}

// NewBooking creates a new Booking instance with Google user data
func NewBooking(bookingID string, userInfo GoogleUserInfo, showtimeID, movieID, theaterID, screenID interface{}, showDate, showTime time.Time) *Booking {
	now := time.Now()
	expiresAt := now.Add(15 * time.Minute) // Booking expires in 15 minutes if not paid
	
	// Convert interfaces to appropriate types
	var (
		showtimeObjID bson.ObjectID
		theaterObjID  bson.ObjectID
		screenObjID   bson.ObjectID
		movieIDInt    int
	)
	
	if oid, ok := showtimeID.(bson.ObjectID); ok {
		showtimeObjID = oid
	}
	if oid, ok := theaterID.(bson.ObjectID); ok {
		theaterObjID = oid
	}
	if oid, ok := screenID.(bson.ObjectID); ok {
		screenObjID = oid
	}
	if mid, ok := movieID.(int); ok {
		movieIDInt = mid
	}
	
	return &Booking{
		BookingID:       bookingID,
		GoogleUserID:    userInfo.GoogleID,
		UserEmail:       userInfo.Email,
		UserName:        userInfo.Name,
		UserPicture:     userInfo.Picture,
		ShowtimeID:      showtimeObjID,
		MovieID:         movieIDInt,
		TheaterID:       theaterObjID,
		ScreenID:        screenObjID,
		ShowDate:        showDate,
		ShowTime:        showTime,
		Seats:           []BookedSeat{},
		PaymentStatus:   "pending",
		BookingStatus:   "confirmed",
		BookedAt:        now,
		ExpiresAt:       expiresAt,
		CreatedAt:       now,
		UpdatedAt:       now,
	}
}

// UpdateTimestamp updates the UpdatedAt field
func (b *Booking) UpdateTimestamp() {
	b.UpdatedAt = time.Now()
}

// IsExpired checks if the booking has expired
func (b *Booking) IsExpired() bool {
	return time.Now().After(b.ExpiresAt) && b.PaymentStatus == "pending"
}

// AddSeat adds a seat to the booking
func (b *Booking) AddSeat(seatID, rowID string, seatNumber int, seatType string, price float64) {
	seat := BookedSeat{
		SeatID:     seatID,
		RowID:      rowID,
		SeatNumber: seatNumber,
		SeatType:   seatType,
		Price:      price,
	}
	b.Seats = append(b.Seats, seat)
	b.TotalSeats = len(b.Seats)
	b.UpdateTimestamp()
}

// CalculatePricing calculates the total pricing for the booking
func (b *Booking) CalculatePricing(convenienceFeePercent, taxPercent, discount float64) {
	baseAmount := 0.0
	for _, seat := range b.Seats {
		baseAmount += seat.Price
	}
	
	convenienceFee := baseAmount * convenienceFeePercent / 100
	taxableAmount := baseAmount + convenienceFee - discount
	tax := taxableAmount * taxPercent / 100
	totalAmount := baseAmount + convenienceFee + tax - discount
	
	b.Pricing = BookingPricing{
		BaseAmount:     baseAmount,
		ConvenienceFee: convenienceFee,
		Tax:            tax,
		Discount:       discount,
		TotalAmount:    totalAmount,
		PaidAmount:     0,
	}
	b.UpdateTimestamp()
}

// MarkAsPaid marks the booking as paid
func (b *Booking) MarkAsPaid(transactionID, paymentMethod string, paidAmount float64) {
	b.PaymentStatus = "completed"
	b.TransactionID = transactionID
	b.PaymentMethod = paymentMethod
	b.Pricing.PaidAmount = paidAmount
	b.UpdateTimestamp()
}

// Cancel cancels the booking
func (b *Booking) Cancel() {
	b.BookingStatus = "cancelled"
	b.UpdateTimestamp()
}