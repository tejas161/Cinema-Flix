import React from 'react';
import { Box } from '@mui/material';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import MovieSection from '../components/MovieSection';
import Footer from '../components/Footer';
import { nowPlayingMovies, comingSoonMovies, trendingMovies } from '../data/sampleMovies';

const HomePage = () => {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Header />
      <HeroSection />
      
      {/* Movie Sections */}
      <MovieSection 
        title="Now Playing" 
        movies={nowPlayingMovies} 
      />
      
      <MovieSection 
        title="Coming Soon" 
        movies={comingSoonMovies} 
      />
      
      <MovieSection 
        title="Trending Now" 
        movies={trendingMovies} 
      />
      
      <Footer />
    </Box>
  );
};

export default HomePage;