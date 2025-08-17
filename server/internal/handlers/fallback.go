package handlers

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/tejas161/Cinema-Flix/models"
	"go.mongodb.org/mongo-driver/v2/bson"
)

// CreateFallbackShowtimes creates showtimes for a movie that doesn't have any
func (h *TheatersHandler) CreateFallbackShowtimes(movieID int) error {
	log.Printf("[FALLBACK] Creating fallback showtimes for movie ID: %d", movieID)
	
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Get all theaters
	cursor, err := h.theatersCollection.Find(ctx, bson.M{})
	if err != nil {
		return err
	}
	defer cursor.Close(ctx)

	var theaters []models.Theater
	if err := cursor.All(ctx, &theaters); err != nil {
		return err
	}

	if len(theaters) == 0 {
		return fmt.Errorf("no theaters found")
	}

	var showtimes []models.Showtime
	today := time.Now()

	// Generate showtimes for next 7 days
	for i := 0; i < 7; i++ {
		showDate := today.AddDate(0, 0, i)
		startOfDay := time.Date(showDate.Year(), showDate.Month(), showDate.Day(), 0, 0, 0, 0, showDate.Location())

		for _, theater := range theaters {
			for _, screen := range theater.Screens {
				// Generate 3-4 showtimes per day per screen
				showTimes := []time.Time{
					startOfDay.Add(11*time.Hour + 0*time.Minute),  // 11:00 AM
					startOfDay.Add(15*time.Hour + 30*time.Minute), // 3:30 PM
					startOfDay.Add(19*time.Hour + 0*time.Minute),  // 7:00 PM
					startOfDay.Add(22*time.Hour + 15*time.Minute), // 10:15 PM
				}

				for _, showTime := range showTimes {
					// Skip past showtimes
					if showTime.Before(time.Now()) {
						continue
					}

					showtime := models.NewShowtime(
						movieID,
						theater.ID,
						screen.ID,
						startOfDay,
						showTime,
						140, // 2h 20m default duration
						"English",
						screen.Type,
					)

					// Set standard pricing
					showtime.Pricing = h.getStandardPricing(screen.Type)

					// Initialize seats
					showtime.Seats = h.initializeSeatsForFallback(screen)
					showtime.TotalSeats = screen.TotalSeats
					showtime.BookedSeats = h.getRandomBookedCount(screen.TotalSeats)

					showtimes = append(showtimes, *showtime)
				}
			}
		}
	}

	// Insert the fallback showtimes
	if len(showtimes) > 0 {
		var documents []interface{}
		for i := range showtimes {
			showtimes[i].ID = bson.NewObjectID()
			documents = append(documents, showtimes[i])
		}

		result, err := h.showtimesCollection.InsertMany(ctx, documents)
		if err != nil {
			return err
		}

		log.Printf("[FALLBACK] Successfully created %d fallback showtimes for movie ID: %d", len(result.InsertedIDs), movieID)
	}

	return nil
}

func (h *TheatersHandler) getStandardPricing(screenType string) models.ShowPricing {
	premiumBase := 15.99
	regularBase := 11.99
	
	switch screenType {
	case "IMAX":
		premiumBase = 20.99
		regularBase = 16.99
	case "4DX":
		premiumBase = 24.99
		regularBase = 19.99
	case "3D":
		premiumBase = 17.99
		regularBase = 13.99
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

func (h *TheatersHandler) initializeSeatsForFallback(screen models.Screen) []models.Seat {
	var seats []models.Seat

	for _, row := range screen.SeatLayout.Rows {
		for seatNum := 1; seatNum <= row.SeatCount; seatNum++ {
			seatID := fmt.Sprintf("%s%d", row.RowID, seatNum)
			
			var price float64
			switch row.RowType {
			case "premium":
				price = row.Price.Afternoon
			case "regular":
				price = row.Price.Afternoon
			default:
				price = row.Price.Afternoon
			}

			seat := models.Seat{
				SeatID:     seatID,
				RowID:      row.RowID,
				SeatNumber: seatNum,
				SeatType:   row.RowType,
				Status:     "available",
				Price:      price,
			}
			
			seats = append(seats, seat)
		}
	}

	return seats
}

func (h *TheatersHandler) getRandomBookedCount(totalSeats int) int {
	// 5-20% random booking for fallback
	minBooked := int(float64(totalSeats) * 0.05)
	maxBooked := int(float64(totalSeats) * 0.20)
	
	if minBooked == maxBooked {
		return minBooked
	}
	
	return minBooked + (int(time.Now().UnixNano()) % (maxBooked - minBooked))
}