package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/tejas161/Cinema-Flix/internal/config"
	"github.com/tejas161/Cinema-Flix/internal/handlers"
	"github.com/tejas161/Cinema-Flix/internal/middleware"
)

func SetupRoutes(app *fiber.App) {
	// Initialize OAuth configuration
	oauthConfig := config.NewOAuthConfig()

	// Initialize handlers
	moviesHandler := handlers.NewMoviesHandler()
	theatersHandler := handlers.NewTheatersHandler()
	showtimesHandler := handlers.NewShowtimesHandler()
	bookingsHandler := handlers.NewBookingsHandler()

	// Public routes
	app.Get("/health", handlers.HealthCheck)
	app.Get("/auth/google/login", handlers.GoogleLogin(oauthConfig.GoogleConfig))
	app.Get("/auth/google/callback", handlers.GoogleCallback(oauthConfig.GoogleConfig))
	app.Get("/api/user/:id", handlers.GetUser())
	app.Post("/auth/logout", handlers.Logout())

	// Movie routes (public)
	app.Get("/api/movies/test", moviesHandler.TestTMDBConnection())
	app.Get("/api/movies/upcoming", moviesHandler.GetUpcomingMovies())
	app.Get("/api/movies/now-playing", moviesHandler.GetNowPlayingMovies())
	app.Get("/api/movies/popular", moviesHandler.GetPopularMovies())
	app.Get("/api/movies/:id", moviesHandler.GetMovieDetails())
	app.Get("/api/movies/:id/theaters", theatersHandler.GetTheatersByMovie())

	// Theater routes
	app.Get("/api/theaters", theatersHandler.GetAllTheaters())
	app.Get("/api/theaters/:id", theatersHandler.GetTheaterByID())
	app.Post("/api/theaters", theatersHandler.CreateTheater())

	// Showtime routes
	app.Get("/api/showtimes/:id", showtimesHandler.GetShowtimeByID())
	app.Post("/api/showtimes", showtimesHandler.CreateShowtime())
	app.Put("/api/showtimes/:id/seats", showtimesHandler.UpdateSeatStatus())

	// Booking routes (require authentication)
	app.Post("/api/bookings", middleware.RequireAuth(), bookingsHandler.CreateBooking())
	app.Get("/api/bookings/:id", middleware.RequireAuth(), bookingsHandler.GetBookingByID())
	app.Get("/api/users/:userId/bookings", middleware.RequireAuth(), bookingsHandler.GetUserBookings())
	app.Put("/api/bookings/:id/payment", middleware.RequireAuth(), bookingsHandler.ConfirmPayment())
	app.Delete("/api/bookings/:id", middleware.RequireAuth(), bookingsHandler.CancelBooking())

	// Protected routes (require authentication)
	app.Get("/api/profile", middleware.RequireAuth(), handlers.GetProfile())
}
