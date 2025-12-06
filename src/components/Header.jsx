// src/components/Header.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Logout,
  Person,
  Dashboard,
  Menu as MenuIcon,
  Warning,
  Settings,
  PersonAdd,
  HowToReg,
} from '@mui/icons-material';
import { logoutUser } from '../slices/authSlice';
import { getPendingUsers } from '../slices/userManagementSlice';
import { toast } from 'react-toastify';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { pendingUsers } = useSelector((state) => state.userManagement);

  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  // Check if user is County Coordinator (exact match)
  const isCountyCoordinator = user?.role === 'County Coordinator';

  // Fetch pending users count for County Coordinators
  useEffect(() => {
    if (isCountyCoordinator && isAuthenticated) {
      dispatch(getPendingUsers());
    }
  }, [isCountyCoordinator, isAuthenticated, dispatch]);

  // Mock notifications - replace with real data later
  const notifications = [
    {
      id: 1,
      message: 'New emergency case in Wundanyi',
      time: '5 min ago',
      priority: 'high',
    },
    {
      id: 2,
      message: 'Route optimization completed',
      time: '15 min ago',
      priority: 'medium',
    },
    {
      id: 3,
      message: 'User invitation accepted',
      time: '1 hour ago',
      priority: 'low',
    },
  ];

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    toast.success('Logged out successfully');
    navigate('/login');
    handleMenuClose();
  };

  const handleInviteUser = () => {
    navigate('/invite-user');
  };

  const handlePendingUsers = () => {
    navigate('/pending-users');
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

  // Get user display name - prefer first_name/last_name, fallback to email
  const getDisplayName = () => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user.first_name) {
      return user.first_name;
    }
    if (user.email) {
      // Fallback to email-based name if no first_name/last_name
      const emailName = user.email.split('@')[0].replace(/[._-]/g, ' ');
      return emailName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    return 'User';
  };

  const formattedName = getDisplayName();

  // Check if user is County Coordinator (exact match)

  console.log('User role:', user.role); // Debug log
  console.log('Is County Coordinator:', isCountyCoordinator); // Debug log

  return (
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Hamburger Menu - Only on small screens */}
          <IconButton
            size="large"
            edge="start"
            sx={{ 
              color: '#000000',
              display: { xs: 'flex', md: 'none' }
            }}
          >
            <MenuIcon />
          </IconButton>

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
                }}
              >
                Emergency Response System
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Middle Section - County Info */}
        {user && (
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              backgroundColor: '#fcf8d8',
              padding: '8px 16px',
              borderRadius: '8px',
              gap: 1,
            }}
          >
            <Dashboard sx={{ color: '#000000', fontSize: 20 }} />
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

        {/* Right Section - Actions */}
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Pending Users Badge - Only for County Coordinators */}
            {isCountyCoordinator && pendingUsers.length > 0 && (
              <Tooltip title={`${pendingUsers.length} pending user${pendingUsers.length !== 1 ? 's' : ''}`} arrow>
                <IconButton
                  size="large"
                  onClick={handlePendingUsers}
                  sx={{
                    color: '#000000',
                    backgroundColor: '#fcf8d8',
                    '&:hover': {
                      backgroundColor: '#f4edc4',
                    },
                  }}
                >
                  <Badge badgeContent={pendingUsers.length} color="warning">
                    <HowToReg />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}

            {/* Invite User Button - Only for County Coordinators */}
            {isCountyCoordinator && (
              <Tooltip title="Invite User" arrow>
                <IconButton
                  size="large"
                  onClick={handleInviteUser}
                  sx={{
                    color: '#000000',
                    backgroundColor: '#fcf8d8',
                    '&:hover': {
                      backgroundColor: '#f4edc4',
                    },
                  }}
                >
                  <PersonAdd />
                </IconButton>
              </Tooltip>
            )}

            {/* Notifications */}
            <IconButton
              size="large"
              onClick={handleNotificationOpen}
              sx={{ color: '#000000' }}
            >
              <Badge badgeContent={notifications.length} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* Profile */}
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
          </Box>
        )}

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

          <MenuItem onClick={() => { navigate('/dashboard'); handleMenuClose(); }}>
            <ListItemIcon>
              <Dashboard fontSize="small" />
            </ListItemIcon>
            <ListItemText>Dashboard</ListItemText>
          </MenuItem>

          {/* Show Pending Users for County Coordinators */}
          {isCountyCoordinator && (
            <MenuItem onClick={() => { handlePendingUsers(); handleMenuClose(); }}>
              <ListItemIcon>
                <Badge badgeContent={pendingUsers.length} color="warning">
                  <HowToReg fontSize="small" />
                </Badge>
              </ListItemIcon>
              <ListItemText>Pending Users</ListItemText>
            </MenuItem>
          )}

          {/* Show Invite User option for County Coordinators */}
          {isCountyCoordinator && (
            <MenuItem onClick={() => { handleInviteUser(); handleMenuClose(); }}>
              <ListItemIcon>
                <PersonAdd fontSize="small" />
              </ListItemIcon>
              <ListItemText>Invite User</ListItemText>
            </MenuItem>
          )}

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

        {/* Notifications Menu */}
        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 320,
              maxHeight: 400,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5, backgroundColor: '#fcf8d8' }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, color: '#000000' }}
            >
              Notifications
            </Typography>
          </Box>

          <Divider />

          {notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={handleMenuClose}
              sx={{
                py: 1.5,
                borderLeft: `3px solid ${
                  notification.priority === 'high'
                    ? '#ff6b6b'
                    : notification.priority === 'medium'
                    ? '#ffa500'
                    : '#4caf50'
                }`,
                '&:hover': {
                  backgroundColor: '#fcf8d8',
                },
              }}
            >
              <Box sx={{ width: '100%' }}>
                <Typography
                  variant="body2"
                  sx={{ color: '#000000', fontWeight: 500 }}
                >
                  {notification.message}
                </Typography>
                <Typography variant="caption" sx={{ color: '#666666' }}>
                  {notification.time}
                </Typography>
              </Box>
            </MenuItem>
          ))}

          <Divider />

          <MenuItem
            onClick={handleMenuClose}
            sx={{
              justifyContent: 'center',
              color: '#000000',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#fcf8d8',
              },
            }}
          >
            View All Notifications
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;