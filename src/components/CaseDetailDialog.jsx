// src/components/CaseDetailDialog.jsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Divider,
  Grid,
  Paper,
  IconButton,
} from '@mui/material';
import {
  Close,
  Warning,
  LocationOn,
  CalendarToday,
  Description,
  Person,
  Assessment,
  AccessTime,
} from '@mui/icons-material';

const SEVERITY_COLORS = {
  'Low': '#4caf50',
  'Medium': '#ffa500',
  'High': '#ff6b6b',
  'Critical': '#d32f2f',
};

const STATUS_COLORS = {
  'PENDING': '#ffa500',
  'ASSIGNED': '#2196f3',
  'IN_PROGRESS': '#9c27b0',
  'RESOLVED': '#4caf50',
};

const CaseDetailDialog = ({ open, onClose, emergencyCase }) => {
  if (!emergencyCase) return null;

  // Format date with time
  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate time elapsed since case creation
  const getTimeElapsed = (dateString) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          borderTop: `6px solid ${SEVERITY_COLORS[emergencyCase.severity] || '#999'}`,
        },
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ pb: 1, pt: 3, px: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1 }}>
            <Warning 
              sx={{ 
                fontSize: 48, 
                color: SEVERITY_COLORS[emergencyCase.severity],
                mt: 0.5,
              }} 
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 1 }}>
                {emergencyCase.disaster_type}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', mb: 1 }}>
                <Chip
                  label={emergencyCase.severity}
                  size="medium"
                  sx={{
                    backgroundColor: SEVERITY_COLORS[emergencyCase.severity],
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    height: 32,
                  }}
                />
                <Chip
                  label={emergencyCase.status.replace('_', ' ')}
                  size="medium"
                  sx={{
                    backgroundColor: STATUS_COLORS[emergencyCase.status],
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    height: 32,
                  }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Case ID: #{emergencyCase.case_id}
              </Typography>
            </Box>
          </Box>
          <IconButton 
            onClick={onClose} 
            sx={{ 
              color: '#666666',
              '&:hover': {
                backgroundColor: '#f5f5f5',
              }
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider sx={{ mt: 2 }} />

      <DialogContent sx={{ pt: 3, px: 3, pb: 2 }}>
        <Grid container spacing={3}>
          {/* Response Priority Alert - Show at top if urgent */}
          {(emergencyCase.severity === 'High' || emergencyCase.severity === 'Critical') && 
           emergencyCase.status === 'PENDING' && (
            <Grid item xs={12}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2.5, 
                  backgroundColor: '#ffebee', 
                  border: '2px solid #ff6b6b',
                  borderRadius: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Warning sx={{ color: '#d32f2f', fontSize: 32 }} />
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700} color="error" gutterBottom>
                      ⚠️ Urgent Response Required
                    </Typography>
                    <Typography variant="body2" color="error">
                      This is a {emergencyCase.severity.toLowerCase()} severity case that requires immediate attention and resource allocation.
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          )}

          {/* Timeline Information */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3, backgroundColor: '#ffffff', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                <AccessTime sx={{ color: '#ff6b6b', fontSize: 28 }} />
                <Typography variant="h6" fontWeight={700}>
                  Timeline
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box 
                    sx={{ 
                      p: 2, 
                      backgroundColor: '#f9f9f9', 
                      borderRadius: 2,
                      border: '1px solid #e0e0e0',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <CalendarToday sx={{ fontSize: 20, color: '#666666' }} />
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        Reported
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight={700} gutterBottom>
                      {formatDateTime(emergencyCase.created_at)}
                    </Typography>
                    <Chip
                      label={getTimeElapsed(emergencyCase.created_at)}
                      size="small"
                      sx={{
                        backgroundColor: '#ff6b6b',
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      }}
                    />
                  </Box>
                </Grid>
                
                {emergencyCase.updated_at && emergencyCase.updated_at !== emergencyCase.created_at && (
                  <Grid item xs={12} sm={6}>
                    <Box 
                      sx={{ 
                        p: 2, 
                        backgroundColor: '#f9f9f9', 
                        borderRadius: 2,
                        border: '1px solid #e0e0e0',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <CalendarToday sx={{ fontSize: 20, color: '#666666' }} />
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>
                          Last Updated
                        </Typography>
                      </Box>
                      <Typography variant="body1" fontWeight={700}>
                        {formatDateTime(emergencyCase.updated_at)}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>

          {/* Location Information */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3, backgroundColor: '#ffffff', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                <LocationOn sx={{ color: '#ff6b6b', fontSize: 28 }} />
                <Typography variant="h6" fontWeight={700}>
                  Location Details
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box 
                    sx={{ 
                      p: 2, 
                      backgroundColor: '#f9f9f9', 
                      borderRadius: 2,
                      border: '1px solid #e0e0e0',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                      VILLAGE
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {emergencyCase.village}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box 
                    sx={{ 
                      p: 2, 
                      backgroundColor: '#f9f9f9', 
                      borderRadius: 2,
                      border: '1px solid #e0e0e0',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                      SPECIFIC LOCATION
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {emergencyCase.location}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3, backgroundColor: '#ffffff', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                <Description sx={{ color: '#ff6b6b', fontSize: 28 }} />
                <Typography variant="h6" fontWeight={700}>
                  Emergency Description
                </Typography>
              </Box>
              <Box 
                sx={{ 
                  p: 2.5, 
                  backgroundColor: '#f9f9f9', 
                  borderRadius: 2,
                  border: '1px solid #e0e0e0',
                }}
              >
                <Typography variant="body1" sx={{ lineHeight: 2, fontSize: '1rem' }}>
                  {emergencyCase.description}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Reporter Information (if available) */}
          {emergencyCase.reported_by && (
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 3, backgroundColor: '#ffffff', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                  <Person sx={{ color: '#ff6b6b', fontSize: 28 }} />
                  <Typography variant="h6" fontWeight={700}>
                    Reported By
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    p: 2, 
                    backgroundColor: '#f9f9f9', 
                    borderRadius: 2,
                    border: '1px solid #e0e0e0',
                  }}
                >
                  <Typography variant="h6" fontWeight={700}>
                    {emergencyCase.reported_by}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          )}

          {/* Assessment (if available) */}
          {emergencyCase.assessment && (
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 3, backgroundColor: '#fff3cd', border: '2px solid #ffc107', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Assessment sx={{ color: '#f57c00', fontSize: 28 }} />
                  <Typography variant="h6" fontWeight={700}>
                    Assessment Notes
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                  {emergencyCase.assessment}
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          size="large"
          sx={{
            color: '#666666',
            borderColor: '#d0d0d0',
            fontWeight: 600,
            px: 4,
            '&:hover': {
              borderColor: '#000000',
              backgroundColor: '#f5f5f5',
            },
          }}
        >
          Close
        </Button>
        
        {emergencyCase.status === 'PENDING' && (
          <Button
            variant="contained"
            size="large"
            sx={{
              backgroundColor: '#2196f3',
              fontWeight: 700,
              px: 4,
              '&:hover': {
                backgroundColor: '#1976d2',
              },
            }}
          >
            Assign Responder
          </Button>
        )}
        
        {emergencyCase.status === 'ASSIGNED' && (
          <Button
            variant="contained"
            size="large"
            sx={{
              backgroundColor: '#9c27b0',
              fontWeight: 700,
              px: 4,
              '&:hover': {
                backgroundColor: '#7b1fa2',
              },
            }}
          >
            Update Status
          </Button>
        )}
        
        {emergencyCase.status === 'IN_PROGRESS' && (
          <Button
            variant="contained"
            size="large"
            sx={{
              backgroundColor: '#4caf50',
              fontWeight: 700,
              px: 4,
              '&:hover': {
                backgroundColor: '#388e3c',
              },
            }}
          >
            Mark as Resolved
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CaseDetailDialog;