import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { PlayArrow, Favorite, Star } from '@mui/icons-material';

const MovieCard = ({ movie }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Card
      sx={{
        width: '100%',
        height: { xs: 320, sm: 400 },
        position: 'relative',
        cursor: 'pointer',
        overflow: 'hidden',
      }}
    >
      <CardMedia
        component="img"
        height={isMobile ? "200" : "250"}
        image={movie.poster}
        alt={movie.title}
        sx={{
          objectFit: 'cover',
        }}
      />
      
      {/* Overlay for hover effect */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(transparent 60%, rgba(0,0,0,0.8) 100%)',
          opacity: 0,
          transition: 'opacity 0.3s ease-in-out',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&:hover': {
            opacity: 1,
          },
        }}
      >
        <IconButton
          sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          <PlayArrow sx={{ fontSize: 30 }} />
        </IconButton>
      </Box>

      {/* Rating Badge */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          backgroundColor: 'rgba(0,0,0,0.8)',
          borderRadius: 1,
          px: 1,
          py: 0.5,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Star sx={{ fontSize: 16, color: 'secondary.main', mr: 0.5 }} />
        <Typography variant="body2" sx={{ color: 'white', fontSize: '0.8rem' }}>
          {movie.rating}
        </Typography>
      </Box>

      {/* Favorite Button */}
      <IconButton
        sx={{
          position: 'absolute',
          top: 8,
          left: 8,
          backgroundColor: 'rgba(0,0,0,0.6)',
          color: 'white',
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.8)',
            color: 'primary.main',
          },
        }}
        size="small"
      >
        <Favorite sx={{ fontSize: 18 }} />
      </IconButton>

      <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontWeight: 600,
            mb: 1,
            fontSize: { xs: '0.9rem', sm: '1.1rem' },
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {movie.title}
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
          {movie.genres.slice(0, 2).map((genre, index) => (
            <Chip
              key={index}
              label={genre}
              size="small"
              variant="outlined"
              sx={{
                fontSize: '0.7rem',
                height: 20,
                color: 'text.secondary',
                borderColor: 'rgba(255,255,255,0.3)',
              }}
            />
          ))}
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontSize: '0.8rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {movie.duration} • {movie.language}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default MovieCard;