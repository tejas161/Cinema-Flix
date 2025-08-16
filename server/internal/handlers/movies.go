package handlers

import (
	"fmt"
	"log"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/tejas161/Cinema-Flix/internal/services"
)

// MoviesHandler handles all movie-related endpoints
type MoviesHandler struct {
	tmdbService *services.TMDBService
}

// NewMoviesHandler creates a new movies handler
func NewMoviesHandler() *MoviesHandler {
	return &MoviesHandler{
		tmdbService: services.NewTMDBService(),
	}
}

// GetUpcomingMovies handles GET /api/movies/upcoming
func (h *MoviesHandler) GetUpcomingMovies() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Get page parameter (default to 1)
		pageStr := c.Query("page", "1")
		page, err := strconv.Atoi(pageStr)
		if err != nil || page < 1 {
			page = 1
		}

		log.Printf("[MOVIES] Fetching upcoming movies - page: %d", page)

		// Fetch data from TMDB
		movies, err := h.tmdbService.GetUpcomingMovies(page)
		if err != nil {
			log.Printf("[MOVIES] ERROR: Failed to fetch upcoming movies: %v", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to fetch upcoming movies",
			})
		}

		log.Printf("[MOVIES] Successfully fetched %d upcoming movies", len(movies.Results))

		return c.JSON(fiber.Map{
			"success": true,
			"data":    movies,
		})
	}
}

// GetNowPlayingMovies handles GET /api/movies/now-playing
func (h *MoviesHandler) GetNowPlayingMovies() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Get page parameter (default to 1)
		pageStr := c.Query("page", "1")
		page, err := strconv.Atoi(pageStr)
		if err != nil || page < 1 {
			page = 1
		}

		log.Printf("[MOVIES] Fetching now playing movies - page: %d", page)

		// Fetch data from TMDB
		movies, err := h.tmdbService.GetNowPlayingMovies(page)
		if err != nil {
			log.Printf("[MOVIES] ERROR: Failed to fetch now playing movies: %v", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to fetch now playing movies",
			})
		}

		log.Printf("[MOVIES] Successfully fetched %d now playing movies", len(movies.Results))

		return c.JSON(fiber.Map{
			"success": true,
			"data":    movies,
		})
	}
}

// GetPopularMovies handles GET /api/movies/popular
func (h *MoviesHandler) GetPopularMovies() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Get page parameter (default to 1)
		pageStr := c.Query("page", "1")
		page, err := strconv.Atoi(pageStr)
		if err != nil || page < 1 {
			page = 1
		}

		log.Printf("[MOVIES] Fetching popular movies - page: %d", page)

		// Fetch data from TMDB
		movies, err := h.tmdbService.GetPopularMovies(page)
		if err != nil {
			log.Printf("[MOVIES] ERROR: Failed to fetch popular movies: %v", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to fetch popular movies",
			})
		}

		log.Printf("[MOVIES] Successfully fetched %d popular movies", len(movies.Results))

		return c.JSON(fiber.Map{
			"success": true,
			"data":    movies,
		})
	}
}

// TestTMDBConnection handles GET /api/movies/test - for debugging TMDB connection
func (h *MoviesHandler) TestTMDBConnection() fiber.Handler {
	return func(c *fiber.Ctx) error {
		log.Printf("[MOVIES] Testing TMDB connection...")

		// Try to fetch just one popular movie
		movies, err := h.tmdbService.GetPopularMovies(1)
		if err != nil {
			log.Printf("[MOVIES] TMDB connection test failed: %v", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"error":   fmt.Sprintf("TMDB connection failed: %v", err),
				"debug":   "Check your TMDB_API_KEY environment variable",
			})
		}

		log.Printf("[MOVIES] TMDB connection test successful - fetched %d movies", len(movies.Results))

		return c.JSON(fiber.Map{
			"success": true,
			"message": "TMDB connection successful",
			"data": fiber.Map{
				"total_results": movies.TotalResults,
				"total_pages":   movies.TotalPages,
				"movies_count":  len(movies.Results),
				"first_movie":   movies.Results[0].Title,
			},
		})
	}
}

// GetMovieDetails handles GET /api/movies/:id
func (h *MoviesHandler) GetMovieDetails() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Get movie ID from URL parameter
		movieIDStr := c.Params("id")
		if movieIDStr == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"error":   "Movie ID is required",
			})
		}

		movieID, err := strconv.Atoi(movieIDStr)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"error":   "Invalid movie ID format",
			})
		}

		log.Printf("[MOVIES] Fetching movie details for ID: %d", movieID)

		// Fetch data from TMDB
		movie, err := h.tmdbService.GetMovieDetails(movieID)
		if err != nil {
			log.Printf("[MOVIES] ERROR: Failed to fetch movie details for ID %d: %v", movieID, err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to fetch movie details",
			})
		}

		log.Printf("[MOVIES] Successfully fetched movie details for: %s", movie.Title)

		return c.JSON(fiber.Map{
			"success": true,
			"data":    movie,
		})
	}
}
