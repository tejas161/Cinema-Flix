import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
  Stack,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import GoogleIcon from '@mui/icons-material/Google';
import MovieIcon from '@mui/icons-material/Movie';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Simple design with no animations

// Styled components
const LoginContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const GoogleButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 4),
  fontSize: '1rem',
  fontWeight: 600,
  borderRadius: 4,
  textTransform: 'none',
  backgroundColor: '#4285f4',
  color: 'white',
  border: 'none',
  '&:hover': {
    backgroundColor: '#3367d6',
  }
}));

const BackButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  left: theme.spacing(2),
  color: theme.palette.text.secondary,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    color: theme.palette.primary.main,
  }
}));



const LoginPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect to home if already authenticated (but wait for auth loading to complete)
    if (!authLoading && isAuthenticated) {
      navigate('/');
      return;
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    // Check for error parameters (separate effect to avoid dependency issues)
    const errorParam = searchParams.get('error');
    if (errorParam) {
      const errorMessages = {
        auth_failed: 'Authentication failed. Please try again.',
        user_info_failed: 'Failed to retrieve user information.',
        decode_failed: 'Failed to process user data.',
        parse_error: 'Failed to parse authentication data.',
        no_user_data: 'No user data received.',
      };
      setError(errorMessages[errorParam] || 'An unknown error occurred.');
    }
  }, [searchParams]);

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    setError('');
    
    // Redirect to backend OAuth endpoint
    window.location.href = process.env.REACT_APP_SERVER_URL + '/auth/google/login';
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  // Show loading while auth context is initializing
  if (authLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LoginContainer>
      <Tooltip title="Back to Home" placement="right">
        <BackButton
          onClick={handleBackToHome}
          aria-label="Back to home"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleBackToHome();
            }
          }}
        >
          <ArrowBackIcon />
        </BackButton>
      </Tooltip>

      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
            <MovieIcon sx={{ fontSize: 48, color: theme.palette.primary.main, mr: 1 }} />
            <Typography
              variant="h3"
              component="h1"
              fontWeight="bold"
              sx={{
                color: theme.palette.primary.main,
              }}
            >
              CinemaFlix
            </Typography>
          </Box>

          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              mb: 4,
            }}
          >
            Welcome Back
          </Typography>

          <Stack spacing={3} alignItems="center">
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  width: '100%', 
                  maxWidth: '400px',
                  borderRadius: 2
                }}
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            )}
            
            <GoogleButton
              variant="contained"
              size="large"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              fullWidth={isMobile}
              aria-label="Sign in with Google"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleGoogleSignIn();
                }
              }}
              sx={{
                minWidth: isMobile ? '100%' : '280px',
                py: 1.5,
              }}
            >
              {isLoading ? 'Redirecting...' : 'Continue with Google'}
            </GoogleButton>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ 
                fontSize: '0.9rem',
                opacity: 0.7,
                maxWidth: '280px'
              }}
            >
              Join millions discovering their next favorite movie
            </Typography>
          </Stack>
        </Box>
      </Container>
    </LoginContainer>
  );
};

export default LoginPage;