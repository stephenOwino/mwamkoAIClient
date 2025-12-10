// src/components/CreateCaseDialog.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogContent,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
  Grid,
  Alert,
  IconButton,
  Stack,
  Paper,
} from '@mui/material';
import {
  Warning,
  LocationOn,
  MyLocation,
  Close,
} from '@mui/icons-material';
import { createEmergencyCase, clearEmergencyCaseMessages } from '../slices/emergencyCaseSlice';
import { toast } from 'react-toastify';

const VILLAGES = [
  'Mwatate', 'Voi Town', 'Taveta', 'Wundanyi', 'Bura', 'Chawia',
  'Kasigau', 'Sagalla', 'Mbololo', 'Werugha', 'Chala', 'Kishushe',
  'Kimala', 'Kaloleni', 'Marungu', 'Bomeni', 'Mahoo'
];

const DISASTER_TYPES = [
  'Fire', 'Floods', 'Earthquake', 'Landslide', 'Accident',
  'Medical Emergency', 'Building Collapse', 'Wildlife Conflict', 'Drought', 'Other'
];

const SEVERITY_LEVELS = [
  { value: 'Low', color: '#4caf50' },
  { value: 'Medium', color: '#ff9800' },
  { value: 'High', color: '#f44336' },
  { value: 'Critical', color: '#d32f2f' },
];

const COUNTY_BOUNDARIES = {
  latMin: -3.9,
  latMax: -3.0,
  lngMin: 37.6,
  lngMax: 38.8,
};

const CreateCaseDialog = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { creatingCase, error, successMessage } = useSelector((state) => state.emergencyCase);

  const [formData, setFormData] = useState({
    village: '',
    disaster_type: '',
    severity: '',
    description: '',
    location: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData({
        village: '',
        disaster_type: '',
        severity: '',
        description: '',
        location: '',
      });
      setFormErrors({});
    }
  }, [open]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearEmergencyCaseMessages());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearEmergencyCaseMessages());
      onClose();
    }
  }, [error, successMessage, dispatch, onClose]);

  const validateCoordinates = (location) => {
    const parts = location.split(',').map(p => p.trim());
    
    if (parts.length !== 2) {
      return { valid: false, message: 'Format: longitude,latitude' };
    }

    const lng = parseFloat(parts[0]);
    const lat = parseFloat(parts[1]);

    if (isNaN(lng) || isNaN(lat)) {
      return { valid: false, message: 'Invalid coordinates' };
    }

    const { latMin, latMax, lngMin, lngMax } = COUNTY_BOUNDARIES;
    if (lat < latMin || lat > latMax || lng < lngMin || lng > lngMax) {
      return { 
        valid: false, 
        message: 'Location outside Taita Taveta County' 
      };
    }

    return { valid: true, lng, lat };
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }

    setGettingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationString = `${longitude.toFixed(4)},${latitude.toFixed(4)}`;
        
        const validation = validateCoordinates(locationString);
        
        if (validation.valid) {
          setFormData(prev => ({ ...prev, location: locationString }));
          setFormErrors(prev => ({ ...prev, location: '' }));
          toast.success('Location captured');
        } else {
          toast.error(validation.message);
        }
        
        setGettingLocation(false);
      },
      (err) => {
        toast.error('Unable to get location');
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.village) errors.village = 'Required';
    if (!formData.disaster_type) errors.disaster_type = 'Required';
    if (!formData.severity) errors.severity = 'Required';
    if (!formData.description || formData.description.trim().length < 10) {
      errors.description = 'Minimum 10 characters';
    }
    if (!formData.location) {
      errors.location = 'Required';
    } else {
      const validation = validateCoordinates(formData.location);
      if (!validation.valid) {
        errors.location = validation.message;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      dispatch(createEmergencyCase(formData));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={1}>
            <Warning sx={{ color: 'error.main', fontSize: 28 }} />
            <Typography variant="h6" fontWeight={700}>
              Report Emergency
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>

        {/* Info Alert */}
        <Alert severity="info" sx={{ mb: 3 }}>
          Only emergencies within Taita Taveta County will be accepted
        </Alert>

        {/* Form */}
        <Stack spacing={2.5}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Village/Town"
                name="village"
                value={formData.village}
                onChange={handleChange}
                error={!!formErrors.village}
                helperText={formErrors.village}
              >
                {VILLAGES.map((v) => (
                  <MenuItem key={v} value={v}>{v}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Disaster Type"
                name="disaster_type"
                value={formData.disaster_type}
                onChange={handleChange}
                error={!!formErrors.disaster_type}
                helperText={formErrors.disaster_type}
              >
                {DISASTER_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          <TextField
            select
            fullWidth
            label="Severity Level"
            name="severity"
            value={formData.severity}
            onChange={handleChange}
            error={!!formErrors.severity}
            helperText={formErrors.severity}
          >
            {SEVERITY_LEVELS.map((level) => (
              <MenuItem key={level.value} value={level.value}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: level.color,
                    }}
                  />
                  {level.value}
                </Box>
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Location Coordinates"
            name="location"
            value={formData.location}
            onChange={handleChange}
            error={!!formErrors.location}
            helperText={formErrors.location || 'Format: longitude,latitude (e.g., 38.3736,-3.5025)'}
            placeholder="38.3736,-3.5025"
            InputProps={{
              startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />,
              endAdornment: (
                <IconButton
                  onClick={getCurrentLocation}
                  disabled={gettingLocation}
                  size="small"
                  sx={{ color: 'primary.main' }}
                >
                  {gettingLocation ? <CircularProgress size={20} /> : <MyLocation />}
                </IconButton>
              ),
            }}
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            error={!!formErrors.description}
            helperText={formErrors.description || 'Provide detailed information (minimum 10 characters)'}
            placeholder="Describe the emergency situation in detail..."
          />
        </Stack>

        {/* Actions */}
        <Box display="flex" justifyContent="flex-end" gap={1} mt={3}>
          <Button onClick={onClose} disabled={creatingCase}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={creatingCase}
            color="error"
            sx={{ minWidth: 140 }}
          >
            {creatingCase ? <CircularProgress size={24} color="inherit" /> : 'Report Emergency'}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default CreateCaseDialog;