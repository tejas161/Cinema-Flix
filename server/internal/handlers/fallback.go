package handlers

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/tejas161/Cinema-Flix/models"
	"go.mongodb.org/mongo-driver/v2/bson"
)

// CreateShowtimesForMovie creates showtimes for any movie ID (called once per movie)
func (h *TheatersHandler) CreateShowtimesForMovie(movieID int) error {
	log.Printf("[SHOWTIMES] Creating showtimes for movie ID: %d", movieID)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Quick check - do showtimes already exist?
	existingCount, err := h.showtimesCollection.CountDocuments(ctx, bson.M{
		"movie_id": movieID,
		"status":   "active",
	})
	if err != nil {
		return fmt.Errorf("failed to check existing showtimes: %v", err)
	}
	
	if existingCount > 0 {
		log.Printf("[SHOWTIMES] Movie %d already has %d showtimes, skipping", movieID, existingCount)
		return nil
	}

	// Get all theaters
	theaters, err := h.getAllTheaters(ctx)
	if err != nil {
		return fmt.Errorf("failed to get theaters: %v", err)
	}

	if len(theaters) == 0 {
		return fmt.Errorf("no theaters found")
	}

	// Create showtimes for this movie
	showtimes := h.generateShowtimesForMovie(movieID, theaters)
	
	if len(showtimes) > 0 {
		var documents []interface{}
		for i := range showtimes {
			showtimes[i].ID = bson.NewObjectID()
			documents = append(documents, showtimes[i])
		}

		_, err := h.showtimesCollection.InsertMany(ctx, documents)
		if err != nil {
			return fmt.Errorf("failed to insert showtimes: %v", err)
		}

		log.Printf("[SHOWTIMES] Successfully created %d showtimes for movie ID: %d", len(documents), movieID)
	}

	return nil
}

func (h *TheatersHandler) getAllTheaters(ctx context.Context) ([]models.Theater, error) {
	cursor, err := h.theatersCollection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var theaters []models.Theater
	if err := cursor.All(ctx, &theaters); err != nil {
		return nil, err
	}

	return theaters, nil
}

func (h *TheatersHandler) generateShowtimesForMovie(movieID int, theaters []models.Theater) []models.Showtime {
	var showtimes []models.Showtime
	staticDate := time.Date(2025, 9, 28, 0, 0, 0, 0, time.UTC)

	for _, theater := range theaters {
		for _, screen := range theater.Screens {
			// Different show times based on screen type
			var timeStrings []string
			switch screen.Type {
			case "IMAX", "4DX", "Premium":
				timeStrings = []string{"11:30 AM", "3:00 PM", "7:30 PM"}
			default:
				timeStrings = []string{"3:00 PM", "7:30 PM"}
			}

			for _, timeStr := range timeStrings {
				// Parse time
				parsedTime, err := time.Parse("3:04 PM", timeStr)
				if err != nil {
					continue
				}
				
				showTime := time.Date(staticDate.Year(), staticDate.Month(), staticDate.Day(),
					parsedTime.Hour(), parsedTime.Minute(), 0, 0, staticDate.Location())

				showtime := models.NewShowtime(
					movieID,
					theater.ID,
					screen.ID,
					staticDate,
					showTime,
					140, // Duration
					"English",
					screen.Type,
				)
				
				showtime.TimeString = timeStr
				showtime.Pricing = h.getStandardPricing(screen.Type)
				showtime.Seats = h.initializeSeatsForShowtime(screen)
				showtime.TotalSeats = screen.TotalSeats
				showtime.BookedSeats = h.getRandomBookedCount(screen.TotalSeats)

				showtimes = append(showtimes, *showtime)
			}
		}
	}

	return showtimes
}

func (h *TheatersHandler) getStandardPricing(screenType string) models.ShowPricing {
	premiumBase := 380.0
	regularBase := 280.0
	
	switch screenType {
	case "IMAX":
		premiumBase = 650.0
		regularBase = 500.0
	case "4DX":
		premiumBase = 850.0
		regularBase = 650.0
	case "3D":
		premiumBase = 450.0
		regularBase = 330.0
	case "Premium":
		premiumBase = 1200.0
		regularBase = 950.0
	}

	return models.ShowPricing{
		Premium: models.PriceRange{
			BasePrice:      premiumBase,
			ConvenienceFee: premiumBase * 0.02,
			Tax:            (premiumBase + premiumBase*0.02) * 0.18,
			TotalPrice:     premiumBase + (premiumBase * 0.02) + ((premiumBase + premiumBase*0.02) * 0.18),
		},
		Regular: models.PriceRange{
			BasePrice:      regularBase,
			ConvenienceFee: regularBase * 0.02,
			Tax:            (regularBase + regularBase*0.02) * 0.18,
			TotalPrice:     regularBase + (regularBase * 0.02) + ((regularBase + regularBase*0.02) * 0.18),
		},
	}
}

func (h *TheatersHandler) initializeSeatsForShowtime(screen models.Screen) []models.Seat {
	var seats []models.Seat
	
	for _, row := range screen.SeatLayout.Rows {
		for i := 1; i <= row.SeatCount; i++ {
			seat := models.Seat{
				SeatID:     fmt.Sprintf("%s%d", row.RowID, i),
				RowID:      row.RowID,
				SeatNumber: i,
				SeatType:   row.RowType,
				Status:     "available",
				Price:      row.Price.Morning,
			}
			seats = append(seats, seat)
		}
	}
	
	return seats
}

func (h *TheatersHandler) getRandomBookedCount(totalSeats int) int {
	// Return reasonable booked seats for demo
	if totalSeats > 200 {
		return 35
	} else if totalSeats > 100 {
		return 25
	}
	return 15
}