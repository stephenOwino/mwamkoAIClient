// src/components/Header.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Divider,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Logout,
  Person,
  Warning,
  Settings,
  ReportProblem,
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  DirectionsCar,
  Psychology,
  Map as MapIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { logoutUser } from '../slices/authSlice';
import { getEmergencyCases } from '../slices/emergencyCaseSlice';
import { toast } from 'react-toastify';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { cases } = useSelector((state) => state.emergencyCase);

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch emergency cases when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(getEmergencyCases());
    }
  }, [isAuthenticated, user, dispatch]);

  // Calculate urgent cases (High and Critical priority, non-resolved)
  const urgentCases = cases.filter(
    (c) => 
      (c.priority_level === 'HIGH' || c.priority_level === 'CRITICAL') && 
      c.case_status !== 'RESOLVED'
  );

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    toast.success('Logged out successfully');
    navigate('/login');
    handleMenuClose();
    setMobileMenuOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const getInitials = (email) => {
    if (!email) return 'U';
    const name = email.split('@')[0];
    const parts = name.split(/[._-]/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Don't render header if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  // Get user display name from email
  const displayName = user.email ? user.email.split('@')[0].replace(/[._-]/g, ' ') : 'User';
  const formattedName = displayName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Navigation items
  const navItems = [
    { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { label: 'Emergency Cases', icon: <ReportProblem />, path: '/emergency-cases', badge: urgentCases.length > 0 ? urgentCases.length : cases.length },
    { label: 'Routes & Map', icon: <MapIcon />, path: '/routes' },
    { label: 'Vehicles', icon: <DirectionsCar />, path: '/vehicles' },
    { label: 'AI Insights', icon: <Psychology />, path: '/ai-insights' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Left Section - Logo & Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning sx={{ color: '#ff6b6b', fontSize: 32 }} />
            <Box>
              <Typography
                variant="h6"
                sx={{
                  color: '#000000',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  lineHeight: 1,
                  fontSize: { xs: '1rem', md: '1.25rem' },
                }}
              >
                MWAMKO AI
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#666666',
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                Emergency Response System
              </Typography>
            </Box>
          </Box>

          {/* Desktop Navigation - Center */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {navItems.map((item) => (
                <Tooltip key={item.path} title={item.label} arrow>
                  <IconButton
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      color: isActive(item.path) ? '#ff6b6b' : '#666666',
                      backgroundColor: isActive(item.path) ? '#ffebee' : 'transparent',
                      '&:hover': {
                        backgroundColor: isActive(item.path) ? '#ffcdd2' : '#f5f5f5',
                      },
                      borderRadius: '8px',
                      px: 2,
                    }}
                  >
                    {item.badge ? (
                      <Badge 
                        badgeContent={item.badge} 
                        color={urgentCases.length > 0 ? "error" : "primary"}
                        max={99}
                      >
                        {item.icon}
                      </Badge>
                    ) : (
                      item.icon
                    )}
                  </IconButton>
                </Tooltip>
              ))}
            </Box>
          )}

          {/* Right Section - Profile & Mobile Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* County Info - Hidden on mobile */}
            {user && !isMobile && (
              <Box
                sx={{
                  display: { xs: 'none', lg: 'flex' },
                  alignItems: 'center',
                  backgroundColor: '#fcf8d8',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  gap: 1,
                  mr: 1,
                }}
              >
                <ReportProblem sx={{ color: '#000000', fontSize: 20 }} />
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: '#000000', fontWeight: 600, lineHeight: 1.2 }}
                  >
                    {user.county || 'Unknown County'} County
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: '#666666', fontSize: '0.75rem' }}
                  >
                    {user.role || 'User'}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                size="large"
                onClick={handleMobileMenuToggle}
                sx={{ color: '#000000' }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Profile Button */}
            <Tooltip title="Profile">
              <IconButton
                size="large"
                edge="end"
                onClick={handleProfileMenuOpen}
                sx={{ color: '#000000' }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    backgroundColor: '#fcf8d8',
                    color: '#000000',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                >
                  {getInitials(user.email)}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>

          {/* Profile Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 250,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5, backgroundColor: '#fcf8d8' }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, color: '#000000' }}
              >
                {formattedName}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: '#666666', fontSize: '0.85rem' }}
              >
                {user.email}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#000000',
                  backgroundColor: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  display: 'inline-block',
                  mt: 0.5,
                  fontWeight: 600,
                }}
              >
                {user.role}
              </Typography>
            </Box>

            <Divider />

            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              <ListItemText>My Profile</ListItemText>
            </MenuItem>

            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              <ListItemText>Settings</ListItemText>
            </MenuItem>

            <Divider />

            <MenuItem onClick={handleLogout} sx={{ color: '#ff6b6b' }}>
              <ListItemIcon>
                <Logout fontSize="small" sx={{ color: '#ff6b6b' }} />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer Menu */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={handleMobileMenuToggle}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            backgroundColor: '#ffffff',
          },
        }}
      >
        <Box sx={{ width: 280 }}>
          {/* Drawer Header */}
          <Box
            sx={{
              p: 2,
              backgroundColor: '#fcf8d8',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#000000' }}>
                Menu
              </Typography>
              <Typography variant="caption" sx={{ color: '#666666' }}>
                {user.county || 'Unknown'} County
              </Typography>
            </Box>
            <IconButton onClick={handleMobileMenuToggle}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider />

          {/* Navigation Items */}
          <List>
            {navItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  selected={isActive(item.path)}
                  sx={{
                    py: 2,
                    backgroundColor: isActive(item.path) ? '#ffebee' : 'transparent',
                    '&:hover': {
                      backgroundColor: isActive(item.path) ? '#ffcdd2' : '#f5f5f5',
                    },
                    '&.Mui-selected': {
                      backgroundColor: '#ffebee',
                      '&:hover': {
                        backgroundColor: '#ffcdd2',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: isActive(item.path) ? '#ff6b6b' : '#666666' }}>
                    {item.badge ? (
                      <Badge 
                        badgeContent={item.badge} 
                        color={urgentCases.length > 0 ? "error" : "primary"}
                        max={99}
                      >
                        {item.icon}
                      </Badge>
                    ) : (
                      item.icon
                    )}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: isActive(item.path) ? 600 : 400,
                      color: isActive(item.path) ? '#ff6b6b' : '#000000',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Divider />

          {/* User Actions */}
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={handleMenuClose}>
                <ListItemIcon>
                  <Person />
                </ListItemIcon>
                <ListItemText primary="My Profile" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={handleMenuClose}>
                <ListItemIcon>
                  <Settings />
                </ListItemIcon>
                <ListItemText primary="Settings" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon>
                  <Logout sx={{ color: '#ff6b6b' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Logout" 
                  primaryTypographyProps={{ color: '#ff6b6b', fontWeight: 600 }}
                />
              </ListItemButton>
            </ListItem>
          </List>

          {/* Footer */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              p: 2,
              backgroundColor: '#f5f5f5',
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" sx={{ color: '#666666' }}>
              MWAMKO AI v1.0
            </Typography>
            <Typography variant="caption" display="block" sx={{ color: '#999999' }}>
              Emergency Response System
            </Typography>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default Header;