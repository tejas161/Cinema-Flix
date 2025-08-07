import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
  InputBase,
  alpha,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  AccountCircle,
  MovieFilter,
  Login as LoginIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const menuItems = ['Movies', 'Events', 'Sports', 'Activities'];

  const drawer = (
    <Box sx={{ textAlign: 'center', pt: 2 }}>
      <Typography variant="h6" sx={{ my: 2, color: 'primary.main' }}>
        CinemaFlix
      </Typography>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item} disablePadding onClick={handleDrawerToggle}>
            <ListItemText primary={item} sx={{ textAlign: 'center' }} />
          </ListItem>
        ))}
        <ListItem disablePadding>
          <Box sx={{ width: '100%', p: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<LoginIcon />}
              onClick={() => {
                handleDrawerToggle();
                handleLoginClick();
              }}
              fullWidth
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                py: 1.5,
              }}
            >
              Sign In
            </Button>
          </Box>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" elevation={0} sx={{ backgroundColor: 'background.default', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Toolbar>
          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: isMobile ? 1 : 0 }}>
            <MovieFilter sx={{ mr: 1, color: 'primary.main' }} />
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                mr: 4,
                fontSize: { xs: '1.2rem', md: '1.5rem' }
              }}
            >
              CinemaFlix
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              {menuItems.map((item) => (
                <Button
                  key={item}
                  color="inherit"
                  sx={{ 
                    mx: 1, 
                    fontSize: '0.9rem',
                    '&:hover': {
                      color: 'primary.main',
                    }
                  }}
                >
                  {item}
                </Button>
              ))}
            </Box>
          )}

          {/* Search Bar */}
          <Box
            sx={{
              position: 'relative',
              borderRadius: 1,
              backgroundColor: alpha(theme.palette.common.white, 0.15),
              '&:hover': {
                backgroundColor: alpha(theme.palette.common.white, 0.25),
              },
              marginLeft: { xs: 1, md: 2 },
              width: { xs: '120px', sm: '200px', md: '300px' },
            }}
          >
            <Box
              sx={{
                padding: theme.spacing(0, 2),
                height: '100%',
                position: 'absolute',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SearchIcon />
            </Box>
            <InputBase
              placeholder="Search movies, events..."
              sx={{
                color: 'inherit',
                width: '100%',
                '& .MuiInputBase-input': {
                  padding: theme.spacing(1, 1, 1, 0),
                  paddingLeft: `calc(1em + ${theme.spacing(4)})`,
                  fontSize: { xs: '0.8rem', md: '1rem' }
                },
              }}
            />
          </Box>

          {/* Login Button */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<LoginIcon />}
            onClick={handleLoginClick}
            sx={{ 
              ml: 2,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: { xs: 1, md: 2 },
              fontSize: { xs: '0.8rem', md: '0.9rem' },
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(229, 9, 20, 0.3)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            {isMobile ? '' : 'Sign In'}
          </Button>

          {/* User Account (hidden for now, can be shown after login) */}
          <IconButton
            size="large"
            edge="end"
            color="inherit"
            sx={{ ml: 1, display: 'none' }} // Hidden until user is logged in
          >
            <AccountCircle />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Header;