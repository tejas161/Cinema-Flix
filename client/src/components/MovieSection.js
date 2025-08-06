import React from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import MovieCard from './MovieCard';

const MovieSection = ({ title, movies, showViewAll = true }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Determine how many movies to show based on screen size
  const getMoviesToShow = () => {
    if (isMobile) return movies.slice(0, 2);
    if (isTablet) return movies.slice(0, 3);
    return movies.slice(0, 4);
  };

  const moviesToShow = getMoviesToShow();

  return (
    <Box sx={{ py: { xs: 3, md: 4 }, backgroundColor: 'background.default' }}>
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
            px: { xs: 2, md: 0 }
          }}
        >
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontWeight: 600,
              fontSize: { xs: '1.5rem', md: '2rem' },
              color: 'text.primary',
            }}
          >
            {title}
          </Typography>
          
          {showViewAll && (
            <Button
              endIcon={<ArrowForward />}
              sx={{
                color: 'primary.main',
                textTransform: 'none',
                fontSize: { xs: '0.8rem', md: '0.9rem' },
                '&:hover': {
                  backgroundColor: 'rgba(229, 9, 20, 0.1)',
                },
              }}
            >
              {isMobile ? 'View All' : 'See All'}
            </Button>
          )}
        </Box>

        {/* Movies Grid */}
        <Box sx={{ px: { xs: 2, md: 0 } }}>
          <Grid container spacing={{ xs: 2, md: 3 }}>
            {moviesToShow.map((movie, index) => (
              <Grid
                item
                xs={6}
                sm={4}
                md={3}
                key={movie.id || index}
              >
                <MovieCard movie={movie} />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Mobile View All Button */}
        {showViewAll && isMobile && (
          <Box sx={{ textAlign: 'center', mt: 3, px: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              endIcon={<ArrowForward />}
              sx={{
                py: 1.5,
                borderColor: 'primary.main',
                color: 'primary.main',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(229, 9, 20, 0.1)',
                  borderColor: 'primary.main',
                },
              }}
            >
              View All {title}
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default MovieSection;