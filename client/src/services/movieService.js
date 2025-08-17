// Movie API service for fetching data from the backend

const API_BASE_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:8080';

class MovieService {
  /**
   * Fetch upcoming movies from the server
   * @param {number} page - Page number (default: 1)
   * @returns {Promise<Object>} API response with movies data
   */
  static async getUpcomingMovies(page = 1) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/movies/upcoming?page=${page}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch upcoming movies');
      }
      
      return data.data; // Return the movies data
    } catch (error) {
      console.error('Error fetching upcoming movies:', error);
      throw error;
    }
  }

  /**
   * Fetch now playing movies from the server
   * @param {number} page - Page number (default: 1)
   * @returns {Promise<Object>} API response with movies data
   */
  static async getNowPlayingMovies(page = 1) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/movies/now-playing?page=${page}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch now playing movies');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching now playing movies:', error);
      throw error;
    }
  }

  /**
   * Fetch popular/trending movies from the server
   * @param {number} page - Page number (default: 1)
   * @returns {Promise<Object>} API response with movies data
   */
  static async getPopularMovies(page = 1) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/movies/popular?page=${page}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch popular movies');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching popular movies:', error);
      throw error;
    }
  }

  /**
   * Fetch detailed information for a specific movie
   * @param {number} movieId - The TMDB movie ID
   * @returns {Promise<Object>} API response with movie details
   */
  static async getMovieDetails(movieId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/movies/${movieId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch movie details');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching movie details:', error);
      throw error;
    }
  }

  /**
   * Fetch available theaters and showtimes for a specific movie
   * @param {number} movieId - The TMDB movie ID
   * @returns {Promise<Array>} API response with theaters data
   */
  static async getAvailableTheaters(movieId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/movies/${movieId}/theaters`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch theater information');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching theater information:', error);
      throw error;
    }
  }

  /**
   * Fetch showtime details with seat layout
   * @param {string} showtimeId - The showtime ID
   * @returns {Promise<Object>} API response with showtime details
   */
  static async getShowtimeDetails(showtimeId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/showtimes/${showtimeId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch showtime details');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching showtime details:', error);
      throw error;
    }
  }

  /**
   * Create a new booking
   * @param {Object} bookingData - Booking information
   * @returns {Promise<Object>} API response with booking details
   */
  static async createBooking(bookingData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create booking');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  /**
   * Create a new booking with authentication
   * @param {Object} bookingData - Booking information
   * @param {Object} user - Authenticated user data
   * @returns {Promise<Object>} API response with booking details
   */
  static async createBookingWithAuth(bookingData, user) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...bookingData,
          googleId: user.googleId || user.id,   // put here
        }),
      
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login to complete booking');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create booking');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error creating booking with auth:', error);
      throw error;
    }
  }

  /**
   * Update seat status (block/book/release)
   * @param {string} showtimeId - The showtime ID
   * @param {Object} seatData - Seat update data
   * @returns {Promise<Object>} API response
   */
  static async updateSeatStatus(showtimeId, seatData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/showtimes/${showtimeId}/seats`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(seatData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to update seat status');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error updating seat status:', error);
      throw error;
    }
  }

  /**
   * Get booking details
   * @param {string} bookingId - The booking ID
   * @returns {Promise<Object>} API response with booking details
   */
  static async getBookingDetails(bookingId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch booking details');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching booking details:', error);
      throw error;
    }
  }

  /**
   * Confirm payment for a booking
   * @param {string} bookingId - The booking ID
   * @param {Object} paymentData - Payment information
   * @returns {Promise<Object>} API response
   */
  static async confirmPayment(bookingId, paymentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/payment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to confirm payment');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }
}

export default MovieService;
