import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Paper,
  Avatar,
  Breadcrumbs,
  Link,
  CircularProgress,
  Alert,
  Rating,
  Divider,
  Stack,
} from '@mui/material';
import { 
  Star, 
  PlayArrow, 
  Favorite, 
  Share, 
  AccessTime, 
  CalendarToday, 
  Language,
  AttachMoney,
  TrendingUp,
  Movie as MovieIcon,
  Business,
  Public,
  EventSeat
} from '@mui/icons-material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MovieService from '../services/movieService';
import { formatReleaseDate, getImageUrl } from '../utils/movieHelpers';

const MovieDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const movieData = await MovieService.getMovieDetails(parseInt(id));
        setMovie(movieData);
      } catch (err) {
        setError(err.message);
        console.error('Failed to fetch movie details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMovieDetails();
    }
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
        <Header />
        <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading movie details...
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
            Failed to load movie details: {error}
          </Alert>
          <Box sx={{ textAlign: 'center' }}>
            <Button 
              variant="contained" 
              onClick={() => navigate('/')}
              sx={{ mt: 2 }}
            >
              Back to Home
            </Button>
          </Box>
        </Container>
        <Footer />
      </Box>
    );
  }

  if (!movie) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
        <Header />
        <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h4">Movie not found</Typography>
          <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>
            Back to Home
          </Button>
        </Container>
        <Footer />
      </Box>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  const formatRuntime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Header />
      
      {/* Hero Section with Backdrop */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: '50vh', md: '70vh' },
          background: movie.backdrop_path 
            ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url(${getImageUrl(movie.backdrop_path, 'w1280')})`
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'flex-end',
          color: 'white'
        }}
      >
        <Container maxWidth="lg" sx={{ pb: 4 }}>
          <Grid container spacing={4} alignItems="flex-end">
            <Grid item xs={12} md={3}>
              {/* Movie Poster */}
              <Card 
                sx={{ 
                  maxWidth: 300,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  transform: 'translateY(50px)'
                }}
              >
                <img
                  src={getImageUrl(movie.poster_path)}
                  alt={movie.title}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block'
                  }}
                />
              </Card>
            </Grid>
            
            <Grid item xs={12} md={9}>
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 1,
                  fontSize: { xs: '2rem', md: '3rem' }
                }}
              >
                {movie.title}
              </Typography>
              
              {movie.tagline && (
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontStyle: 'italic', 
                    opacity: 0.9, 
                    mb: 2 
                  }}
                >
                  "{movie.tagline}"
                </Typography>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Star sx={{ color: '#ffd700' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {movie.vote_average.toFixed(1)}/10
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    ({movie.vote_count.toLocaleString()} votes)
                  </Typography>
                </Box>
                
                {movie.runtime && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime />
                    <Typography variant="body1">
                      {formatRuntime(movie.runtime)}
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarToday />
                  <Typography variant="body1">
                    {formatReleaseDate(movie.release_date)}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                {movie.genres.map((genre) => (
                  <Chip 
                    key={genre.id} 
                    label={genre.name} 
                    sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 500
                    }} 
                  />
                ))}
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<EventSeat />}
                  onClick={() => navigate(`/movie/${id}/theaters`)}
                  sx={{ 
                    px: 4, 
                    py: 1.5,
                    backgroundColor: '#ff6b35',
                    '&:hover': { backgroundColor: '#e55a2e' }
                  }}
                >
                  Book Tickets
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PlayArrow />}
                  sx={{ 
                    px: 4, 
                    py: 1.5,
                    backgroundColor: '#e50914',
                    '&:hover': { backgroundColor: '#b8070f' }
                  }}
                >
                  Watch Trailer
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Favorite />}
                  sx={{ 
                    px: 4, 
                    py: 1.5,
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': { 
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  Add to Favorites
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Share />}
                  sx={{ 
                    px: 4, 
                    py: 1.5,
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': { 
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  Share
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6, mt: 6 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 4 }}>
          <Link color="inherit" href="/" onClick={() => navigate('/')}>
            Home
          </Link>
          <Typography color="text.primary">{movie.title}</Typography>
        </Breadcrumbs>

        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            {/* Overview */}
            <Paper sx={{ p: 4, mb: 4 }}>
              <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                Overview
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
                {movie.overview}
              </Typography>
            </Paper>

            {/* Production Companies */}
            {movie.production_companies && movie.production_companies.length > 0 && (
              <Paper sx={{ p: 4, mb: 4 }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                  Production Companies
                </Typography>
                <Grid container spacing={3}>
                  {movie.production_companies.map((company) => (
                    <Grid item xs={6} sm={4} key={company.id}>
                      <Card sx={{ textAlign: 'center', p: 2, height: '100%' }}>
                        {company.logo_path ? (
                          <img
                            src={getImageUrl(company.logo_path, 'w200')}
                            alt={company.name}
                            style={{
                              maxWidth: '100px',
                              maxHeight: '60px',
                              objectFit: 'contain',
                              marginBottom: '8px'
                            }}
                          />
                        ) : (
                          <Business sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                        )}
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {company.name}
                        </Typography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            )}
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                Movie Details
              </Typography>
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Status
                  </Typography>
                  <Typography variant="body1">{movie.status}</Typography>
                </Box>

                {movie.budget > 0 && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Budget
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AttachMoney />
                      <Typography variant="body1">{formatCurrency(movie.budget)}</Typography>
                    </Box>
                  </Box>
                )}

                {movie.revenue > 0 && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Revenue
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUp />
                      <Typography variant="body1">{formatCurrency(movie.revenue)}</Typography>
                    </Box>
                  </Box>
                )}

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Original Language
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Language />
                    <Typography variant="body1">
                      {movie.original_language.toUpperCase()}
                    </Typography>
                  </Box>
                </Box>

                {movie.production_countries && movie.production_countries.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Countries
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Public />
                      <Typography variant="body1">
                        {movie.production_countries.map(country => country.name).join(', ')}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {movie.homepage && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Homepage
                    </Typography>
                    <Link 
                      href={movie.homepage} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      sx={{ wordBreak: 'break-all' }}
                    >
                      Visit Official Website
                    </Link>
                  </Box>
                )}

                {movie.imdb_id && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      IMDB
                    </Typography>
                    <Link 
                      href={`https://www.imdb.com/title/${movie.imdb_id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      View on IMDB
                    </Link>
                  </Box>
                )}
              </Stack>
            </Paper>

            {/* Rating Card */}
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                User Rating
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Rating 
                  value={movie.vote_average / 2} 
                  precision={0.1} 
                  size="large" 
                  readOnly 
                />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {movie.vote_average.toFixed(1)}/10
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Based on {movie.vote_count.toLocaleString()} votes
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Footer />
    </Box>
  );
};

export default MovieDetailPage;
