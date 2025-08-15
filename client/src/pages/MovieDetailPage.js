import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  IconButton,
  Paper,
  Divider,
  useTheme,
  useMediaQuery,
  Breadcrumbs,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  PlayArrow,
  Favorite,
  Share,
  Star,
  AccessTime,
  CalendarToday,
  Language,
  AttachMoney,
  ArrowBack,
  BookOnline
} from '@mui/icons-material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getMovieById } from '../data/moviesData';

const MovieDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [movie, setMovie] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [bookingDialog, setBookingDialog] = useState(false);
  const [selectedShowTime, setSelectedShowTime] = useState('');

  useEffect(() => {
    const movieData = getMovieById(id);
    setMovie(movieData);
    
    if (!movieData) {
      // Redirect to movies page if movie not found
      navigate('/movies');
    }
  }, [id, navigate]);

  const handleBookTickets = (showTime) => {
    setSelectedShowTime(showTime);
    setBookingDialog(true);
  };

  const handleBookingConfirm = () => {
    // Here you would integrate with actual booking system
    alert(`Booking confirmed for ${movie.title} at ${selectedShowTime}`);
    setBookingDialog(false);
  };

  if (!movie) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
        <Header />
        <Container sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h4">Movie not found</Typography>
          <Button onClick={() => navigate('/movies')} sx={{ mt: 2 }}>
            Back to Movies
          </Button>
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Header />
      
      {/* Backdrop Hero Section */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: '50vh', md: '70vh' },
          backgroundImage: `url(${movie.backdrop})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'flex-end'
        }}
      >
        {/* Overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(transparent 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.8) 100%)'
          }}
        />
        
        {/* Back Button */}
        <IconButton
          onClick={() => navigate(-1)}
          sx={{
            position: 'absolute',
            top: 20,
            left: 20,
            backgroundColor: 'rgba(0,0,0,0.5)',
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.7)'
            }
          }}
        >
          <ArrowBack />
        </IconButton>

        {/* Movie Title Overlay */}
        <Container sx={{ position: 'relative', pb: 4 }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              color: 'white',
              fontWeight: 700,
              fontSize: { xs: '2rem', md: '3.5rem' },
              mb: 2,
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
            }}
          >
            {movie.title}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Star sx={{ color: 'secondary.main' }} />
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                {movie.imdbRating}
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              {movie.certification}
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              {movie.duration}
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              {new Date(movie.releaseDate).getFullYear()}
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link color="inherit" href="/" onClick={() => navigate('/')}>
            Home
          </Link>
          <Link color="inherit" href="/movies" onClick={() => navigate('/movies')}>
            Movies
          </Link>
          <Typography color="text.primary">{movie.title}</Typography>
        </Breadcrumbs>

        <Grid container spacing={4}>
          {/* Left Column - Poster and Actions */}
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 3 }}>
              <Box
                component="img"
                src={movie.poster}
                alt={movie.title}
                sx={{
                  width: '100%',
                  height: 'auto',
                  aspectRatio: '2/3',
                  objectFit: 'cover'
                }}
              />
            </Card>
            
            {/* Action Buttons */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<BookOnline />}
                onClick={() => handleBookTickets(movie.showTimes[0])}
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600
                }}
              >
                Book Tickets
              </Button>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<PlayArrow />}
                  onClick={() => setShowTrailer(true)}
                  sx={{ flex: 1 }}
                >
                  Trailer
                </Button>
                <IconButton color="primary">
                  <Favorite />
                </IconButton>
                <IconButton color="primary">
                  <Share />
                </IconButton>
              </Box>
            </Box>

            {/* Show Times */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Show Times</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {movie.showTimes.map((time, index) => (
                  <Button
                    key={index}
                    variant="outlined"
                    size="small"
                    onClick={() => handleBookTickets(time)}
                    sx={{ minWidth: 'auto' }}
                  >
                    {time}
                  </Button>
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Right Column - Movie Details */}
          <Grid item xs={12} md={8}>
            {/* Genres */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {movie.genres.map((genre, index) => (
                  <Chip
                    key={index}
                    label={genre}
                    variant="outlined"
                    color="primary"
                  />
                ))}
              </Box>
            </Box>

            {/* Plot */}
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
              Plot
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.7, color: 'text.secondary' }}>
              {movie.plot}
            </Typography>

            {/* Movie Details */}
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>Movie Details</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                      Release Date:
                    </Typography>
                    <Typography variant="body2">
                      {new Date(movie.releaseDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                      Runtime:
                    </Typography>
                    <Typography variant="body2">{movie.duration}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Language sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                      Languages:
                    </Typography>
                    <Typography variant="body2">
                      {movie.languages.join(', ')}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                      Director:
                    </Typography>
                    <Typography variant="body2">{movie.director}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AttachMoney sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                      Budget:
                    </Typography>
                    <Typography variant="body2">{movie.budget}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                      Box Office:
                    </Typography>
                    <Typography variant="body2">{movie.boxOffice}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Cast */}
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
              Cast & Crew
            </Typography>
            <Grid container spacing={2}>
              {movie.cast.map((actor, index) => (
                <Grid item xs={6} sm={4} md={3} key={index}>
                  <Card sx={{ textAlign: 'center', p: 2 }}>
                    <Avatar
                      src={actor.image}
                      alt={actor.name}
                      sx={{ width: 80, height: 80, mx: 'auto', mb: 1 }}
                    />
                    <Typography variant="body2" fontWeight={600}>
                      {actor.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {actor.character}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>

      {/* Booking Dialog */}
      <Dialog open={bookingDialog} onClose={() => setBookingDialog(false)}>
        <DialogTitle>Book Tickets</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>{movie.title}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Show Time: {selectedShowTime}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookingDialog(false)}>Cancel</Button>
          <Button onClick={handleBookingConfirm} variant="contained">
            Confirm Booking
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </Box>
  );
};

export default MovieDetailPage;
