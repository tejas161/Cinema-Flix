package services

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"
)

// TMDBService handles all TMDB API interactions
type TMDBService struct {
	apiKey  string
	baseURL string
	client  *http.Client
}

// UpcomingMoviesResponse represents the TMDB upcoming movies API response
type UpcomingMoviesResponse struct {
	Dates struct {
		Maximum string `json:"maximum"`
		Minimum string `json:"minimum"`
	} `json:"dates"`
	Page    int `json:"page"`
	Results []struct {
		Adult            bool    `json:"adult"`
		BackdropPath     string  `json:"backdrop_path"`
		GenreIDs         []int   `json:"genre_ids"`
		ID               int     `json:"id"`
		OriginalLanguage string  `json:"original_language"`
		OriginalTitle    string  `json:"original_title"`
		Overview         string  `json:"overview"`
		Popularity       float64 `json:"popularity"`
		PosterPath       string  `json:"poster_path"`
		ReleaseDate      string  `json:"release_date"`
		Title            string  `json:"title"`
		Video            bool    `json:"video"`
		VoteAverage      float64 `json:"vote_average"`
		VoteCount        int     `json:"vote_count"`
	} `json:"results"`
	TotalPages   int `json:"total_pages"`
	TotalResults int `json:"total_results"`
}

// MovieDetailsResponse represents the TMDB movie details API response
type MovieDetailsResponse struct {
	Adult               bool   `json:"adult"`
	BackdropPath        string `json:"backdrop_path"`
	BelongsToCollection *struct {
		ID           int    `json:"id"`
		Name         string `json:"name"`
		PosterPath   string `json:"poster_path"`
		BackdropPath string `json:"backdrop_path"`
	} `json:"belongs_to_collection"`
	Budget int `json:"budget"`
	Genres []struct {
		ID   int    `json:"id"`
		Name string `json:"name"`
	} `json:"genres"`
	Homepage            string   `json:"homepage"`
	ID                  int      `json:"id"`
	IMDBId              string   `json:"imdb_id"`
	OriginCountry       []string `json:"origin_country"`
	OriginalLanguage    string   `json:"original_language"`
	OriginalTitle       string   `json:"original_title"`
	Overview            string   `json:"overview"`
	Popularity          float64  `json:"popularity"`
	PosterPath          string   `json:"poster_path"`
	ProductionCompanies []struct {
		ID            int    `json:"id"`
		LogoPath      string `json:"logo_path"`
		Name          string `json:"name"`
		OriginCountry string `json:"origin_country"`
	} `json:"production_companies"`
	ProductionCountries []struct {
		ISO31661 string `json:"iso_3166_1"`
		Name     string `json:"name"`
	} `json:"production_countries"`
	ReleaseDate     string `json:"release_date"`
	Revenue         int64  `json:"revenue"`
	Runtime         int    `json:"runtime"`
	SpokenLanguages []struct {
		EnglishName string `json:"english_name"`
		ISO6391     string `json:"iso_639_1"`
		Name        string `json:"name"`
	} `json:"spoken_languages"`
	Status      string  `json:"status"`
	Tagline     string  `json:"tagline"`
	Title       string  `json:"title"`
	Video       bool    `json:"video"`
	VoteAverage float64 `json:"vote_average"`
	VoteCount   int     `json:"vote_count"`
}

// NewTMDBService creates a new TMDB service instance
func NewTMDBService() *TMDBService {
	apiKey := os.Getenv("TMDB_API_KEY")
	if apiKey == "" {
		log.Fatal("TMDB_API_KEY environment variable is required")
	}

	log.Printf("[TMDB] Initializing TMDB service")
	log.Printf("[TMDB] API Key configured: %s...%s", apiKey[:8], apiKey[len(apiKey)-8:])

	return &TMDBService{
		apiKey:  apiKey,
		baseURL: "https://api.themoviedb.org/3",
		client: &http.Client{
			Timeout: 15 * time.Second,
			Transport: &http.Transport{
				MaxIdleConns:       10,
				IdleConnTimeout:    30 * time.Second,
				DisableCompression: false,
			},
		},
	}
}

