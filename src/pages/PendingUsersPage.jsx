import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Chip,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  PersonAdd,
  Refresh,
  HowToReg,
  Email,
  Phone,
  Badge as BadgeIcon,
} from '@mui/icons-material';
import { getPendingUsers } from '../slices/userManagementSlice';
import AssignRoleDialog from '../components/AssignRoleDialog';
import { toast } from 'react-toastify';

const PendingUsersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { pendingUsers, loading, error } = useSelector((state) => state.userManagement);

  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Check if user is County Coordinator
  useEffect(() => {
    if (user?.role !== 'County Coordinator') {
      toast.error('Only County Coordinators can access this page');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Fetch pending users on mount
  useEffect(() => {
    dispatch(getPendingUsers());
  }, [dispatch]);

  // Handle error messages
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleAssignRole = (user) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedUser(null);
  };

  const handleRefresh = () => {
    dispatch(getPendingUsers());
    toast.info('Refreshing pending users...');
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <HowToReg sx={{ fontSize: 40, color: '#000000' }} />
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  Pending Users
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Users waiting for role assignment in {user?.county} County
                </Typography>
              </Box>
            </Box>

            <Tooltip title="Refresh list">
              <IconButton
                onClick={handleRefresh}
                disabled={loading}
                sx={{
                  backgroundColor: '#fcf8d8',
                  '&:hover': {
                    backgroundColor: '#f4edc4',
                  },
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Stats */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Chip
              label={`${pendingUsers.length} Pending User${pendingUsers.length !== 1 ? 's' : ''}`}
              sx={{
                backgroundColor: '#ffa500',
                color: '#ffffff',
                fontWeight: 600,
              }}
            />
          </Box>
        </Box>

        {/* Content */}
        {loading && pendingUsers.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : pendingUsers.length === 0 ? (
          <Paper elevation={3} sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
            <HowToReg sx={{ fontSize: 80, color: '#e0e0e0', mb: 2 }} />
            <Typography variant="h6" fontWeight={600} gutterBottom>
              No Pending Users
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              All users in {user?.county} County have been assigned roles.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<PersonAdd />}
              onClick={() => navigate('/invite-user')}
              sx={{
                color: '#000000',
                borderColor: '#000000',
                '&:hover': {
                  borderColor: '#333333',
                  backgroundColor: '#f5f5f5',
                },
              }}
            >
              Invite New User
            </Button>
          </Paper>
        ) : (
          <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#fcf8d8' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Contact</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>ID Number</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Registered</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingUsers.map((user) => (
                  <TableRow
                    key={user.user_id}
                    sx={{
                      '&:hover': {
                        backgroundColor: '#f9f9f9',
                      },
                    }}
                  >
                    {/* Name */}
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {user.first_name} {user.last_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.county}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Contact */}
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Email sx={{ fontSize: 16, color: '#666666' }} />
                          <Typography variant="caption">{user.email}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Phone sx={{ fontSize: 16, color: '#666666' }} />
                          <Typography variant="caption">{user.phone_number}</Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* ID Number */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <BadgeIcon sx={{ fontSize: 16, color: '#666666' }} />
                        <Typography variant="body2">{user.id_number}</Typography>
                      </Box>
                    </TableCell>

                    {/* Registered Date */}
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(user.created_at)}
                      </Typography>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Chip
                        label="PENDING"
                        size="small"
                        sx={{
                          backgroundColor: '#ffa500',
                          color: '#ffffff',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                        }}
                      />
                    </TableCell>

                    {/* Action */}
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<PersonAdd />}
                        onClick={() => handleAssignRole(user)}
                        sx={{
                          backgroundColor: '#000000',
                          '&:hover': {
                            backgroundColor: '#333333',
                          },
                        }}
                      >
                        Assign Role
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Info Alert */}
        {pendingUsers.length > 0 && (
          <Alert severity="info" sx={{ mt: 3 }}>
            These users have accepted their invitations and are waiting for role assignment. 
            Please assign appropriate roles to activate their accounts.
          </Alert>
        )}
      </Container>

      {/* Assign Role Dialog */}
      <AssignRoleDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        user={selectedUser}
      />
    </Box>
  );
};

export default PendingUsersPage;