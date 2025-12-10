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
  DialogContent,
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
  PENDING: { label: 'Pending', color: '#ff9800', bg: '#fff3e0' },
  ASSIGNED: { label: 'Assigned', color: '#2196f3', bg: '#e3f2fd' },
  IN_PROGRESS: { label: 'In Progress', color: '#9c27b0', bg: '#f3e5f5' },
  RESOLVED: { label: 'Resolved', color: '#4caf50', bg: '#e8f5e9' },
};

const getStatusConfig = (status) => {
  return STATUS_CONFIG[status] || { label: status || 'Unknown', color: '#757575', bg: '#f5f5f5' };
};

const EmergencyCasesPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cases, loading, error, filters } = useSelector((state) => state.emergencyCase);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);

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
    const newFilters = { ...filters, [filterName]: value || null };
    dispatch(setFilters(newFilters));
    dispatch(getEmergencyCases(newFilters));
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return { full: 'N/A', ago: 'N/A' };
    
    console.log('📅 Formatting date:', dateString);
    
    const date = new Date(dateString);
    const now = new Date();
    
    console.log('📅 Parsed date:', date);
    console.log('📅 Current time:', now);
    console.log('📅 Is valid date:', !isNaN(date.getTime()));
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error('❌ Invalid date:', dateString);
      return { full: 'Invalid date', ago: 'Unknown' };
    }
    
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    console.log('📅 Time difference:', { diffMins, diffHours, diffDays });

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
          borderRadius: 3,
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
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
        <CardContent sx={{ flexGrow: 1, pl: 3 }}>
          <Stack spacing={2.5}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" gap={2}>
              <Typography variant="h5" fontWeight={800} sx={{ color: '#000', letterSpacing: '-0.5px' }}>
                Case #{emergencyCase.case_id}
              </Typography>
              <Chip
                label={status.label}
                sx={{
                  bgcolor: status.color,
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  height: 28,
                  borderRadius: 2,
                  '& .MuiChip-label': {
                    px: 1.5,
                  }
                }}
              />
            </Box>

            {/* Subtitle */}
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Emergency Report
            </Typography>

            <Divider sx={{ my: 1 }} />

            {/* Reporter */}
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box
                sx={{
                  bgcolor: 'grey.100',
                  borderRadius: 2,
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Person sx={{ fontSize: 20, color: 'grey.700' }} />
              </Box>
              <Box flex={1}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                  Reported by
                </Typography>
                <Typography variant="body2" fontWeight={700} sx={{ color: '#000' }}>
                  User #{emergencyCase.reported_by || 'Unknown'}
                </Typography>
              </Box>
            </Box>

            {/* Assigned Team */}
            {emergencyCase.assigned_team_id && (
              <Box display="flex" alignItems="center" gap={1.5}>
                <Box
                  sx={{
                    bgcolor: 'success.50',
                    borderRadius: 2,
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircle sx={{ fontSize: 20, color: 'success.main' }} />
                </Box>
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                    Assigned to
                  </Typography>
                  <Typography variant="body2" fontWeight={700} sx={{ color: 'success.dark' }}>
                    Team #{emergencyCase.assigned_team_id}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Footer - Time */}
            <Box 
              display="flex" 
              alignItems="center" 
              justifyContent="space-between"
              pt={1}
              mt="auto"
            >
              <Box display="flex" alignItems="center" gap={0.5}>
                <AccessTime sx={{ fontSize: 18, color: status.color }} />
                <Typography variant="body2" color={status.color} fontWeight={700}>
                  {dateTime.ago}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
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
      >
        <Box sx={{ p: 3 }}>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
            <Box flex={1}>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Case #{selectedCase.case_id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Emergency Case Details
              </Typography>
            </Box>
            <IconButton onClick={() => setSelectedCase(null)} size="small">
              <Close />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Status Badge */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              bgcolor: status.bg,
              border: `2px solid ${status.color}`,
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1}>
              CURRENT STATUS
            </Typography>
            <Typography variant="h4" fontWeight={700} color={status.color}>
              {status.label}
            </Typography>
          </Paper>

          {/* Content Sections */}
          <Stack spacing={3}>
            {/* Reporter Information */}
            <Box>
              <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                <Person sx={{ fontSize: 22, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight={700}>
                  Reporter Information
                </Typography>
              </Box>
              <Paper elevation={0} sx={{ p: 2.5, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.5}>
                  REPORTED BY
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {selectedCase.reported_by || 'Unknown'}
                </Typography>
              </Paper>
            </Box>

            {/* Assigned Team */}
            {selectedCase.assigned_team_id ? (
              <Box>
                <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                  <CheckCircle sx={{ fontSize: 22, color: 'success.main' }} />
                  <Typography variant="h6" fontWeight={700}>
                    Response Team
                  </Typography>
                </Box>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    bgcolor: 'success.50',
                    border: '2px solid',
                    borderColor: 'success.main',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.5}>
                    ASSIGNED TEAM
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="success.dark">
                    Team #{selectedCase.assigned_team_id}
                  </Typography>
                </Paper>
              </Box>
            ) : (
              <Box>
                <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                  <Badge sx={{ fontSize: 22, color: 'text.secondary' }} />
                  <Typography variant="h6" fontWeight={700}>
                    Response Team
                  </Typography>
                </Box>
                <Paper elevation={0} sx={{ p: 2.5, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    No team assigned yet
                  </Typography>
                </Paper>
              </Box>
            )}

            {/* Timestamp */}
            <Box>
              <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                <AccessTime sx={{ fontSize: 22, color: 'text.secondary' }} />
                <Typography variant="h6" fontWeight={700}>
                  Timeline
                </Typography>
              </Box>
              <Paper elevation={0} sx={{ p: 2.5, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.5}>
                  CREATED ON
                </Typography>
                <Typography variant="body1" fontWeight={600} gutterBottom>
                  {dateTime.full}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {dateTime.ago}
                </Typography>
              </Paper>
            </Box>
          </Stack>

          {/* Actions */}
          <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
            <Button
              onClick={() => setSelectedCase(null)}
              variant="outlined"
              size="large"
            >
              Close
            </Button>
            {canCreateCase && selectedCase.status !== 'RESOLVED' && (
              <Button
                variant="contained"
                size="large"
                color="primary"
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
    <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: '#fafafa', py: { xs: 3, md: 4 } }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Stack spacing={{ xs: 2, md: 3 }} mb={{ xs: 3, md: 4 }}>
          <Box 
            display="flex" 
            justifyContent="space-between" 
            alignItems={{ xs: 'flex-start', md: 'center' }} 
            flexDirection={{ xs: 'column', md: 'row' }}
            gap={2}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  bgcolor: 'error.main',
                  borderRadius: 3,
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Warning sx={{ fontSize: 36, color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.5px' }}>
                  Emergency Cases
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  Taita Taveta County Emergency Response System
                </Typography>
              </Box>
            </Box>

            <Stack direction="row" spacing={1} flexShrink={0}>
              <IconButton
                onClick={() => setShowFilters(!showFilters)}
                sx={{ 
                  bgcolor: showFilters ? 'warning.100' : 'white',
                  '&:hover': { bgcolor: showFilters ? 'warning.200' : 'grey.100' },
                  boxShadow: 1,
                }}
              >
                <FilterList />
              </IconButton>
              <IconButton 
                onClick={handleRefresh} 
                disabled={loading} 
                sx={{ 
                  bgcolor: 'white',
                  '&:hover': { bgcolor: 'grey.100' },
                  boxShadow: 1,
                }}
              >
                <Refresh />
              </IconButton>
              {canCreateCase && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setCreateDialogOpen(true)}
                  color="error"
                  sx={{
                    px: 3,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 700,
                    boxShadow: 2,
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

          {/* Filters */}
          {showFilters && (
            <Paper 
              elevation={2} 
              sx={{ 
                p: { xs: 2, md: 3 },
                borderRadius: 3,
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Status"
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    sx={{
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
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => {
                      dispatch(clearFilters());
                      dispatch(getEmergencyCases());
                    }}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      height: 40,
                    }}
                  >
                    Clear Filters
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Stats */}
          <Stack direction="row" spacing={{ xs: 1, sm: 2 }} flexWrap="wrap" gap={{ xs: 1, sm: 0 }}>
            <Chip 
              label={`${cases.length} Total`} 
              sx={{ 
                bgcolor: 'grey.900', 
                color: 'white', 
                fontWeight: 700,
                height: 36,
                fontSize: '0.9rem',
                '& .MuiChip-label': { px: 2 },
              }} 
            />
            <Chip
              label={`${cases.filter(c => c.status === 'PENDING').length} Pending`}
              sx={{ 
                bgcolor: 'warning.main', 
                color: 'white', 
                fontWeight: 700,
                height: 36,
                fontSize: '0.9rem',
                '& .MuiChip-label': { px: 2 },
              }}
            />
            <Chip
              label={`${cases.filter(c => c.assigned_team_id).length} Assigned`}
              sx={{ 
                bgcolor: 'info.main', 
                color: 'white', 
                fontWeight: 700,
                height: 36,
                fontSize: '0.9rem',
                '& .MuiChip-label': { px: 2 },
              }}
            />
            <Chip
              label={`${cases.filter(c => c.status === 'RESOLVED').length} Resolved`}
              sx={{ 
                bgcolor: 'success.main', 
                color: 'white', 
                fontWeight: 700,
                height: 36,
                fontSize: '0.9rem',
                '& .MuiChip-label': { px: 2 },
              }}
            />
          </Stack>
        </Stack>

        {/* Cases Grid */}
        {loading && cases.length === 0 ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress size={48} />
          </Box>
        ) : cases.length === 0 ? (
          <Paper 
            elevation={2}
            sx={{ 
              p: 8, 
              textAlign: 'center',
              borderRadius: 3,
              bgcolor: 'white',
            }}
          >
            <Warning sx={{ fontSize: 100, color: 'grey.300', mb: 3 }} />
            <Typography variant="h5" fontWeight={700} gutterBottom>
              No Emergency Cases
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={4} maxWidth={400} mx="auto">
              {canCreateCase ? 'Report an emergency to get started.' : 'No cases to display at the moment.'}
            </Typography>
            {canCreateCase && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setCreateDialogOpen(true)}
                color="error"
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 700,
                }}
              >
                Report Emergency
              </Button>
            )}
          </Paper>
        ) : (
          <Grid container spacing={{ xs: 2, sm: 3, md: 3 }}>
            {cases.map((emergencyCase) => (
              <Grid item xs={12} sm={6} lg={4} key={emergencyCase.case_id}>
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