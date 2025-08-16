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
}

export default MovieService;
