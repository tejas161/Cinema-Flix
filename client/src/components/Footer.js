import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  YouTube,
  MovieFilter,
  Email,
  Phone,
  LocationOn,
} from '@mui/icons-material';

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const footerLinks = {
    movies: [
      'Now Playing',
      'Coming Soon',
      'Top Rated',
      'Popular Movies',
      'Movie Trailers'
    ],
    support: [
      'Help Center',
      'Contact Us',
      'Terms of Service',
      'Privacy Policy',
      'Refund Policy'
    ],
    company: [
      'About Us',
      'Careers',
      'Press',
      'Gift Cards',
      'Partnerships'
    ],
    features: [
      'Book Tickets',
      'Movie Reviews',
      'Showtimes',
      'Theater Locations',
      'Mobile App'
    ]
  };

  const socialLinks = [
    { icon: <Facebook />, name: 'Facebook', url: '#' },
    { icon: <Twitter />, name: 'Twitter', url: '#' },
    { icon: <Instagram />, name: 'Instagram', url: '#' },
    { icon: <YouTube />, name: 'YouTube', url: '#' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'background.paper',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        {/* Main Footer Content */}
        <Box sx={{ py: { xs: 4, md: 6 } }}>
          <Grid container spacing={{ xs: 3, md: 4 }}>
            {/* Brand Section */}
            <Grid item xs={12} md={3}>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <MovieFilter sx={{ mr: 1, color: 'primary.main', fontSize: 30 }} />
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{
                      fontWeight: 700,
                      color: 'primary.main',
                    }}
                  >
                    CinemaFlix
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3, lineHeight: 1.6 }}
                >
                  Your ultimate destination for movie tickets, reviews, and entertainment. 
                  Book your favorite movies with ease.
                </Typography>
                
                {/* Social Media Links */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {socialLinks.map((social, index) => (
                    <IconButton
                      key={index}
                      href={social.url}
                      sx={{
                        color: 'text.secondary',
                        '&:hover': {
                          color: 'primary.main',
                          backgroundColor: 'rgba(229, 9, 20, 0.1)',
                        },
                      }}
                      aria-label={social.name}
                    >
                      {social.icon}
                    </IconButton>
                  ))}
                </Box>
              </Box>
            </Grid>

            {/* Links Sections */}
            <Grid item xs={6} md={2.25}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  fontSize: '1rem',
                  color: 'text.primary',
                }}
              >
                Movies
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {footerLinks.movies.map((link, index) => (
                  <Link
                    key={index}
                    href="#"
                    sx={{
                      color: 'text.secondary',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    {link}
                  </Link>
                ))}
              </Box>
            </Grid>

            <Grid item xs={6} md={2.25}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  fontSize: '1rem',
                  color: 'text.primary',
                }}
              >
                Features
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {footerLinks.features.map((link, index) => (
                  <Link
                    key={index}
                    href="#"
                    sx={{
                      color: 'text.secondary',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    {link}
                  </Link>
                ))}
              </Box>
            </Grid>

            <Grid item xs={6} md={2.25}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  fontSize: '1rem',
                  color: 'text.primary',
                }}
              >
                Company
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {footerLinks.company.map((link, index) => (
                  <Link
                    key={index}
                    href="#"
                    sx={{
                      color: 'text.secondary',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    {link}
                  </Link>
                ))}
              </Box>
            </Grid>

            <Grid item xs={6} md={2.25}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  fontSize: '1rem',
                  color: 'text.primary',
                }}
              >
                Support
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {footerLinks.support.map((link, index) => (
                  <Link
                    key={index}
                    href="#"
                    sx={{
                      color: 'text.secondary',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    {link}
                  </Link>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

        {/* Contact Info Section */}
        {!isMobile && (
          <Box sx={{ py: 3 }}>
            <Grid container spacing={4}>
              <Grid item md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Email sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    support@cinemaflix.com
                  </Typography>
                </Box>
              </Grid>
              <Grid item md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Phone sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    1-800-CINEMA-1
                  </Typography>
                </Box>
              </Grid>
              <Grid item md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    Available in 100+ cities
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

        {/* Bottom Footer */}
        <Box
          sx={{
            py: 3,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} CinemaFlix. All rights reserved.
          </Typography>
          
          <Box
            sx={{
              display: 'flex',
              gap: { xs: 2, md: 3 },
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <Link
              href="#"
              sx={{
                color: 'text.secondary',
                textDecoration: 'none',
                fontSize: '0.875rem',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              sx={{
                color: 'text.secondary',
                textDecoration: 'none',
                fontSize: '0.875rem',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              sx={{
                color: 'text.secondary',
                textDecoration: 'none',
                fontSize: '0.875rem',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              Cookie Policy
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;