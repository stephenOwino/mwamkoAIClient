// src/pages/VehiclesPage.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  LocalShipping,
  Add,
  Refresh,
  LocationOn,
  CheckCircle,
  Error,
  Build,
} from '@mui/icons-material';
import { getVehicles, createVehicle, clearVehicleMessages } from '../slices/vehicleSlice';
import { toast } from 'react-toastify';

const VEHICLE_TYPES = ['Ambulance', 'Fire Truck', 'Rescue Van', 'Police Car', 'Utility Vehicle'];
const VEHICLE_STATUSES = {
  'AVAILABLE': { color: '#4caf50', icon: <CheckCircle /> },
  'RESPONDING': { color: '#2196f3', icon: <LocalShipping /> },
  'ON_SCENE': { color: '#ffa500', icon: <Build /> },
  'MAINTENANCE': { color: '#ff6b6b', icon: <Error /> },
};

const VehiclesPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { vehicles, loading, creatingVehicle, error, successMessage } = useSelector(
    (state) => state.vehicle
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    registration_plate: '',
    vehicle_type: '',
    current_status: 'AVAILABLE',
    current_occupancy: 0,
    current_location: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const canCreateVehicle = user?.role === 'County Coordinator' || 
                           user?.role === 'Community Manager' || 
                           user?.role === 'Rescue Team';

  useEffect(() => {
    dispatch(getVehicles());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearVehicleMessages());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearVehicleMessages());
      setDialogOpen(false);
      setFormData({
        registration_plate: '',
        vehicle_type: '',
        current_status: 'AVAILABLE',
        current_occupancy: 0,
        current_location: '',
      });
    }
  }, [error, successMessage, dispatch]);

  const handleRefresh = () => {
    dispatch(getVehicles());
    toast.info('Refreshing vehicles...');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.registration_plate) errors.registration_plate = 'Registration plate required';
    if (!formData.vehicle_type) errors.vehicle_type = 'Vehicle type required';
    if (!formData.current_location) errors.current_location = 'Current location required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      dispatch(createVehicle(formData));
    }
  };

  const getStatusStats = () => {
    return Object.keys(VEHICLE_STATUSES).map(status => ({
      status,
      count: vehicles.filter(v => v.current_status === status).length,
      ...VEHICLE_STATUSES[status],
    }));
  };

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', backgroundColor: '#f5f5f5', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LocalShipping sx={{ fontSize: 40, color: '#000000' }} />
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  Vehicle Fleet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage rescue vehicles in {user?.county} County
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Refresh">
                <IconButton
                  onClick={handleRefresh}
                  disabled={loading}
                  sx={{ backgroundColor: '#ffffff', '&:hover': { backgroundColor: '#fcf8d8' } }}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>

              {canCreateVehicle && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setDialogOpen(true)}
                  sx={{
                    backgroundColor: '#000000',
                    '&:hover': { backgroundColor: '#333333' },
                  }}
                >
                  Add Vehicle
                </Button>
              )}
            </Box>
          </Box>

          {/* Status Stats */}
          <Grid container spacing={2}>
            {getStatusStats().map((stat) => (
              <Grid item xs={6} sm={3} key={stat.status}>
                <Paper elevation={2} sx={{ p: 2, borderLeft: `4px solid ${stat.color}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {stat.icon}
                    <Typography variant="body2" fontWeight={600}>
                      {stat.status.replace('_', ' ')}
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight={700} sx={{ color: stat.color }}>
                    {stat.count}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Vehicles Grid */}
        {loading && vehicles.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : vehicles.length === 0 ? (
          <Paper elevation={3} sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
            <LocalShipping sx={{ fontSize: 80, color: '#e0e0e0', mb: 2 }} />
            <Typography variant="h6" fontWeight={600} gutterBottom>
              No Vehicles Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {canCreateVehicle ? 'Add your first vehicle to get started.' : 'No vehicles available.'}
            </Typography>
            {canCreateVehicle && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setDialogOpen(true)}
                sx={{ backgroundColor: '#000000', '&:hover': { backgroundColor: '#333333' } }}
              >
                Add Vehicle
              </Button>
            )}
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {vehicles.map((vehicle) => (
              <Grid item xs={12} md={6} lg={4} key={vehicle.vehicle_id}>
                <Card
                  elevation={3}
                  sx={{
                    borderRadius: 2,
                    borderTop: `4px solid ${VEHICLE_STATUSES[vehicle.current_status]?.color || '#999'}`,
                    '&:hover': { boxShadow: '0 8px 16px rgba(0,0,0,0.2)' },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          {vehicle.registration_plate}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {vehicle.vehicle_type}
                        </Typography>
                      </Box>
                      <Chip
                        label={vehicle.current_status.replace('_', ' ')}
                        sx={{
                          backgroundColor: VEHICLE_STATUSES[vehicle.current_status]?.color,
                          color: '#ffffff',
                          fontWeight: 600,
                        }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <LocationOn sx={{ fontSize: 18, color: '#666666' }} />
                      <Typography variant="body2" color="text.secondary">
                        {vehicle.current_location || 'Location not set'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Chip size="small" label={`Occupancy: ${vehicle.current_occupancy || 0}`} />
                      <Chip size="small" label={`ID: ${vehicle.vehicle_id}`} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Create Vehicle Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add New Vehicle</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Registration Plate"
                  name="registration_plate"
                  value={formData.registration_plate}
                  onChange={handleChange}
                  error={!!formErrors.registration_plate}
                  helperText={formErrors.registration_plate}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Vehicle Type"
                  name="vehicle_type"
                  value={formData.vehicle_type}
                  onChange={handleChange}
                  error={!!formErrors.vehicle_type}
                  helperText={formErrors.vehicle_type}
                >
                  {VEHICLE_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Status"
                  name="current_status"
                  value={formData.current_status}
                  onChange={handleChange}
                >
                  {Object.keys(VEHICLE_STATUSES).map((status) => (
                    <MenuItem key={status} value={status}>{status.replace('_', ' ')}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current Location"
                  name="current_location"
                  value={formData.current_location}
                  onChange={handleChange}
                  error={!!formErrors.current_location}
                  helperText={formErrors.current_location}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Current Occupancy"
                  name="current_occupancy"
                  value={formData.current_occupancy}
                  onChange={handleChange}
                  inputProps={{ min: 0 }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDialogOpen(false)} disabled={creatingVehicle}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={creatingVehicle}
              sx={{ backgroundColor: '#000000', '&:hover': { backgroundColor: '#333333' } }}
            >
              {creatingVehicle ? <CircularProgress size={24} /> : 'Add Vehicle'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default VehiclesPage;