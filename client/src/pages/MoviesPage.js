import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Chip,
  Paper,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  ViewModule as GridIcon,
  ViewList as ListIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import MovieCard from '../components/MovieCard';
import Footer from '../components/Footer';
import {
  getAllMovies,
  getNowPlayingMovies,
  getComingSoonMovies,
  getTrendingMovies,
  searchMovies,
  filterByGenre,
  getAllGenres
} from '../data/moviesData';

const MoviesPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  
  const categories = [
    { label: 'All Movies', value: 'all' },
    { label: 'Now Playing', value: 'now-playing' },
    { label: 'Coming Soon', value: 'coming-soon' },
    { label: 'Trending', value: 'trending' }
  ];

  const genres = getAllGenres();

  // Load movies based on selected category
  useEffect(() => {
    let categoryMovies = [];
    switch (categories[selectedCategory].value) {
      case 'now-playing':
        categoryMovies = getNowPlayingMovies();
        break;
      case 'coming-soon':
        categoryMovies = getComingSoonMovies();
        break;
      case 'trending':
        categoryMovies = getTrendingMovies();
        break;
      default:
        categoryMovies = getAllMovies();
    }
    setMovies(categoryMovies);
  }, [selectedCategory]);

  // Filter movies based on search and genre
  useEffect(() => {
    let filtered = movies;
    
    // Apply search filter
    if (searchQuery) {
      filtered = searchMovies(searchQuery).filter(movie => 
        movies.some(m => m.id === movie.id)
      );
    }
    
    // Apply genre filter
    if (selectedGenre !== 'All') {
      filtered = filterByGenre(selectedGenre).filter(movie => 
        filtered.some(m => m.id === movie.id)
      );
    }
    
    setFilteredMovies(filtered);
  }, [movies, searchQuery, selectedGenre]);

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  const handleCategoryChange = (event, newValue) => {
    setSelectedCategory(newValue);
    setSearchQuery('');
    setSelectedGenre('All');
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Header />
      
      {/* Hero Section with Search */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          py: { xs: 4, md: 6 },
          color: 'white'
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: '2rem', md: '3rem' },
              textAlign: 'center'
            }}
          >
            Discover Movies
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              textAlign: 'center',
              opacity: 0.9,
              fontSize: { xs: '1rem', md: '1.25rem' }
            }}
          >
            Find your next favorite movie from our extensive collection
          </Typography>
          
          {/* Search Bar */}
          <Box sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search movies, directors, actors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                  </InputAdornment>
                ),
                sx: {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    border: 'none'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    border: '2px solid rgba(255,255,255,0.3)'
                  },
                  color: 'white',
                  '& input::placeholder': {
                    color: 'rgba(255,255,255,0.7)',
                    opacity: 1
                  }
                }
              }}
            />
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Category Tabs and Filters */}
        <Paper sx={{ mb: 3, p: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'center' },
            gap: 2,
            mb: 2
          }}>
            <Tabs
              value={selectedCategory}
              onChange={handleCategoryChange}
              variant={isMobile ? "fullWidth" : "standard"}
              sx={{ flexGrow: 1 }}
            >
              {categories.map((category, index) => (
                <Tab key={index} label={category.label} />
              ))}
            </Tabs>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {/* Genre Filter */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Genre</InputLabel>
                <Select
                  value={selectedGenre}
                  label="Genre"
                  onChange={(e) => setSelectedGenre(e.target.value)}
                >
                  {genres.map((genre) => (
                    <MenuItem key={genre} value={genre}>
                      {genre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {/* View Mode Toggle */}
              <Box sx={{ display: 'flex', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Tooltip title="Grid View">
                  <IconButton
                    size="small"
                    onClick={() => setViewMode('grid')}
                    sx={{
                      backgroundColor: viewMode === 'grid' ? 'primary.main' : 'transparent',
                      color: viewMode === 'grid' ? 'white' : 'text.secondary',
                      '&:hover': {
                        backgroundColor: viewMode === 'grid' ? 'primary.dark' : 'action.hover'
                      }
                    }}
                  >
                    <GridIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="List View">
                  <IconButton
                    size="small"
                    onClick={() => setViewMode('list')}
                    sx={{
                      backgroundColor: viewMode === 'list' ? 'primary.main' : 'transparent',
                      color: viewMode === 'list' ? 'white' : 'text.secondary',
                      '&:hover': {
                        backgroundColor: viewMode === 'list' ? 'primary.dark' : 'action.hover'
                      }
                    }}
                  >
                    <ListIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>
          
          {/* Active Filters */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {searchQuery && (
              <Chip
                label={`Search: "${searchQuery}"`}
                onDelete={() => setSearchQuery('')}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {selectedGenre !== 'All' && (
              <Chip
                label={`Genre: ${selectedGenre}`}
                onDelete={() => setSelectedGenre('All')}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
        </Paper>

        {/* Results Count */}
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          Showing {filteredMovies.length} movie{filteredMovies.length !== 1 ? 's' : ''}
        </Typography>

        {/* Movies Grid */}
        {filteredMovies.length > 0 ? (
          <Grid container spacing={3}>
            {filteredMovies.map((movie) => (
              <Grid
                key={movie.id}
                item
                xs={12}
                sm={6}
                md={viewMode === 'grid' ? 4 : 6}
                lg={viewMode === 'grid' ? 3 : 4}
              >
                <Box onClick={() => handleMovieClick(movie.id)} sx={{ cursor: 'pointer' }}>
                  <MovieCard movie={movie} />
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper sx={{ p: 8, textAlign: 'center' }}>
            <SearchIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No movies found
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Try adjusting your search terms or filters
            </Typography>
          </Paper>
        )}
      </Container>
      
      <Footer />
    </Box>
  );
};

export default MoviesPage;
