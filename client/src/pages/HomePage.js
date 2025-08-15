import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import MovieSection from '../components/MovieSection';
import Footer from '../components/Footer';
import { getNowPlayingMovies, getComingSoonMovies, getTrendingMovies } from '../data/moviesData';

const HomePage = () => {
  const navigate = useNavigate();
  
  const nowPlayingMovies = getNowPlayingMovies();
  const comingSoonMovies = getComingSoonMovies();
  const trendingMovies = getTrendingMovies();

  const handleSeeAllMovies = () => {
    navigate('/movies');
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Header />
      <HeroSection />
      
      {/* Quick Access to Movies */}
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
          Discover Amazing Movies
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          Browse our extensive collection of movies with advanced search and filters
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={handleSeeAllMovies}
          sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
        >
          Explore All Movies
        </Button>
      </Container>
      
      {/* Movie Sections */}
      <MovieSection 
        title="Now Playing" 
        movies={nowPlayingMovies.slice(0, 6)} 
        onMovieClick={(movieId) => navigate(`/movie/${movieId}`)}
        onSeeAll={() => navigate('/movies')}
      />
      
      <MovieSection 
        title="Coming Soon" 
        movies={comingSoonMovies.slice(0, 6)} 
        onMovieClick={(movieId) => navigate(`/movie/${movieId}`)}
        onSeeAll={() => navigate('/movies')}
      />
      
      <MovieSection 
        title="Trending Now" 
        movies={trendingMovies.slice(0, 6)} 
        onMovieClick={(movieId) => navigate(`/movie/${movieId}`)}
        onSeeAll={() => navigate('/movies')}
      />
      
      <Footer />
    </Box>
  );
};

export default HomePage;