// makeMovieListRequest makes an HTTP request for movie lists with retry logic
func (s *TMDBService) makeMovieListRequest(url string) (*UpcomingMoviesResponse, error) {
	maxRetries := 3
	var lastErr error

	for attempt := 1; attempt <= maxRetries; attempt++ {
		log.Printf("[TMDB] Making request (attempt %d/%d): %s", attempt, maxRetries, url)

		req, err := http.NewRequest("GET", url, nil)
		if err != nil {
			return nil, fmt.Errorf("failed to create request: %w", err)
		}

		req.Header.Add("accept", "application/json")
		req.Header.Add("Authorization", "Bearer "+s.apiKey)
		req.Header.Add("User-Agent", "Cinema-Flix/1.0")

		res, err := s.client.Do(req)
		if err != nil {
			lastErr = fmt.Errorf("request failed on attempt %d: %w", attempt, err)
			log.Printf("[TMDB] Request failed (attempt %d): %v", attempt, err)

			if attempt < maxRetries {
				waitTime := time.Duration(attempt) * 2 * time.Second
				log.Printf("[TMDB] Retrying in %v...", waitTime)
				time.Sleep(waitTime)
				continue
			}
			return nil, lastErr
		}
		defer res.Body.Close()

		log.Printf("[TMDB] Response status: %d", res.StatusCode)

		if res.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(res.Body)
			log.Printf("[TMDB] Error response body: %s", string(body))
			return nil, fmt.Errorf("TMDB API returned status: %d, body: %s", res.StatusCode, string(body))
		}

		body, err := io.ReadAll(res.Body)
		if err != nil {
			return nil, fmt.Errorf("failed to read response body: %w", err)
		}

		var response UpcomingMoviesResponse
		if err := json.Unmarshal(body, &response); err != nil {
			return nil, fmt.Errorf("failed to unmarshal response: %w", err)
		}

		log.Printf("[TMDB] Successfully fetched %d movies", len(response.Results))
		return &response, nil
	}

	return nil, lastErr
}

// makeMovieDetailsRequest makes an HTTP request for movie details with retry logic
func (s *TMDBService) makeMovieDetailsRequest(url string) (*MovieDetailsResponse, error) {
	maxRetries := 3
	var lastErr error

	for attempt := 1; attempt <= maxRetries; attempt++ {
		log.Printf("[TMDB] Making movie details request (attempt %d/%d): %s", attempt, maxRetries, url)

		req, err := http.NewRequest("GET", url, nil)
		if err != nil {
			return nil, fmt.Errorf("failed to create request: %w", err)
		}

		req.Header.Add("accept", "application/json")
		req.Header.Add("Authorization", "Bearer "+s.apiKey)
		req.Header.Add("User-Agent", "Cinema-Flix/1.0")

		res, err := s.client.Do(req)
		if err != nil {
			lastErr = fmt.Errorf("request failed on attempt %d: %w", attempt, err)
			log.Printf("[TMDB] Movie details request failed (attempt %d): %v", attempt, err)

			if attempt < maxRetries {
				waitTime := time.Duration(attempt) * 2 * time.Second
				log.Printf("[TMDB] Retrying in %v...", waitTime)
				time.Sleep(waitTime)
				continue
			}
			return nil, lastErr
		}
		defer res.Body.Close()

		log.Printf("[TMDB] Movie details response status: %d", res.StatusCode)

		if res.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(res.Body)
			log.Printf("[TMDB] Movie details error response body: %s", string(body))
			return nil, fmt.Errorf("TMDB API returned status: %d, body: %s", res.StatusCode, string(body))
		}

		body, err := io.ReadAll(res.Body)
		if err != nil {
			return nil, fmt.Errorf("failed to read response body: %w", err)
		}

		var response MovieDetailsResponse
		if err := json.Unmarshal(body, &response); err != nil {
			return nil, fmt.Errorf("failed to unmarshal movie details response: %w", err)
		}

		log.Printf("[TMDB] Successfully fetched movie details for: %s", response.Title)
		return &response, nil
	}

	return nil, lastErr
}

// GetUpcomingMovies fetches upcoming movies from TMDB API
func (s *TMDBService) GetUpcomingMovies(page int) (*UpcomingMoviesResponse, error) {
	if page < 1 {
		page = 1
	}

	url := fmt.Sprintf("%s/movie/upcoming?language=en-US&page=%d", s.baseURL, page)
	return s.makeMovieListRequest(url)
}

// GetNowPlayingMovies fetches now playing movies from TMDB API
func (s *TMDBService) GetNowPlayingMovies(page int) (*UpcomingMoviesResponse, error) {
	if page < 1 {
		page = 1
	}

	url := fmt.Sprintf("%s/movie/now_playing?language=en-US&page=%d", s.baseURL, page)
	return s.makeMovieListRequest(url)
}

// GetPopularMovies fetches popular/trending movies from TMDB API
func (s *TMDBService) GetPopularMovies(page int) (*UpcomingMoviesResponse, error) {
	if page < 1 {
		page = 1
	}

	url := fmt.Sprintf("%s/movie/popular?language=en-US&page=%d", s.baseURL, page)
	return s.makeMovieListRequest(url)
}

// GetMovieDetails fetches detailed information for a specific movie
func (s *TMDBService) GetMovieDetails(movieID int) (*MovieDetailsResponse, error) {
	url := fmt.Sprintf("%s/movie/%d?language=en-US", s.baseURL, movieID)
	return s.makeMovieDetailsRequest(url)
}
