// Helper functions for movie data processing

/**
 * Format release date to a readable format
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} Formatted date string
 */
export const formatReleaseDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

/**
 * Get TMDB image URL
 * @param {string} path - Image path from TMDB
 * @param {string} size - Image size (w300, w500, w780, w1280, original)
 * @returns {string} Full image URL
 */
export const getImageUrl = (path, size = 'w500') => {
  if (!path) return '/placeholder-movie.jpg'; // fallback image
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

/**
 * Format movie rating for display
 * @param {number} rating - Rating from 0-10
 * @returns {string} Formatted rating
 */
export const formatRating = (rating) => {
  return rating ? rating.toFixed(1) : 'N/A';
};

/**
 * Get genre names by IDs (TMDB genre mapping)
 * @param {number[]} genreIds - Array of genre IDs
 * @returns {string[]} Array of genre names
 */
export const getGenreNames = (genreIds) => {
  const genreMap = {
    28: 'Action',
    12: 'Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    14: 'Fantasy',
    36: 'History',
    27: 'Horror',
    10402: 'Music',
    9648: 'Mystery',
    10749: 'Romance',
    878: 'Science Fiction',
    10770: 'TV Movie',
    53: 'Thriller',
    10752: 'War',
    37: 'Western'
  };
  
  return genreIds.map(id => genreMap[id] || 'Unknown').filter(Boolean);
};

/**
 * Calculate days until release
 * @param {string} releaseDate - Release date in YYYY-MM-DD format
 * @returns {number} Days until release (negative if already released)
 */
export const getDaysUntilRelease = (releaseDate) => {
  const today = new Date();
  const release = new Date(releaseDate);
  const diffTime = release - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Check if movie is coming soon (releases in next 90 days)
 * @param {string} releaseDate - Release date in YYYY-MM-DD format
 * @returns {boolean} True if coming soon
 */
export const isComingSoon = (releaseDate) => {
  const days = getDaysUntilRelease(releaseDate);
  return days > 0 && days <= 90;
};

/**
 * Get movie status badge info
 * @param {string} releaseDate - Release date in YYYY-MM-DD format
 * @returns {object} Status info with color and text
 */
export const getMovieStatus = (releaseDate) => {
  const days = getDaysUntilRelease(releaseDate);
  
  if (days > 30) {
    return { text: 'Coming Soon', color: 'info' };
  } else if (days > 0) {
    return { text: `${days} days left`, color: 'warning' };
  } else if (days >= -7) {
    return { text: 'Now Playing', color: 'success' };
  } else {
    return { text: 'Released', color: 'default' };
  }
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 150) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};