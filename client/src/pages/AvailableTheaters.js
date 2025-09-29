import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Breadcrumbs,
  Link,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import {
  LocationOn,
  AccessTime,
  EventSeat,
  Star,
  ArrowBack,
  Phone,
  Directions,
} from '@mui/icons-material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MovieService from '../services/movieService';
import { formatReleaseDate, getImageUrl } from '../utils/movieHelpers';

const AvailableTheaters = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchMovieAndTheaters = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch movie details and theater data in parallel
        const [movieData, theatersData] = await Promise.all([
          MovieService.getMovieDetails(parseInt(id)),
          MovieService.getAvailableTheaters(parseInt(id))
        ]);
        
        setMovie(movieData);
        setTheaters(theatersData);
      } catch (err) {
        setError(err.message);
        console.error('Failed to fetch movie and theater details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMovieAndTheaters();
    }
  }, [id]);

  const handleBookTicket = (theater, showtime) => {
    // Navigate to seat selection page
    navigate(`/movie/${id}/booking/${showtime.id}`, {
      state: {
        movie,
        theater,
        showtime
      }
    });
  };

  const getSeatAvailabilityColor = (seats) => {
    if (seats > 40) return 'success';
    if (seats > 15) return 'warning';
    return 'error';
  };

  const getSeatAvailabilityText = (seats) => {
    if (seats > 40) return 'Good Availability';
    if (seats > 15) return 'Limited Seats';
    return 'Few Seats Left';
  };

  // Helper functions for format display
  const getFormatIcon = (format) => {
    switch(format) {
      case 'Standard': return '🎬';
      case '3D': return '🥽';
      case '4DX': return '🚀';
      case 'IMAX': return '🎯';
      case 'Premium': return '👑';
      default: return '🎬';
    }
  };

  const getFormatLabel = (format) => {
    switch(format) {
      case 'Standard': return 'Standard';
      case '3D': return '3D Experience';
      case '4DX': return '4DX Motion';
      case 'IMAX': return 'IMAX Large Screen';
      case 'Premium': return 'Premium Luxury';
      default: return 'Standard';
    }
  };

  const getFormatDescription = (format) => {
    switch(format) {
      case 'Standard': return 'Classic cinema experience';
      case '3D': return 'Immersive 3D visuals';
      case '4DX': return 'Motion seats & special effects';
      case 'IMAX': return 'Giant screen & premium sound';
      case 'Premium': return 'Luxury seating & service';
      default: return 'Standard viewing';
    }
  };

  const getFormatColor = (format) => {
    switch(format) {
      case 'Standard': return 'default';
      case '3D': return 'info';
      case '4DX': return 'secondary';
      case 'IMAX': return 'primary';
      case 'Premium': return 'warning';
      default: return 'default';
    }
  };

  // Group showtimes by format
  const groupShowtimesByFormat = (showtimes) => {
    return showtimes.reduce((acc, showtime) => {
      const format = showtime.format || 'Standard';
      if (!acc[format]) {
        acc[format] = [];
      }
      acc[format].push(showtime);
      return acc;
    }, {});
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
        <Header />
        <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading theaters and showtimes...
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
            Failed to load theater information: {error}
          </Alert>
          <Box sx={{ textAlign: 'center' }}>
            <Button 
              variant="contained" 
              onClick={() => navigate(`/movie/${id}`)}
              sx={{ mt: 2 }}
            >
              Back to Movie Details
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

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Header />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 4 }}>
          <Link color="inherit" href="/" onClick={() => navigate('/')}>
            Home
          </Link>
          <Link color="inherit" onClick={() => navigate(`/movie/${id}`)}>
            {movie.title}
          </Link>
          <Typography color="text.primary">Book Tickets</Typography>
        </Breadcrumbs>

        {/* Back Button and Movie Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton 
            onClick={() => navigate(`/movie/${id}`)} 
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <img
              src={getImageUrl(movie.poster_path, 'w200')}
              alt={movie.title}
              style={{
                width: '80px',
                height: '120px',
                objectFit: 'cover',
                borderRadius: '8px'
              }}
            />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {movie.title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Chip 
                  icon={<Star />} 
                  label={`${movie.vote_average.toFixed(1)}/10`} 
                  color="primary" 
                  size="small"
                />
                <Typography variant="body2" color="text.secondary">
                  {formatReleaseDate(movie.release_date)}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {movie.genres.slice(0, 3).map((genre) => (
                    <Chip 
                      key={genre.id} 
                      label={genre.name} 
                      size="small" 
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
          Available Theaters
        </Typography>

        {/* Theater List */}
        <Grid container spacing={3}>
          {theaters.map((theater) => (
            <Grid item xs={12} key={theater.id}>
              <Card sx={{ mb: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    {/* Theater Info */}
                    <Grid item xs={12} md={4}>
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                        {theater.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <LocationOn color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {theater.address}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Phone color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {theater.phone}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Chip 
                          icon={<Star />} 
                          label={theater.rating} 
                          color="primary" 
                          size="small"
                        />
                        <Typography variant="body2" color="text.secondary">
                          {theater.distance} away
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                        {theater.amenities.map((amenity, index) => (
                          <Chip 
                            key={index} 
                            label={amenity} 
                            size="small" 
                            variant="outlined"
                          />
                        ))}
                      </Box>
                      <Button
                        variant="outlined"
                        startIcon={<Directions />}
                        size="small"
                        onClick={() => {
                          // This would open maps with directions
                          window.open(`https://maps.google.com/?q=${encodeURIComponent(theater.address)}`, '_blank');
                        }}
                      >
                        Get Directions
                      </Button>
                    </Grid>

                    {/* Showtimes */}
                    <Grid item xs={12} md={8}>
                      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                        Today's Showtimes
                      </Typography>
                      
                      {/* Group showtimes by format */}
                      {Object.entries(groupShowtimesByFormat(theater.showtimes))
                        .sort(([a], [b]) => {
                          // Sort formats: Standard, 3D, 4DX, IMAX, Premium
                          const order = ['Standard', '3D', '4DX', 'IMAX', 'Premium'];
                          return order.indexOf(a) - order.indexOf(b);
                        })
                        .map(([format, showtimes]) => (
                        <Box key={format} sx={{ mb: 3 }}>
                          {/* Format Header */}
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            mb: 2,
                            p: 1,
                            backgroundColor: 'action.hover',
                            borderRadius: 1
                          }}>
                            <Typography variant="h6" sx={{ 
                              fontSize: '1.1rem',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1
                            }}>
                              <span style={{ fontSize: '1.2rem' }}>{getFormatIcon(format)}</span>
                              {getFormatLabel(format)}
                            </Typography>
                            <Chip 
                              label={getFormatDescription(format)}
                              size="small"
                              color={getFormatColor(format)}
                              variant="outlined"
                              sx={{ ml: 2 }}
                            />
                          </Box>
                          
                          {/* Showtimes for this format */}
                          <Grid container spacing={2}>
                            {showtimes.map((showtime, index) => (
                              <Grid item xs={12} sm={6} md={4} key={`${format}-${index}`}>
                                <Paper 
                                  sx={{ 
                                    p: 2, 
                                    textAlign: 'center',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    position: 'relative',
                                    '&:hover': {
                                      boxShadow: 3,
                                      cursor: 'pointer',
                                      transform: 'translateY(-2px)',
                                      transition: 'all 0.2s ease'
                                    }
                                  }}
                                  onClick={() => handleBookTicket(theater, showtime)}
                                >
                                  {/* Format Badge */}
                                  <Chip 
                                    label={format}
                                    size="small"
                                    color={getFormatColor(format)}
                                    sx={{ 
                                      position: 'absolute',
                                      top: 8,
                                      right: 8,
                                      fontSize: '0.7rem'
                                    }}
                                  />
                                  
                                  <Typography variant="h6" sx={{ 
                                    fontWeight: 600, 
                                    mb: 1,
                                    mt: 1,
                                    color: 'primary.main'
                                  }}>
                                    {showtime.time}
                                  </Typography>
                                  
                                  <Typography variant="h6" color="secondary" sx={{ 
                                    fontWeight: 700, 
                                    mb: 1,
                                    fontSize: '1.1rem'
                                  }}>
                                    {showtime.price}
                                  </Typography>
                                  
                                  <Chip 
                                    icon={<EventSeat />}
                                    label={`${showtime.seats} seats`}
                                    size="small"
                                    color={getSeatAvailabilityColor(showtime.seats)}
                                    sx={{ mb: 1 }}
                                  />
                                  
                                  <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 1 }}>
                                    {getSeatAvailabilityText(showtime.seats)}
                                  </Typography>

                                  {/* Screen Info */}
                                  <Typography variant="caption" display="block" color="text.secondary">
                                    {showtime.screen_name || `Screen ${index + 1}`}
                                  </Typography>
                                </Paper>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      ))}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* No theaters message */}
        {theaters.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No theaters available for this movie at the moment.
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate(`/movie/${id}`)}
            >
              Back to Movie Details
            </Button>
          </Paper>
        )}
      </Container>

      <Footer />
    </Box>
  );
};

export default AvailableTheaters;