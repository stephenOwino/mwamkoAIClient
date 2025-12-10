// src/pages/RoutesMapPage.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MapContainer, TileLayer, Marker, Popup, Polyline, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Route as RouteIcon,
  Add,
  Refresh,
  Close,
  Speed,
  Timer,
  Layers,
} from '@mui/icons-material';
import {
  calculateRoute,
  getAllRoutes,
  getRouteDetails,
  clearRouteMessages,
  setCurrentRoute,
} from '../slices/routeSlice';
import { getEmergencyCases } from '../slices/emergencyCaseSlice';
import { toast } from 'react-toastify';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon
const startIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Map controller for centering
function MapController({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 13);
    }
  }, [center, zoom, map]);
  
  return null;
}

const RoutesMapPage = () => {
  const dispatch = useDispatch();
  const { cases } = useSelector((state) => state.emergencyCase);
  const {
    routes,
    currentRoute,
    routeDetails,
    calculating,
    fetchingDetails,
    error,
    successMessage,
  } = useSelector((state) => state.route);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedCaseIds, setSelectedCaseIds] = useState([]);
  const [startPoint, setStartPoint] = useState('-3.3869,38.5656');
  const [mapCenter] = useState([-3.3869, 38.5656]); // Taita Taveta County center
  const [showRoadNetwork, setShowRoadNetwork] = useState(true);
  const [roadSegmentsData, setRoadSegmentsData] = useState(null);

  useEffect(() => {
    dispatch(getAllRoutes());
    dispatch(getEmergencyCases());
    
    // Load GeoJSON road network data
    const loadGeoJSONData = async () => {
      try {
        const roadSegments = await fetch('/data/road_segments.geojson').then(res => res.json());
        setRoadSegmentsData(roadSegments);
        toast.success(`✅ Road network loaded: ${roadSegments.features?.length || 0} segments`);
      } catch (error) {
        console.error('Error loading GeoJSON data:', error);
        toast.warning('⚠️ Could not load road network visualization (optional)');
      }
    };
    
    loadGeoJSONData();
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearRouteMessages());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearRouteMessages());
      setDialogOpen(false);
    }
  }, [error, successMessage, dispatch]);

  const handleCalculateRoute = () => {
    if (selectedCaseIds.length === 0) {
      toast.error('Please select at least one emergency case');
      return;
    }
    if (!startPoint.trim()) {
      toast.error('Please enter a starting point');
      return;
    }

    // Validate GPS format
    const gpsPattern = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/;
    if (!gpsPattern.test(startPoint.trim())) {
      toast.error('Invalid GPS format. Use: latitude,longitude (e.g., -3.3869,38.5656)');
      return;
    }

    dispatch(calculateRoute({
      caseIds: selectedCaseIds,
      startPointGps: startPoint.trim(),
    }));
  };

  const handleViewDetails = (route) => {
    dispatch(setCurrentRoute(route));
    dispatch(getRouteDetails(route.route_id));
    setDetailsOpen(true);
  };

  const handleRefresh = () => {
    dispatch(getAllRoutes());
    dispatch(getEmergencyCases());
    toast.info('Refreshing data...');
  };

  const parseRoutePath = () => {
    if (!routeDetails?.route_path) return [];
    
    try {
      const path = typeof routeDetails.route_path === 'string' 
        ? JSON.parse(routeDetails.route_path) 
        : routeDetails.route_path;
      
      if (path.coordinates) {
        return path.coordinates.map(coord => [coord[1], coord[0]]);
      }
      if (Array.isArray(path)) {
        return path.map(coord => [coord[1], coord[0]]);
      }
      return [];
    } catch (e) {
      console.error('Error parsing route path:', e);
      return [];
    }
  };

  const routePath = parseRoutePath();
  const pendingCases = cases.filter(c => c.status === 'PENDING');

  const roadNetworkStyle = {
    color: '#3388ff',
    weight: 2,
    opacity: 0.4,
  };

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: '#fafafa', py: { xs: 3, md: 4 } }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  bgcolor: 'primary.main',
                  borderRadius: 3,
                  p: 1.5,
                  display: 'flex',
                }}
              >
                <RouteIcon sx={{ fontSize: 36, color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.5px' }}>
                  Route Planning
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  Optimal routing with road network data
                </Typography>
              </Box>
            </Box>

            <Box display="flex" gap={1}>
              <IconButton
                onClick={() => setShowRoadNetwork(!showRoadNetwork)}
                sx={{
                  bgcolor: showRoadNetwork ? 'primary.main' : 'white',
                  color: showRoadNetwork ? 'white' : 'text.secondary',
                  boxShadow: 1,
                  '&:hover': { 
                    bgcolor: showRoadNetwork ? 'primary.dark' : 'grey.100' 
                  },
                }}
              >
                <Layers />
              </IconButton>

              <IconButton
                onClick={handleRefresh}
                sx={{ bgcolor: 'white', boxShadow: 1, '&:hover': { bgcolor: 'grey.100' } }}
              >
                <Refresh />
              </IconButton>

              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setDialogOpen(true)}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 700,
                  boxShadow: 2,
                }}
              >
                Calculate Route
              </Button>
            </Box>
          </Box>

          {roadSegmentsData && (
            <Alert severity="success" sx={{ mt: 2 }}>
              ✅ Road network loaded: {roadSegmentsData.features?.length || 0} segments ready for routing
            </Alert>
          )}
        </Box>

        <Grid container spacing={3}>
          {/* Map Section */}
          <Grid item xs={12} lg={8}>
            <Paper elevation={3} sx={{ borderRadius: 3, height: 600, position: 'relative', overflow: 'hidden' }}>
              <MapContainer
                center={mapCenter}
                zoom={11}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <MapController center={mapCenter} zoom={11} />

                {/* Road Network Layer */}
                {showRoadNetwork && roadSegmentsData && (
                  <GeoJSON
                    data={roadSegmentsData}
                    style={roadNetworkStyle}
                    onEachFeature={(feature, layer) => {
                      if (feature.properties) {
                        layer.bindPopup(`
                          <strong>Road Segment</strong><br/>
                          ${feature.properties.name || 'Unnamed road'}
                        `);
                      }
                    }}
                  />
                )}

                {/* Calculated Route Path */}
                {routePath.length > 0 && (
                  <Polyline
                    positions={routePath}
                    color="#2196f3"
                    weight={6}
                    opacity={0.8}
                  />
                )}

                {/* Start Point Marker */}
                {routeDetails?.start_point && (() => {
                  try {
                    const coords = routeDetails.start_point.split(',').map(Number);
                    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                      return (
                        <Marker position={[coords[0], coords[1]]} icon={startIcon}>
                          <Popup>
                            <Typography variant="subtitle2" fontWeight={700}>
                              🟢 Start Point
                            </Typography>
                          </Popup>
                        </Marker>
                      );
                    }
                  } catch (e) {
                    console.error('Error parsing start point:', e);
                  }
                  return null;
                })()}
              </MapContainer>

              {/* Map Legend */}
              <Paper
                elevation={2}
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  p: 2,
                  bgcolor: 'rgba(255,255,255,0.95)',
                  zIndex: 1000,
                  borderRadius: 2,
                }}
              >
                <Typography variant="caption" fontWeight={700} gutterBottom display="block">
                  Map Legend
                </Typography>
                <Box display="flex" flexDirection="column" gap={1} mt={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box sx={{ width: 20, height: 4, bgcolor: '#2196f3' }} />
                    <Typography variant="caption">Calculated Route</Typography>
                  </Box>
                  {showRoadNetwork && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ width: 20, height: 2, bgcolor: '#3388ff', opacity: 0.4 }} />
                      <Typography variant="caption">Road Network</Typography>
                    </Box>
                  )}
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#4caf50' }} />
                    <Typography variant="caption">Start Point</Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Loading Overlay */}
              {calculating && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    bgcolor: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000,
                  }}
                >
                  <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
                    <CircularProgress sx={{ mb: 2 }} />
                    <Typography variant="h6" fontWeight={700}>
                      🛰️ Calculating Route...
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Using road network optimization
                    </Typography>
                  </Paper>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Routes List */}
          <Grid item xs={12} lg={4}>
            <Paper elevation={3} sx={{ borderRadius: 3, maxHeight: 600, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, bgcolor: 'primary.50', borderBottom: '2px solid', borderColor: 'primary.main' }}>
                <Typography variant="h6" fontWeight={700}>
                  📍 Calculated Routes
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {routes.length} route{routes.length !== 1 ? 's' : ''} available
                </Typography>
              </Box>

              <Box sx={{ flex: 1, overflow: 'auto' }}>
                {routes.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <RouteIcon sx={{ fontSize: 60, color: 'grey.300', mb: 2 }} />
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      No routes calculated yet
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Click "Calculate Route" to get started
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ p: 0 }}>
                    {routes.map((route, index) => (
                      <React.Fragment key={route.route_id}>
                        {index > 0 && <Divider />}
                        <ListItem
                          button
                          onClick={() => handleViewDetails(route)}
                          sx={{
                            '&:hover': { bgcolor: 'grey.50' },
                            borderLeft: currentRoute?.route_id === route.route_id ? '4px solid' : 'none',
                            borderColor: 'primary.main',
                            bgcolor: currentRoute?.route_id === route.route_id ? 'primary.50' : 'transparent',
                          }}
                        >
                          <ListItemText
                            primary={
                              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                                Route #{route.route_id}
                              </Typography>
                            }
                            secondary={
                              <Box>
                                <Box display="flex" gap={2} mb={1}>
                                  {route.total_distance && (
                                    <Box display="flex" alignItems="center" gap={0.5}>
                                      <Speed sx={{ fontSize: 14, color: 'text.secondary' }} />
                                      <Typography variant="caption" fontWeight={600}>
                                        {route.total_distance.toFixed(2)} km
                                      </Typography>
                                    </Box>
                                  )}
                                  {route.estimated_time && (
                                    <Box display="flex" alignItems="center" gap={0.5}>
                                      <Timer sx={{ fontSize: 14, color: 'text.secondary' }} />
                                      <Typography variant="caption" fontWeight={600}>
                                        {route.estimated_time} min
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                                {route.status && (
                                  <Chip 
                                    label={route.status} 
                                    size="small" 
                                    sx={{ fontSize: '0.7rem', height: 22 }} 
                                  />
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Calculate Route Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: 'primary.50', fontWeight: 700 }}>
            Calculate Optimal Route
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Starting Point (GPS Coordinates)"
              placeholder="-3.3869,38.5656"
              value={startPoint}
              onChange={(e) => setStartPoint(e.target.value)}
              helperText="Format: latitude,longitude (e.g., -3.3869,38.5656)"
              sx={{ mb: 3 }}
            />

            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Select Emergency Cases:
            </Typography>
            <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto', p: 2, bgcolor: 'grey.50' }}>
              {pendingCases.length === 0 ? (
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  No pending emergency cases available
                </Typography>
              ) : (
                pendingCases.map((caseItem) => (
                  <Box
                    key={caseItem.case_id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      mb: 1.5,
                      p: 1.5,
                      borderRadius: 2,
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor: selectedCaseIds.includes(caseItem.case_id) ? 'primary.main' : 'grey.300',
                      bgcolor: selectedCaseIds.includes(caseItem.case_id) ? 'primary.50' : 'white',
                      '&:hover': { borderColor: 'primary.main', bgcolor: 'grey.100' },
                      transition: 'all 0.2s',
                    }}
                    onClick={() => {
                      setSelectedCaseIds((prev) =>
                        prev.includes(caseItem.case_id)
                          ? prev.filter((id) => id !== caseItem.case_id)
                          : [...prev, caseItem.case_id]
                      );
                    }}
                  >
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        border: '2px solid',
                        borderColor: selectedCaseIds.includes(caseItem.case_id) ? 'primary.main' : 'grey.400',
                        borderRadius: 1,
                        bgcolor: selectedCaseIds.includes(caseItem.case_id) ? 'primary.main' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {selectedCaseIds.includes(caseItem.case_id) && (
                        <Box sx={{ color: 'white', fontSize: '14px', fontWeight: 700 }}>✓</Box>
                      )}
                    </Box>
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight={700}>
                        Case #{caseItem.case_id}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Reported by User #{caseItem.reported_by}
                      </Typography>
                    </Box>
                    <Chip
                      label={caseItem.status}
                      size="small"
                      sx={{
                        bgcolor: 'warning.main',
                        color: 'white',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                      }}
                    />
                  </Box>
                ))
              )}
            </Paper>
          </DialogContent>
          <DialogActions sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Button onClick={() => setDialogOpen(false)} disabled={calculating}>
              Cancel
            </Button>
            <Button
              onClick={handleCalculateRoute}
              variant="contained"
              disabled={calculating || selectedCaseIds.length === 0}
              sx={{ fontWeight: 600 }}
            >
              {calculating ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                  Calculating...
                </>
              ) : (
                'Calculate Route'
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Route Details Dialog */}
        <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ bgcolor: 'primary.50', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={700}>
              📊 Route Details
            </Typography>
            <IconButton onClick={() => setDetailsOpen(false)}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            {fetchingDetails ? (
              <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading route details...</Typography>
              </Box>
            ) : routeDetails ? (
              <Box>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, bgcolor: 'info.50', borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Total Distance
                      </Typography>
                      <Typography variant="h5" fontWeight={700} color="info.main">
                        {routeDetails.total_distance} km
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, bgcolor: 'warning.50', borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Estimated Time
                      </Typography>
                      <Typography variant="h5" fontWeight={700} color="warning.dark">
                        {routeDetails.estimated_time} min
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Route Information:
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    bgcolor: 'grey.50',
                    maxHeight: 300,
                    overflow: 'auto',
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="body2"
                    component="pre"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                    }}
                  >
                    {JSON.stringify(routeDetails, null, 2)}
                  </Typography>
                </Paper>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No route details available
              </Typography>
            )}
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
};

export default RoutesMapPage;