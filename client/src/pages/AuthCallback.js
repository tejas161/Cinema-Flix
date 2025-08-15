import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleLogin } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent processing multiple times
    if (hasProcessed.current) {
      return;
    }

    const handleAuthCallback = () => {
      hasProcessed.current = true;
      const userParam = searchParams.get('user');
      const error = searchParams.get('error');

      if (error) {
        console.error('Authentication error:', error);
        navigate('/login?error=' + error);
        return;
      }

      if (userParam) {
        try {
          const userData = JSON.parse(decodeURIComponent(userParam));
          console.log('User data received:', userData);
          handleLogin(userData);
          navigate('/');
        } catch (error) {
          console.error('Error parsing user data:', error);
          navigate('/login?error=parse_error');
        }
      } else {
        navigate('/login?error=no_user_data');
      }
    };

    // Add a small delay to ensure the component is fully mounted
    const timeoutId = setTimeout(handleAuthCallback, 100);
    
    return () => clearTimeout(timeoutId);
  }, []); // Empty dependency array to run only once

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" color="text.secondary">
        Completing sign in...
      </Typography>
    </Box>
  );
};

export default AuthCallback;
