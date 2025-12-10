// src/pages/EmergencyCasesPage.jsx
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
  CircularProgress,
  IconButton,
  TextField,
  MenuItem,
  Dialog,
  Stack,
  Divider,
} from '@mui/material';
import {
  Warning,
  Add,
  Refresh,
  FilterList,
  Close,
  Person,
  AccessTime,
  CheckCircle,
  Badge,
} from '@mui/icons-material';
import { getEmergencyCases, setFilters, clearFilters } from '../slices/emergencyCaseSlice';
import CreateCaseDialog from '../components/CreateCaseDialog';
import { toast } from 'react-toastify';

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: '#ff9800', bg: '#fcf8d8' },
  ASSIGNED: { label: 'Assigned', color: '#2196f3', bg: '#fcf8d8' },
  IN_PROGRESS: { label: 'In Progress', color: '#9c27b0', bg: '#fcf8d8' },
  RESOLVED: { label: 'Resolved', color: '#4caf50', bg: '#fcf8d8' },
};

const getStatusConfig = (status) => {
  return STATUS_CONFIG[status] || { label: status || 'Unknown', color: '#757575', bg: '#fcf8d8' };
};

const EmergencyCasesPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cases, loading, error, filters } = useSelector((state) => state.emergencyCase);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [localFilters, setLocalFilters] = useState({
    status: '',
    assigned: '',
  });

  const canCreateCase = ['County Coordinator', 'Community Manager'].includes(user?.role);

  useEffect(() => {
    dispatch(getEmergencyCases());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleRefresh = () => {
    dispatch(getEmergencyCases(filters));
    toast.info('Refreshing cases...');
  };

  const handleFilterChange = (filterName, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleClearFilters = () => {
    setLocalFilters({
      status: '',
      assigned: '',
    });
    dispatch(clearFilters());
    dispatch(getEmergencyCases());
  };

  // Filter cases on the frontend based on local filters
  const filteredCases = cases.filter(emergencyCase => {
    if (localFilters.status && emergencyCase.status !== localFilters.status) {
      return false;
    }
    if (localFilters.assigned === 'assigned' && !emergencyCase.assigned_team_id) {
      return false;
    }
    if (localFilters.assigned === 'unassigned' && emergencyCase.assigned_team_id) {
      return false;
    }
    return true;
  });

  const formatDateTime = (dateString) => {
    if (!dateString) return { full: 'N/A', ago: 'N/A' };
    
    const date = new Date(dateString);
    const now = new Date();
    
    if (isNaN(date.getTime())) {
      return { full: 'Invalid date', ago: 'Unknown' };
    }
    
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    let timeAgo = '';
    if (diffMins < 1) timeAgo = 'Just now';
    else if (diffMins < 60) timeAgo = `${diffMins}m ago`;
    else if (diffHours < 24) timeAgo = `${diffHours}h ago`;
    else timeAgo = `${diffDays}d ago`;

    return {
      full: date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      ago: timeAgo,
    };
  };

  const CaseCard = ({ emergencyCase }) => {
    const status = getStatusConfig(emergencyCase.status);
    const dateTime = formatDateTime(emergencyCase.created_at);

    return (
      <Card
        onClick={() => setSelectedCase(emergencyCase)}
        elevation={2}
        sx={{
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: { xs: 2, md: 3 },
          bgcolor: '#fcf8d8',
          '&:hover': {
            transform: { xs: 'none', md: 'translateY(-4px)' },
            boxShadow: { xs: 2, md: '0 8px 16px rgba(0,0,0,0.12)' },
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '6px',
            height: '100%',
            bgcolor: status.color,
          },
        }}
      >
        <CardContent sx={{ flexGrow: 1, pl: { xs: 2.5, md: 3 }, p: { xs: 2, md: 3 } }}>
          <Stack spacing={{ xs: 2, md: 2.5 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" gap={2}>
              <Typography 
                variant="h5" 
                fontWeight={800} 
                sx={{ 
                  color: '#000', 
                  letterSpacing: '-0.5px',
                  fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
                }}
              >
                Case #{emergencyCase.case_id}
              </Typography>
              <Chip
                label={status.label}
                sx={{
                  bgcolor: status.color,
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
                  height: { xs: 22, sm: 24, md: 28 },
                  borderRadius: 2,
                  '& .MuiChip-label': {
                    px: { xs: 0.75, sm: 1, md: 1.5 },
                  }
                }}
              />
            </Box>

            <Typography 
              variant="body2" 
              color="text.secondary" 
              fontWeight={500}
              sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' } }}
            >
              Emergency Report
            </Typography>

            <Divider sx={{ my: { xs: 0.5, md: 1 } }} />

            <Box display="flex" alignItems="center" gap={{ xs: 1, md: 1.5 }}>
              <Box
                sx={{
                  bgcolor: 'rgba(0,0,0,0.05)',
                  borderRadius: 2,
                  p: { xs: 0.75, md: 1 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Person sx={{ fontSize: { xs: 16, sm: 18, md: 20 }, color: 'grey.700' }} />
              </Box>
              <Box flex={1}>
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  fontWeight={600} 
                  display="block"
                  sx={{ fontSize: { xs: '0.6rem', sm: '0.65rem', md: '0.75rem' } }}
                >
                  Reported by
                </Typography>
                <Typography 
                  variant="body2" 
                  fontWeight={700} 
                  sx={{ 
                    color: '#000',
                    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' }
                  }}
                >
                  User #{emergencyCase.reported_by || 'Unknown'}
                </Typography>
              </Box>
            </Box>

            {emergencyCase.assigned_team_id && (
              <Box display="flex" alignItems="center" gap={{ xs: 1, md: 1.5 }}>
                <Box
                  sx={{
                    bgcolor: 'rgba(76, 175, 80, 0.1)',
                    borderRadius: 2,
                    p: { xs: 0.75, md: 1 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircle sx={{ fontSize: { xs: 16, sm: 18, md: 20 }, color: 'success.main' }} />
                </Box>
                <Box flex={1}>
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    fontWeight={600} 
                    display="block"
                    sx={{ fontSize: { xs: '0.6rem', sm: '0.65rem', md: '0.75rem' } }}
                  >
                    Assigned to
                  </Typography>
                  <Typography 
                    variant="body2" 
                    fontWeight={700} 
                    sx={{ 
                      color: 'success.dark',
                      fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' }
                    }}
                  >
                    Team #{emergencyCase.assigned_team_id}
                  </Typography>
                </Box>
              </Box>
            )}

            <Box 
              display="flex" 
              alignItems="center" 
              justifyContent="space-between"
              pt={{ xs: 0.5, md: 1 }}
              mt="auto"
            >
              <Box display="flex" alignItems="center" gap={0.5}>
                <AccessTime sx={{ fontSize: { xs: 14, sm: 16, md: 18 }, color: status.color }} />
                <Typography 
                  variant="body2" 
                  color={status.color} 
                  fontWeight={700}
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' } }}
                >
                  {dateTime.ago}
                </Typography>
              </Box>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                fontWeight={600}
                sx={{ fontSize: { xs: '0.6rem', sm: '0.65rem', md: '0.75rem' } }}
              >
                {dateTime.full.split(',')[0]}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  const CaseDetailsDialog = () => {
    if (!selectedCase) return null;

    const status = getStatusConfig(selectedCase.status);
    const dateTime = formatDateTime(selectedCase.created_at);

    return (
      <Dialog
        open={Boolean(selectedCase)}
        onClose={() => setSelectedCase(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            m: { xs: 2, sm: 3 },
          }
        }}
      >
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={{ xs: 2, sm: 3 }}>
            <Box flex={1}>
              <Typography 
                variant="h4" 
                fontWeight={700} 
                gutterBottom
                sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
              >
                Case #{selectedCase.case_id}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
              >
                Emergency Case Details
              </Typography>
            </Box>
            <IconButton onClick={() => setSelectedCase(null)} size="small">
              <Close />
            </IconButton>
          </Box>

          <Divider sx={{ mb: { xs: 2, sm: 3 } }} />

          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              mb: { xs: 2, sm: 3 },
              bgcolor: '#fcf8d8',
              border: `2px solid ${status.color}`,
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <Typography 
              variant="caption" 
              color="text.secondary" 
              fontWeight={600} 
              display="block" 
              mb={1}
              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
            >
              CURRENT STATUS
            </Typography>
            <Typography 
              variant="h4" 
              fontWeight={700} 
              color={status.color}
              sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
            >
              {status.label}
            </Typography>
          </Paper>

          <Stack spacing={{ xs: 2, sm: 3 }}>
            <Box>
              <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                <Person sx={{ fontSize: { xs: 20, sm: 22 }, color: '#000' }} />
                <Typography 
                  variant="h6" 
                  fontWeight={700}
                  sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                >
                  Reporter Information
                </Typography>
              </Box>
              <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, bgcolor: '#fcf8d8', borderRadius: 2 }}>
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  fontWeight={600} 
                  display="block" 
                  mb={0.5}
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                >
                  REPORTED BY
                </Typography>
                <Typography 
                  variant="h6" 
                  fontWeight={600}
                  sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                >
                  {selectedCase.reported_by || 'Unknown'}
                </Typography>
              </Paper>
            </Box>

            {selectedCase.assigned_team_id ? (
              <Box>
                <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                  <CheckCircle sx={{ fontSize: { xs: 20, sm: 22 }, color: 'success.main' }} />
                  <Typography 
                    variant="h6" 
                    fontWeight={700}
                    sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                  >
                    Response Team
                  </Typography>
                </Box>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    bgcolor: '#fcf8d8',
                    border: '2px solid',
                    borderColor: 'success.main',
                    borderRadius: 2,
                  }}
                >
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    fontWeight={600} 
                    display="block" 
                    mb={0.5}
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                  >
                    ASSIGNED TEAM
                  </Typography>
                  <Typography 
                    variant="h6" 
                    fontWeight={700} 
                    color="success.dark"
                    sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                  >
                    Team #{selectedCase.assigned_team_id}
                  </Typography>
                </Paper>
              </Box>
            ) : (
              <Box>
                <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                  <Badge sx={{ fontSize: { xs: 20, sm: 22 }, color: 'text.secondary' }} />
                  <Typography 
                    variant="h6" 
                    fontWeight={700}
                    sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                  >
                    Response Team
                  </Typography>
                </Box>
                <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, bgcolor: '#fcf8d8', borderRadius: 2 }}>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    fontStyle="italic"
                    sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                  >
                    No team assigned yet
                  </Typography>
                </Paper>
              </Box>
            )}

            <Box>
              <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                <AccessTime sx={{ fontSize: { xs: 20, sm: 22 }, color: 'text.secondary' }} />
                <Typography 
                  variant="h6" 
                  fontWeight={700}
                  sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                >
                  Timeline
                </Typography>
              </Box>
              <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, bgcolor: '#fcf8d8', borderRadius: 2 }}>
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  fontWeight={600} 
                  display="block" 
                  mb={0.5}
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                >
                  CREATED ON
                </Typography>
                <Typography 
                  variant="body1" 
                  fontWeight={600} 
                  gutterBottom
                  sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                >
                  {dateTime.full}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                >
                  {dateTime.ago}
                </Typography>
              </Paper>
            </Box>
          </Stack>

          <Box 
            display="flex" 
            flexDirection={{ xs: 'column', sm: 'row' }}
            justifyContent="flex-end" 
            gap={2} 
            mt={{ xs: 3, sm: 4 }}
          >
            <Button
              onClick={() => setSelectedCase(null)}
              variant="outlined"
              size="large"
              fullWidth={true}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                display: { xs: 'block', sm: 'inline-flex' },
              }}
            >
              Close
            </Button>
            {canCreateCase && selectedCase.status !== 'RESOLVED' && (
              <Button
                variant="contained"
                size="large"
                fullWidth={true}
                sx={{
                  bgcolor: '#000',
                  color: '#fcf8d8',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  display: { xs: 'block', sm: 'inline-flex' },
                  '&:hover': {
                    bgcolor: '#333',
                  }
                }}
              >
                Update Status
              </Button>
            )}
          </Box>
        </Box>
      </Dialog>
    );
  };

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: '#f5f5f5', py: { xs: 2, md: 4 } }}>
      <Container maxWidth="xl">
        <Stack spacing={{ xs: 2, md: 3 }} mb={{ xs: 2, md: 4 }}>
          <Box 
            display="flex" 
            justifyContent="space-between" 
            alignItems={{ xs: 'flex-start', sm: 'center' }} 
            flexDirection={{ xs: 'column', sm: 'row' }}
            gap={{ xs: 2, sm: 0 }}
          >
            <Box display="flex" alignItems="center" gap={{ xs: 1.5, md: 2 }}>
              <Box
                sx={{
                  bgcolor: '#fcf8d8',
                  borderRadius: { xs: 2, md: 3 },
                  p: { xs: 1, md: 1.5 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #000',
                }}
              >
                <Warning sx={{ fontSize: { xs: 28, md: 36 }, color: '#000' }} />
              </Box>
              <Box>
                <Typography 
                  variant="h4" 
                  fontWeight={800} 
                  sx={{ 
                    letterSpacing: '-0.5px', 
                    color: '#000',
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
                  }}
                >
                  Emergency Cases
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  fontWeight={500}
                  sx={{ 
                    display: { xs: 'none', sm: 'block' },
                    fontSize: { xs: '0.8rem', md: '0.875rem' }
                  }}
                >
                  Taita Taveta County Emergency Response System
                </Typography>
              </Box>
            </Box>

            <Stack 
              direction="row" 
              spacing={1} 
              flexShrink={0}
              width={{ xs: '100%', sm: 'auto' }}
            >
              <IconButton
                onClick={() => setShowFilters(!showFilters)}
                sx={{ 
                  bgcolor: showFilters ? '#fcf8d8' : 'white',
                  '&:hover': { bgcolor: showFilters ? '#f4edc4' : '#f5f5f5' },
                  boxShadow: 1,
                  border: showFilters ? '2px solid #000' : 'none',
                  flex: { xs: 1, sm: 0 },
                }}
              >
                <FilterList />
              </IconButton>
              <IconButton 
                onClick={handleRefresh} 
                disabled={loading} 
                sx={{ 
                  bgcolor: 'white',
                  '&:hover': { bgcolor: '#f5f5f5' },
                  boxShadow: 1,
                  flex: { xs: 1, sm: 0 },
                }}
              >
                <Refresh />
              </IconButton>
              {canCreateCase && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setCreateDialogOpen(true)}
                  fullWidth
                  sx={{
                    px: { xs: 2, sm: 3 },
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 700,
                    boxShadow: 2,
                    bgcolor: '#000',
                    color: '#fcf8d8',
                    flex: { xs: 2, sm: 0 },
                    '&:hover': {
                      bgcolor: '#333',
                    }
                  }}
                >
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                    Report Emergency
                  </Box>
                  <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                    Report
                  </Box>
                </Button>
              )}
            </Stack>
          </Box>

          {showFilters && (
            <Paper 
              elevation={2} 
              sx={{ 
                p: { xs: 2, md: 3 },
                borderRadius: { xs: 2, md: 3 },
                bgcolor: '#fcf8d8',
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Status"
                    value={localFilters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    sx={{
                      bgcolor: 'white',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    {Object.keys(STATUS_CONFIG).map((stat) => (
                      <MenuItem key={stat} value={stat}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: STATUS_CONFIG[stat].color,
                            }}
                          />
                          {STATUS_CONFIG[stat].label}
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Assignment"
                    value={localFilters.assigned}
                    onChange={(e) => handleFilterChange('assigned', e.target.value)}
                    sx={{
                      bgcolor: 'white',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  >
                    <MenuItem value="">All Cases</MenuItem>
                    <MenuItem value="assigned">Assigned Cases</MenuItem>
                    <MenuItem value="unassigned">Unassigned Cases</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={12} md={4}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleClearFilters}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      height: 40,
                      borderColor: '#000',
                      color: '#000',
                      '&:hover': {
                        borderColor: '#000',
                        bgcolor: 'rgba(0,0,0,0.04)',
                      }
                    }}
                  >
                    Clear Filters
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          )}

          <Stack 
            direction="row" 
            spacing={{ xs: 1, sm: 2 }} 
            flexWrap="wrap" 
            useFlexGap
            sx={{
              '& > *': {
                mb: { xs: 1, sm: 0 }
              }
            }}
          >
            <Chip 
              label={`${filteredCases.length} Total`} 
              sx={{ 
                bgcolor: '#000', 
                color: '#fcf8d8', 
                fontWeight: 700,
                height: { xs: 32, sm: 36 },
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                '& .MuiChip-label': { px: { xs: 1.5, sm: 2 } },
              }} 
            />
            <Chip
              label={`${filteredCases.filter(c => c.status === 'PENDING').length} Pending`}
              sx={{ 
                bgcolor: '#ff9800', 
                color: 'white', 
                fontWeight: 700,
                height: { xs: 32, sm: 36 },
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                '& .MuiChip-label': { px: { xs: 1.5, sm: 2 } },
              }}
            />
            <Chip
              label={`${filteredCases.filter(c => c.assigned_team_id).length} Assigned`}
              sx={{ 
                bgcolor: '#2196f3', 
                color: 'white', 
                fontWeight: 700,
                height: { xs: 32, sm: 36 },
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                '& .MuiChip-label': { px: { xs: 1.5, sm: 2 } },
              }}
            />
            <Chip
              label={`${filteredCases.filter(c => c.status === 'RESOLVED').length} Resolved`}
              sx={{ 
                bgcolor: '#4caf50', 
                color: 'white', 
                fontWeight: 700,
                height: { xs: 32, sm: 36 },
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                '& .MuiChip-label': { px: { xs: 1.5, sm: 2 } },
              }}
            />
          </Stack>
        </Stack>

        {loading && cases.length === 0 ? (
          <Box display="flex" justifyContent="center" py={{ xs: 6, md: 8 }}>
            <CircularProgress size={{ xs: 40, md: 48 }} sx={{ color: '#000' }} />
          </Box>
        ) : filteredCases.length === 0 ? (
          <Paper 
            elevation={2}
            sx={{ 
              p: { xs: 4, md: 8 }, 
              textAlign: 'center',
              borderRadius: { xs: 2, md: 3 },
              bgcolor: '#fcf8d8',
            }}
          >
            <Warning sx={{ fontSize: { xs: 80, md: 100 }, color: 'grey.400', mb: { xs: 2, md: 3 } }} />
            <Typography 
              variant="h5" 
              fontWeight={700} 
              gutterBottom
              sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }}
            >
              No Emergency Cases
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              mb={{ xs: 3, md: 4 }} 
              maxWidth={400} 
              mx="auto"
              sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
            >
              {cases.length === 0 
                ? (canCreateCase ? 'Report an emergency to get started.' : 'No cases to display at the moment.')
                : 'No cases match your current filters. Try adjusting the filters.'}
            </Typography>
            {canCreateCase && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setCreateDialogOpen(true)}
                size="large"
                sx={{
                  px: { xs: 3, md: 4 },
                  py: { xs: 1, md: 1.5 },
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  fontWeight: 700,
                  bgcolor: '#000',
                  color: '#fcf8d8',
                  '&:hover': {
                    bgcolor: '#333',
                  }
                }}
              >
                Report Emergency
              </Button>
            )}
          </Paper>
        ) : (
          <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
            {filteredCases.map((emergencyCase) => (
              <Grid item xs={6} sm={6} lg={4} key={emergencyCase.case_id}>
                <CaseCard emergencyCase={emergencyCase} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <CreateCaseDialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} />
      <CaseDetailsDialog />
    </Box>
  );
};

export default EmergencyCasesPage;