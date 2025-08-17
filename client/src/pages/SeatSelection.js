import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  ArrowBack,
  EventSeat,
  Check,
  Close,
  AccessTime,
  LocationOn,
  Person,
  Payment,
  ConfirmationNumber,
  LoginOutlined,
} from '@mui/icons-material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MovieService from '../services/movieService';
import { formatReleaseDate, getImageUrl } from '../utils/movieHelpers';
import { useAuth } from '../contexts/AuthContext';

const SeatSelection = () => {
  const { id: movieId, showtimeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { movie, theater, showtime: showtimeData } = location.state || {};
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [showtimeDetails, setShowtimeDetails] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingData, setBookingData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processingBooking, setProcessingBooking] = useState(false);

  const steps = ['Select Seats', 'Payment', 'Confirmation'];

  useEffect(() => {
    const fetchShowtimeDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const details = await MovieService.getShowtimeDetails(showtimeId);
        setShowtimeDetails(details);
      } catch (err) {
        setError(err.message);
        console.error('Failed to fetch showtime details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (showtimeId) {
      fetchShowtimeDetails();
    }
  }, [showtimeId]);

  const handleSeatClick = async (seat) => {
    if (seat.status !== 'available') return;

    const seatId = seat.seat_id;
    const isSelected = selectedSeats.some(s => s.seat_id === seatId);

    if (isSelected) {
      // Remove seat from selection
      setSelectedSeats(prev => prev.filter(s => s.seat_id !== seatId));
    } else {
      // Add seat to selection (max 10 seats)
      if (selectedSeats.length >= 10) {
        alert('You can select maximum 10 seats');
        return;
      }
      setSelectedSeats(prev => [...prev, seat]);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 0 && selectedSeats.length === 0) {
      alert('Please select at least one seat');
      return;
    }
    if (currentStep === 0 && !isAuthenticated) {
      // Redirect to authentication
      const loginUrl = `${process.env.REACT_APP_SERVER_URL}/auth/google/login`;
      window.location.href = loginUrl;
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const calculateTotalPrice = () => {
    const basePrice = selectedSeats.reduce((total, seat) => total + seat.price, 0);
    const convenienceFee = basePrice * 0.02; // 2%
    const tax = (basePrice + convenienceFee) * 0.18; // 18%
    return {
      basePrice,
      convenienceFee,
      tax,
      total: basePrice + convenienceFee + tax
    };
  };

  const handleCreateBooking = async () => {
    if (!isAuthenticated || !user) {
      setError('Please login to complete booking');
      return;
    }

    setProcessingBooking(true);
    try {
      const bookingRequest = {
        showtime_id: showtimeId,
        seat_ids: selectedSeats.map(seat => seat.seat_id),
      };

      const booking = await MovieService.createBookingWithAuth(bookingRequest, user);
      setBookingData(booking);
      setCurrentStep(2); // Move to confirmation (step index changed)
    } catch (err) {
      setError(err.message);
      console.error('Failed to create booking:', err);
    } finally {
      setProcessingBooking(false);
    }
  };

  const handlePayment = () => {
    // Simulate payment processing
    setTimeout(() => {
      handleCreateBooking();
    }, 2000);
  };

  const getSeatColor = (seat) => {
    const seatId = seat.seat_id;
    const isSelected = selectedSeats.some(s => s.seat_id === seatId);
    
    if (isSelected) return '#ff6b35';
    if (seat.status === 'booked') return '#757575';
    if (seat.status === 'blocked') return '#ffa726';
    if (seat.status === 'maintenance') return '#f44336';
    return '#4caf50'; // available
  };

  const getSeatIcon = (seat) => {
    const seatId = seat.seat_id;
    const isSelected = selectedSeats.some(s => s.seat_id === seatId);
    
    if (isSelected) return <Check sx={{ fontSize: 12 }} />;
    if (seat.status !== 'available') return <Close sx={{ fontSize: 12 }} />;
    return null;
  };

  // Loading state
  if (loading || authLoading) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
        <Header />
        <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading seat layout...
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
            Failed to load seat layout: {error}
          </Alert>
          <Box sx={{ textAlign: 'center' }}>
            <Button 
              variant="contained" 
              onClick={() => navigate(`/movie/${movieId}/theaters`)}
              sx={{ mt: 2 }}
            >
              Back to Theaters
            </Button>
          </Box>
        </Container>
        <Footer />
      </Box>
    );
  }

  if (!showtimeDetails || !movie) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
        <Header />
        <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h4">Showtime not found</Typography>
          <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>
            Back to Home
          </Button>
        </Container>
        <Footer />
      </Box>
    );
  }

  const pricing = calculateTotalPrice();

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Header />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 4 }}>
          <Link color="inherit" href="/" onClick={() => navigate('/')}>
            Home
          </Link>
          <Link color="inherit" onClick={() => navigate(`/movie/${movieId}`)}>
            {movie.title}
          </Link>
          <Link color="inherit" onClick={() => navigate(`/movie/${movieId}/theaters`)}>
            Book Tickets
          </Link>
          <Typography color="text.primary">Seat Selection</Typography>
        </Breadcrumbs>

        {/* Movie and Theater Info */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={2}>
                <img
                  src={getImageUrl(movie.poster_path, 'w200')}
                  alt={movie.title}
                  style={{
                    width: '100%',
                    maxWidth: '120px',
                    height: 'auto',
                    borderRadius: '8px'
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                  {movie.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Chip 
                    icon={<LocationOn />} 
                    label={showtimeDetails.theater.name} 
                    variant="outlined"
                    size="small"
                  />
                  <Chip 
                    icon={<AccessTime />} 
                    label={new Date(showtimeDetails.showtime.show_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    variant="outlined"
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {showtimeDetails.theater.address}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={() => navigate(`/movie/${movieId}/theaters`)}
                >
                  Change Theater/Time
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Stepper */}
        <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} lg={8}>
            {currentStep === 0 && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
                  Select Your Seats
                </Typography>
                
                {/* Screen */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Box sx={{ 
                    width: '60%', 
                    height: '20px', 
                    background: 'linear-gradient(90deg, #ddd, #999, #ddd)',
                    borderRadius: '50px 50px 0 0',
                    margin: '0 auto',
                    position: 'relative'
                  }}>
                    <Typography variant="caption" sx={{ position: 'absolute', top: '25px', left: '50%', transform: 'translateX(-50%)' }}>
                      SCREEN
                    </Typography>
                  </Box>
                </Box>

                {/* Seat Layout */}
                {showtimeDetails.seat_layout.rows && Object.keys(showtimeDetails.seat_layout.rows).length > 0 ? (
                  <Box sx={{ overflowX: 'auto' }}>
                    {Object.entries(showtimeDetails.seat_layout.rows).map(([rowId, seats]) => (
                      <Box key={rowId} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ width: '30px', textAlign: 'center', mr: 2 }}>
                          {rowId}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {seats.map((seat, index) => (
                            <Button
                              key={seat.seat_id}
                              variant="contained"
                              size="small"
                              disabled={seat.status !== 'available'}
                              onClick={() => handleSeatClick(seat)}
                              sx={{
                                minWidth: '30px',
                                height: '30px',
                                p: 0,
                                backgroundColor: getSeatColor(seat),
                                '&:hover': {
                                  backgroundColor: seat.status === 'available' ? '#ff8a65' : getSeatColor(seat),
                                },
                                '&.Mui-disabled': {
                                  backgroundColor: getSeatColor(seat),
                                  color: 'white'
                                }
                              }}
                            >
                              {getSeatIcon(seat) || seat.seat_number}
                            </Button>
                          ))}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
                    Seat layout not available
                  </Typography>
                )}

                {/* Legend */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 20, height: 20, backgroundColor: '#4caf50', borderRadius: 1 }} />
                    <Typography variant="caption">Available</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 20, height: 20, backgroundColor: '#ff6b35', borderRadius: 1 }} />
                    <Typography variant="caption">Selected</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 20, height: 20, backgroundColor: '#757575', borderRadius: 1 }} />
                    <Typography variant="caption">Booked</Typography>
                  </Box>
                </Box>
              </Paper>
            )}


            {currentStep === 1 && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ mb: 3 }}>
                  Payment
                </Typography>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={paymentMethod}
                    label="Payment Method"
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <MenuItem value="card">Credit/Debit Card</MenuItem>
                    <MenuItem value="upi">UPI</MenuItem>
                    <MenuItem value="netbanking">Net Banking</MenuItem>
                    <MenuItem value="wallet">Digital Wallet</MenuItem>
                  </Select>
                </FormControl>
                
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Total Amount: ₹{pricing.total.toFixed(2)}
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Payment />}
                    onClick={handlePayment}
                    disabled={processingBooking}
                    sx={{ px: 4 }}
                  >
                    {processingBooking ? <CircularProgress size={24} /> : 'Proceed to Pay'}
                  </Button>
                </Box>
              </Paper>
            )}

            {currentStep === 2 && bookingData && (
              <Paper sx={{ p: 3 }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <ConfirmationNumber sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h4" sx={{ color: 'primary.main', mb: 1 }}>
                    Booking Confirmed!
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Booking ID: {bookingData.booking.booking_id}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="h6" sx={{ mb: 2 }}>Booking Details</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Movie:</Typography>
                    <Typography variant="body1">{movie.title}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Theater:</Typography>
                    <Typography variant="body1">{bookingData.theater.name}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Date & Time:</Typography>
                    <Typography variant="body1">
                      {new Date(bookingData.booking.show_time).toLocaleDateString()} at{' '}
                      {new Date(bookingData.booking.show_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Seats:</Typography>
                    <Typography variant="body1">
                      {bookingData.booking.seats.map(seat => seat.seat_id).join(', ')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Customer:</Typography>
                    <Typography variant="body1">{bookingData.booking.user_name}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Email:</Typography>
                    <Typography variant="body1">{bookingData.booking.user_email}</Typography>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/')}
                    sx={{ mr: 2 }}
                  >
                    Back to Home
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => window.print()}
                  >
                    Print Ticket
                  </Button>
                </Box>
              </Paper>
            )}
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Booking Summary
              </Typography>

              {selectedSeats.length > 0 && (
                <>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Selected Seats ({selectedSeats.length})
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {selectedSeats.map((seat) => (
                      <Chip
                        key={seat.seat_id}
                        label={seat.seat_id}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Base Price:</Typography>
                      <Typography variant="body2">₹{pricing.basePrice.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Convenience Fee:</Typography>
                      <Typography variant="body2">₹{pricing.convenienceFee.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Tax:</Typography>
                      <Typography variant="body2">₹{pricing.tax.toFixed(2)}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h6">Total:</Typography>
                      <Typography variant="h6" color="primary">₹{pricing.total.toFixed(2)}</Typography>
                    </Box>
                  </Box>
                </>
              )}

              <Box sx={{ mt: 3 }}>
                {currentStep > 0 && (
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handlePreviousStep}
                    sx={{ mb: 1 }}
                  >
                    Previous
                  </Button>
                )}
                {currentStep < 1 && (
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleNextStep}
                    disabled={currentStep === 0 && selectedSeats.length === 0}
                    startIcon={!isAuthenticated && currentStep === 0 && selectedSeats.length > 0 ? <LoginOutlined /> : undefined}
                  >
                    {!isAuthenticated && currentStep === 0 && selectedSeats.length > 0 ? 'Login to Continue' : 'Next'}
                  </Button>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Footer />
    </Box>
  );
};

export default SeatSelection;