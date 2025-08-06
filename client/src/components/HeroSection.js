import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { PlayArrow, Add } from '@mui/icons-material';

const HeroSection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Sample featured movie data
  const featuredMovie = {
    title: "Avengers: Endgame",
    description: "After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos' actions and restore balance to the universe.",
    rating: "8.4",
    genre: "Action, Adventure, Drama",
    backgroundImage: "https://images.unsplash.com/photo-1489599611389-c5b8b0fa9dc4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
  };

  return (
    <Box
      sx={{
        position: 'relative',
        height: { xs: '60vh', md: '80vh' },
        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url(${featuredMovie.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        color: 'white',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            maxWidth: { xs: '100%', md: '50%' },
            pl: { xs: 2, md: 4 },
            pr: { xs: 2, md: 0 },
          }}
        >
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            }}
          >
            {featuredMovie.title}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
            <Typography
              variant="body1"
              sx={{
                backgroundColor: 'secondary.main',
                color: 'black',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontWeight: 600,
                mr: 2,
                mb: { xs: 1, md: 0 }
              }}
            >
              ⭐ {featuredMovie.rating}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {featuredMovie.genre}
            </Typography>
          </Box>

          <Typography
            variant="body1"
            sx={{
              mb: 4,
              fontSize: { xs: '0.9rem', md: '1.1rem' },
              lineHeight: 1.6,
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
              display: { xs: 'none', sm: 'block' }
            }}
          >
            {featuredMovie.description}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' }
            }}
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<PlayArrow />}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: { xs: '0.9rem', md: '1.1rem' },
                fontWeight: 600,
              }}
            >
              {isMobile ? 'Book Now' : 'Book Tickets'}
            </Button>
            
            <Button
              variant="outlined"
              color="inherit"
              size="large"
              startIcon={<Add />}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: { xs: '0.9rem', md: '1.1rem' },
                borderColor: 'rgba(255,255,255,0.5)',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              My List
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection;