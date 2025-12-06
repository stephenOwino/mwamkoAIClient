// src/pages/InviteUserPage.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  PersonAdd,
  Email,
  Person,
  Phone,
  Badge,
  LocationOn,
} from '@mui/icons-material';
import { inviteUser, clearInviteMessages } from '../slices/inviteSlice';
import { toast } from 'react-toastify';

const InviteUserPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { loading, error, successMessage } = useSelector((state) => state.invite);

  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    id_number: '',
    county: user?.county || '',
    phone_number: '',
  });

  const [formErrors, setFormErrors] = useState({});

  // Check if user is County Coordinator
  useEffect(() => {
    if (user?.role !== 'County Coordinator') {
      toast.error('Only County Coordinators can invite users');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Handle success/error messages
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearInviteMessages());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearInviteMessages());
      // Reset form
      setFormData({
        email: '',
        first_name: '',
        last_name: '',
        id_number: '',
        county: user?.county || '',
        phone_number: '',
      });
      setFormErrors({});
    }
  }, [error, successMessage, dispatch, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.first_name) {
      errors.first_name = 'First name is required';
    }

    if (!formData.last_name) {
      errors.last_name = 'Last name is required';
    }

    if (!formData.id_number) {
      errors.id_number = 'ID number is required';
    }

    if (!formData.phone_number) {
      errors.phone_number = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone_number)) {
      errors.phone_number = 'Phone number is invalid';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      dispatch(inviteUser(formData));
    }
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        backgroundColor: '#f5f5f5',
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <PersonAdd sx={{ fontSize: 48, color: '#000000', mb: 2 }} />
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Invite User
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Send an invitation to a new user in {user?.county} County
            </Typography>
          </Box>

          {/* Info Alert */}
          <Alert severity="info" sx={{ mb: 3 }}>
            As a County Coordinator, you can only invite users within your county ({user?.county} County).
          </Alert>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Email */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Grid>

              {/* First Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  error={!!formErrors.first_name}
                  helperText={formErrors.first_name}
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Grid>

              {/* Last Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  error={!!formErrors.last_name}
                  helperText={formErrors.last_name}
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Grid>

              {/* ID Number */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ID Number"
                  name="id_number"
                  value={formData.id_number}
                  onChange={handleChange}
                  error={!!formErrors.id_number}
                  helperText={formErrors.id_number}
                  InputProps={{
                    startAdornment: <Badge sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Grid>

              {/* Phone Number */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  error={!!formErrors.phone_number}
                  helperText={formErrors.phone_number}
                  placeholder="+254 XXX XXX XXX"
                  InputProps={{
                    startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Grid>

              {/* County (Read-only) */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="County"
                  name="county"
                  value={formData.county}
                  disabled
                  helperText="County is automatically set to your assigned county"
                  InputProps={{
                    startAdornment: <LocationOn sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                  sx={{
                    '& .MuiInputBase-input.Mui-disabled': {
                      WebkitTextFillColor: '#000000',
                      backgroundColor: '#fcf8d8',
                    },
                  }}
                />
              </Grid>

              {/* Buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/dashboard')}
                    disabled={loading}
                    sx={{
                      color: '#000000',
                      borderColor: '#000000',
                      '&:hover': {
                        borderColor: '#333333',
                        backgroundColor: '#f5f5f5',
                      },
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{
                      backgroundColor: '#000000',
                      '&:hover': {
                        backgroundColor: '#333333',
                      },
                      minWidth: 140,
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} sx={{ color: 'white' }} />
                    ) : (
                      'Send Invitation'
                    )}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default InviteUserPage;