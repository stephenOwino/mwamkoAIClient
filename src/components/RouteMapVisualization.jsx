// src/components/RouteMapVisualization.jsx
import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Typography, Chip, Paper } from '@mui/material';
import { LocationOn, Flag } from '@mui/icons-material';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color, label) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="
          transform: rotate(45deg);
          color: white;
          font-weight: bold;
          font-size: 14px;
        ">${label}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const SEVERITY_COLORS = {
  'Low': '#4caf50',
  'Medium': '#ffa500',
  'High': '#ff6b6b',
  'Critical': '#d32f2f',
};

// Component to fit map bounds
const FitBounds = ({ bounds }) => {
  const map = useMap();
  
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  
  return null;
};

const RouteMapVisualization = ({ 
  startPoint, 
  cases, 
  routeOrder, 
  showRoute = true 
}) => {
  const mapRef = useRef();

  // Parse start point coordinates (format: "lng,lat")
  const parseCoordinates = (coordString) => {
    if (!coordString || typeof coordString !== 'string') {
      return null;
    }
    try {
      const parts = coordString.split(',').map(p => parseFloat(p.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return [parts[1], parts[0]]; // Return as [lat, lng] for Leaflet
      }
      return null;
    } catch (error) {
      console.error('Error parsing coordinates:', coordString, error);
      return null;
    }
  };

  // Get coordinates for all points
  const startCoords = startPoint ? parseCoordinates(startPoint) : null;
  
  const caseMarkers = cases
    .map(c => ({
      ...c,
      coords: parseCoordinates(c.location),
    }))
    .filter(c => c.coords !== null); // Filter out cases with invalid coordinates

  // Create route path based on route order
  const routePath = routeOrder && startCoords
    ? [
        startCoords,
        ...routeOrder.map(caseId => {
          const caseItem = caseMarkers.find(c => c.case_id === caseId);
          return caseItem && caseItem.coords ? caseItem.coords : null;
        }).filter(Boolean)
      ]
    : [];

  // Calculate bounds for all markers
  const allPoints = [
    ...(startCoords ? [startCoords] : []),
    ...caseMarkers.map(c => c.coords).filter(Boolean),
  ];

  // Default center (Taita Taveta County)
  const defaultCenter = [-3.3167, 38.2167];
  const center = allPoints.length > 0 ? allPoints[0] : defaultCenter;

  // Show warning if some cases have invalid coordinates
  const invalidCases = cases.filter(c => !parseCoordinates(c.location));
  
  return (
    <Paper elevation={3} sx={{ height: '100%', overflow: 'hidden', borderRadius: 2 }}>
      <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
        <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationOn sx={{ color: '#2196f3' }} />
          Route Map Visualization
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {routeOrder && routeOrder.length > 0 
            ? `Optimized route with ${routeOrder.length} stop${routeOrder.length !== 1 ? 's' : ''}`
            : 'Select cases and calculate route to view map'
          }
        </Typography>
        {invalidCases.length > 0 && (
          <Typography variant="caption" sx={{ display: 'block', color: '#ff6b6b', mt: 0.5 }}>
            Warning: {invalidCases.length} case(s) have invalid coordinates and won't appear on map
          </Typography>
        )}
      </Box>

      <MapContainer
        center={center}
        zoom={10}
        style={{ height: 'calc(100% - 80px)', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Fit bounds to show all markers */}
        {allPoints.length > 0 && <FitBounds bounds={allPoints} />}

        {/* Start Point Marker */}
        {startCoords && (
          <Marker 
            position={startCoords} 
            icon={createCustomIcon('#4caf50', 'S')}
          >
            <Popup>
              <Box sx={{ p: 1 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                  Starting Point
                </Typography>
                <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block' }}>
                  {startPoint}
                </Typography>
              </Box>
            </Popup>
          </Marker>
        )}

        {/* Emergency Case Markers */}
        {caseMarkers.map((caseItem, index) => {
          const orderIndex = routeOrder ? routeOrder.indexOf(caseItem.case_id) : -1;
          const label = orderIndex >= 0 ? (orderIndex + 1).toString() : '?';
          
          return (
            <Marker
              key={caseItem.case_id}
              position={caseItem.coords}
              icon={createCustomIcon(
                SEVERITY_COLORS[caseItem.severity] || '#999',
                label
              )}
            >
              <Popup>
                <Box sx={{ p: 1, minWidth: 200 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {caseItem.disaster_type}
                    </Typography>
                    <Chip
                      label={caseItem.severity}
                      size="small"
                      sx={{
                        backgroundColor: SEVERITY_COLORS[caseItem.severity],
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                      }}
                    />
                  </Box>

                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Case #{caseItem.case_id}
                  </Typography>

                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Location:</strong> {caseItem.village}
                  </Typography>

                  <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                    {caseItem.description.substring(0, 100)}
                    {caseItem.description.length > 100 ? '...' : ''}
                  </Typography>

                  <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#666' }}>
                    {caseItem.location}
                  </Typography>

                  {orderIndex >= 0 && (
                    <Chip
                      label={`Stop #${orderIndex + 1}`}
                      size="small"
                      sx={{
                        mt: 1,
                        backgroundColor: '#2196f3',
                        color: '#ffffff',
                        fontWeight: 600,
                      }}
                    />
                  )}
                </Box>
              </Popup>
            </Marker>
          );
        })}

        {/* Route Line */}
        {showRoute && routePath.length > 1 && (
          <Polyline
            positions={routePath}
            pathOptions={{
              color: '#2196f3',
              weight: 4,
              opacity: 0.8,
              dashArray: '10, 10',
            }}
          />
        )}
      </MapContainer>
    </Paper>
  );
};

export default RouteMapVisualization;