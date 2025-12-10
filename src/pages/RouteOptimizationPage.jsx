// src/pages/RouteOptimizationPage.jsx
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
  Checkbox,
  CircularProgress,
  TextField,
  IconButton,
  Chip,
  Divider,
  Alert,
  List,
  ListItem,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Route as RouteIcon,
  MyLocation,
  Calculate,
  Save,
  Refresh,
  CheckCircle,
  LocationOn,
  Timer,
  DirectionsCar,
  Timeline,
  Map as MapIcon,
} from '@mui/icons-material';
import { getEmergencyCases } from '../slices/emergencyCaseSlice';
import { 
  calculateRoute, 
  clearRouteMessages, 
} from '../slices/routeSlice';
import RouteMapVisualization from '../components/RouteMapVisualization';
import { toast } from 'react-toastify';

const SEVERITY_COLORS = {
  'Low': '#4caf50',
  'Medium': '#ffa500',
  'High': '#ff6b6b',
  'Critical': '#d32f2f',
};

const RouteOptimizationPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cases, loading: casesLoading } = useSelector((state) => state.emergencyCase);
  const { 
    calculatedRoute, 
    calculating, 
    error: routeError, 
    successMessage 
  } = useSelector((state) => state.route);

  const [selectedCases, setSelectedCases] = useState([]);
  const [startPoint, setStartPoint] = useState('');
  const [startPointError, setStartPointError] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const steps = ['Select Cases', 'Set Start Point', 'Calculate Route', 'Review & Save'];

  // Fetch pending cases on mount
  useEffect(() => {
    dispatch(getEmergencyCases({ status: 'PENDING' }));
  }, [dispatch]);

  // Handle success/error messages from route calculation
  useEffect(() => {
    if (routeError) {
      toast.error(routeError);
      dispatch(clearRouteMessages());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearRouteMessages());
    }
  }, [routeError, successMessage, dispatch]);

  // Update step when route is calculated
  useEffect(() => {
    if (calculatedRoute) {
      setActiveStep(3);
    }
  }, [calculatedRoute]);

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationString = `${longitude.toFixed(4)},${latitude.toFixed(4)}`;
        setStartPoint(locationString);
        setStartPointError('');
        toast.success('Location captured successfully');
        setGettingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Unable to get your location. Please enter manually.');
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Toggle case selection
  const handleCaseToggle = (caseId) => {
    setSelectedCases(prev => {
      if (prev.includes(caseId)) {
        return prev.filter(id => id !== caseId);
      } else {
        return [...prev, caseId];
      }
    });
  };

  // Select all cases
  const handleSelectAll = () => {
    if (selectedCases.length === cases.length) {
      setSelectedCases([]);
    } else {
      setSelectedCases(cases.map(c => c.case_id));
    }
  };

  // Validate start point
  const validateStartPoint = () => {
    if (!startPoint.trim()) {
      setStartPointError('Start point is required');
      return false;
    }

    const parts = startPoint.split(',').map(p => p.trim());
    if (parts.length !== 2) {
      setStartPointError('Format must be: longitude,latitude');
      return false;
    }

    const lng = parseFloat(parts[0]);
    const lat = parseFloat(parts[1]);

    if (isNaN(lng) || isNaN(lat)) {
      setStartPointError('Invalid coordinates');
      return false;
    }

    setStartPointError('');
    return true;
  };

  // Calculate route using Redux
  const handleCalculateRoute = () => {
    if (selectedCases.length === 0) {
      toast.error('Please select at least one case');
      return;
    }

    if (!validateStartPoint()) {
      toast.error('Please provide a valid start point');
      return;
    }

    dispatch(calculateRoute({
      case_ids: selectedCases,
      start_point_gps: startPoint,
    }));
  };

  // Save route (route is already saved by the API, just reset the form)
  const handleSaveRoute = () => {
    if (!calculatedRoute) {
      toast.error('No route to save');
      return;
    }

    toast.success('Route saved successfully!');
    
    // Reset form
    setSelectedCases([]);
    setStartPoint('');
    dispatch(clearCalculatedRoute());
    setActiveStep(0);
    
    // Refresh cases
    dispatch(getEmergencyCases({ status: 'PENDING' }));
  };

  // Format distance
  const formatDistance = (meters) => {
    if (meters < 1000) {
      return `${meters.toFixed(0)} m`;
    }
    return `${(meters / 1000).toFixed(2)} km`;
  };

  // Format duration
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        backgroundColor: '#f5f5f5',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <RouteIcon sx={{ fontSize: 40, color: '#2196f3' }} />
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Route Optimization
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Calculate optimal routes for emergency response in {user?.county || 'Taita Taveta'} County
              </Typography>
            </Box>
          </Box>

          {/* Stepper */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Stepper activeStep={activeStep}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>
        </Box>

        <Grid container spacing={3}>
          {/* Left Panel - Case Selection */}
          <Grid item xs={12} lg={4}>
            <Paper elevation={3} sx={{ p: 3, height: '100%', maxHeight: 'calc(100vh - 320px)', overflowY: 'auto' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>
                  Select Emergency Cases
                </Typography>
                <Button
                  size="small"
                  onClick={handleSelectAll}
                  disabled={casesLoading || cases.length === 0}
                  sx={{ color: '#2196f3' }}
                >
                  {selectedCases.length === cases.length ? 'Deselect All' : 'Select All'}
                </Button>
              </Box>

              {casesLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : cases.length === 0 ? (
                <Alert severity="info">
                  No pending emergency cases available. All cases may be resolved or assigned.
                </Alert>
              ) : (
                <>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Select cases to include in the route optimization. Selected: {selectedCases.length}
                  </Alert>
                  
                  <Box sx={{ maxHeight: 500, overflowY: 'auto' }}>
                    {cases.map((emergencyCase) => (
                      <Card
                        key={emergencyCase.case_id}
                        sx={{
                          mb: 2,
                          cursor: 'pointer',
                          border: selectedCases.includes(emergencyCase.case_id) 
                            ? '2px solid #2196f3' 
                            : '2px solid transparent',
                          '&:hover': {
                            boxShadow: 3,
                          },
                        }}
                        onClick={() => handleCaseToggle(emergencyCase.case_id)}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            <Checkbox
                              checked={selectedCases.includes(emergencyCase.case_id)}
                              sx={{ p: 0, mt: 0.5 }}
                            />
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#000' }}>
                                  {emergencyCase.disaster_type}
                                </Typography>
                                <Chip
                                  label={emergencyCase.severity}
                                  size="small"
                                  sx={{
                                    backgroundColor: SEVERITY_COLORS[emergencyCase.severity],
                                    color: '#ffffff',
                                    fontWeight: 600,
                                  }}
                                />
                              </Box>
                              <Typography variant="caption" sx={{ display: 'block', mb: 1, color: '#555' }}>
                                Case #{emergencyCase.case_id}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                <LocationOn sx={{ fontSize: 16, color: '#666' }} />
                                <Typography variant="body2" sx={{ color: '#333' }}>
                                  {emergencyCase.village}
                                </Typography>
                              </Box>
                              <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#666' }}>
                                {emergencyCase.location}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </>
              )}
            </Paper>
          </Grid>

          {/* Middle Panel - Route Configuration & Results */}
          <Grid item xs={12} lg={4}>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Starting Point
              </Typography>

              <TextField
                fullWidth
                label="Start Point GPS Coordinates"
                value={startPoint}
                onChange={(e) => {
                  setStartPoint(e.target.value);
                  setStartPointError('');
                }}
                error={!!startPointError}
                helperText={startPointError || 'Format: longitude,latitude (e.g., 38.3736,-3.5025)'}
                placeholder="38.3736,-3.5025"
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: <MyLocation sx={{ mr: 1, color: 'action.active' }} />,
                  endAdornment: (
                    <IconButton
                      onClick={getCurrentLocation}
                      disabled={gettingLocation}
                      sx={{ color: '#2196f3' }}
                    >
                      {gettingLocation ? (
                        <CircularProgress size={20} />
                      ) : (
                        <MyLocation />
                      )}
                    </IconButton>
                  ),
                }}
              />

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={calculating ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <Calculate />}
                onClick={handleCalculateRoute}
                disabled={calculating || selectedCases.length === 0 || !startPoint}
                sx={{
                  backgroundColor: '#2196f3',
                  '&:hover': {
                    backgroundColor: '#1976d2',
                  },
                  py: 1.5,
                }}
              >
                {calculating ? 'Calculating...' : 'Calculate Optimal Route'}
              </Button>
            </Paper>

            {/* Calculated Route Results */}
            {calculatedRoute && (
              <Paper elevation={3} sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CheckCircle sx={{ color: '#4caf50', fontSize: 28 }} />
                  <Typography variant="h6" fontWeight={700}>
                    Route Calculated Successfully!
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Route Summary */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <Paper elevation={0} sx={{ p: 2, backgroundColor: '#e3f2fd' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <DirectionsCar sx={{ color: '#2196f3' }} />
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          Total Distance
                        </Typography>
                      </Box>
                      <Typography variant="h5" fontWeight={700} sx={{ color: '#1976d2' }}>
                        {formatDistance(calculatedRoute.total_distance || 0)}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={6}>
                    <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f3e5f5' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Timer sx={{ color: '#9c27b0' }} />
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          Total Duration
                        </Typography>
                      </Box>
                      <Typography variant="h5" fontWeight={700} sx={{ color: '#7b1fa2' }}>
                        {formatDuration(calculatedRoute.total_duration || 0)}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Route Waypoints */}
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Timeline sx={{ color: '#2196f3' }} />
                  Optimized Route Order
                </Typography>

                <List sx={{ p: 0 }}>
                  {/* Start Point */}
                  <ListItem
                    sx={{
                      border: '2px solid #4caf50',
                      borderRadius: 2,
                      mb: 1,
                      backgroundColor: '#e8f5e9',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Chip
                        label="START"
                        size="small"
                        sx={{
                          backgroundColor: '#4caf50',
                          color: '#ffffff',
                          fontWeight: 700,
                        }}
                      />
                      <Box>
                        <Typography variant="body2" fontWeight={600} sx={{ color: '#000' }}>
                          Starting Point
                        </Typography>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#555' }}>
                          {startPoint}
                        </Typography>
                      </Box>
                    </Box>
                  </ListItem>

                  {/* Waypoints */}
                  {calculatedRoute.route_order?.map((caseId, index) => {
                    const emergencyCase = cases.find(c => c.case_id === caseId);
                    return (
                      <ListItem
                        key={caseId}
                        sx={{
                          border: '2px solid #2196f3',
                          borderRadius: 2,
                          mb: 1,
                          backgroundColor: '#e3f2fd',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                          <Chip
                            label={index + 1}
                            size="small"
                            sx={{
                              backgroundColor: '#2196f3',
                              color: '#ffffff',
                              fontWeight: 700,
                              minWidth: 40,
                            }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight={600} sx={{ color: '#000' }}>
                              {emergencyCase?.disaster_type || 'Unknown'} - {emergencyCase?.village || 'Unknown'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#555' }}>
                              Case #{caseId}
                            </Typography>
                          </Box>
                          <Chip
                            label={emergencyCase?.severity || 'Unknown'}
                            size="small"
                            sx={{
                              backgroundColor: SEVERITY_COLORS[emergencyCase?.severity] || '#999',
                              color: '#ffffff',
                            }}
                          />
                        </Box>
                      </ListItem>
                    );
                  })}
                </List>

                <Divider sx={{ my: 3 }} />

                {/* Save Button */}
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<Save />}
                  onClick={handleSaveRoute}
                  sx={{
                    backgroundColor: '#4caf50',
                    '&:hover': {
                      backgroundColor: '#388e3c',
                    },
                    py: 1.5,
                  }}
                >
                  Save Route & Assign to Response Team
                </Button>
              </Paper>
            )}
          </Grid>

          {/* Right Panel - Map Visualization */}
          <Grid item xs={12} lg={4}>
            <Box sx={{ height: 'calc(100vh - 320px)', minHeight: 500 }}>
              <RouteMapVisualization
                startPoint={startPoint}
                cases={cases}
                routeOrder={calculatedRoute?.route_order}
                showRoute={!!calculatedRoute}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default RouteOptimizationPage;