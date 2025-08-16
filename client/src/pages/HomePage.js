import React, { useState, useEffect } from 'react';
import { Box, Button, Container, Typography, Grid, Card, CardMedia, CardContent, Rating, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PlayArrow, CalendarToday, Star } from '@mui/icons-material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MovieService from '../services/movieService';
import { formatReleaseDate, getImageUrl } from '../utils/movieHelpers';

const HomePage = () => {
  const navigate = useNavigate();
  
  // State for API data
  const [upcomingMovies, setUpcomingMovies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get featured movie (first upcoming movie)
  const featuredMovie = upcomingMovies?.results?.[0];

  // Fetch upcoming movies on component mount
  useEffect(() => {
    const fetchUpcomingMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await MovieService.getUpcomingMovies(1);
        setUpcomingMovies(data);
      } catch (err) {
        setError(err.message);
        console.error('Failed to fetch upcoming movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingMovies();
  }, []);

  // Loading state
  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
        <Header />
        <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading upcoming movies...
          </Typography>
        </Container>
        <Footer />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
        <Header />
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Alert severity="error" sx={{ mb: 4 }}>
            Failed to load movies: {error}
          </Alert>
          <Box sx={{ textAlign: 'center' }}>
            <Button 
              variant="contained" 
              onClick={() => window.location.reload()}
              sx={{ mt: 2 }}
            >
              Retry
            </Button>
          </Box>
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Header />
      
      {/* Enhanced Hero Section with Featured Upcoming Movie */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: '60vh', md: '80vh' },
          background: featuredMovie ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url(${getImageUrl(featuredMovie.backdrop_path, 'w1280')})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          color: 'white'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 2,
                  fontSize: { xs: '2rem', md: '3.5rem' }
                }}
              >
                {featuredMovie?.title || 'Cinema Flix'}
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 3, 
                  opacity: 0.9,
                  maxWidth: '600px',
                  lineHeight: 1.6
                }}
              >
                {featuredMovie?.overview || 'Discover the latest movies and upcoming releases'}
              </Typography>
              
              {featuredMovie && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Star sx={{ color: '#ffd700' }} />
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {featuredMovie.vote_average.toFixed(1)}/10
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday />
                    <Typography variant="body1">
                      {formatReleaseDate(featuredMovie.release_date)}
                    </Typography>
                  </Box>
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PlayArrow />}
                  onClick={() => featuredMovie && navigate(`/movie/${featuredMovie.id}`)}
                  sx={{ 
                    px: 4, 
                    py: 1.5, 
                    fontSize: '1.1rem',
                    backgroundColor: '#e50914',
                    '&:hover': { backgroundColor: '#b8070f' }
                  }}
                >
                  Watch Trailer
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Upcoming Movies Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            mb: 4, 
            fontWeight: 600,
            textAlign: 'center'
          }}
        >
          Coming Soon to Theaters
        </Typography>
        
        <Grid container spacing={3}>
          {upcomingMovies?.results?.slice(1, 7).map((movie) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={movie.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                  }
                }}
                onClick={() => navigate(`/movie/${movie.id}`)}
              >
                <CardMedia
                  component="img"
                  height="300"
                  image={getImageUrl(movie.poster_path)}
                  alt={movie.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ p: 2 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      mb: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {movie.title}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Rating 
                      value={movie.vote_average / 2} 
                      precision={0.1} 
                      size="small" 
                      readOnly 
                    />
                    <Typography variant="caption" color="text.secondary">
                      ({movie.vote_count})
                    </Typography>
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary">
                    {formatReleaseDate(movie.release_date)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
      
      {/* Stats Section */}
      <Box sx={{ backgroundColor: 'background.paper', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} textAlign="center">
            <Grid item xs={12} sm={4}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {upcomingMovies?.total_results?.toLocaleString() || '1,248'}+
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Movies Available
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {upcomingMovies?.total_pages || '63'}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Pages of Content
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                4K
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Ultra HD Quality
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      <Footer />
    </Box>
  );
};

export default HomePage;