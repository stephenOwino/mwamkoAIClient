import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
  Divider,
  Chip,
} from '@mui/material';
import {
  PersonAdd,
  Email,
  Phone,
  Badge as BadgeIcon,
  LocationOn,
  CalendarToday,
} from '@mui/icons-material';
import { assignRole, clearUserManagementMessages } from '../slices/userManagementSlice';
import { toast } from 'react-toastify';

const AVAILABLE_ROLES = [
  { value: 'County Coordinator', label: 'County Coordinator', color: '#ff6b6b' },
  { value: 'Rescue Team', label: 'Rescue Team', color: '#4caf50' },
  { value: 'Driver', label: 'Driver', color: '#2196f3' },
];

const AssignRoleDialog = ({ open, onClose, user }) => {
  const dispatch = useDispatch();
  const { assigningRole, error, successMessage } = useSelector(
    (state) => state.userManagement
  );

  const [selectedRole, setSelectedRole] = useState('');
  const [roleError, setRoleError] = useState('');

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setSelectedRole('');
      setRoleError('');
    }
  }, [open]);

  // Handle success/error messages
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearUserManagementMessages());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearUserManagementMessages());
      onClose(); // Close dialog on success
    }
  }, [error, successMessage, dispatch, onClose]);

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
    setRoleError('');
  };

  const handleSubmit = () => {
    if (!selectedRole) {
      setRoleError('Please select a role');
      return;
    }

    dispatch(assignRole({
      userId: user.user_id,
      role: selectedRole,
    }));
  };

  if (!user) return null;

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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonAdd sx={{ color: '#000000', fontSize: 28 }} />
          <Typography variant="h6" fontWeight={700}>
            Assign Role
          </Typography>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        {/* User Information Card */}
        <Box
          sx={{
            backgroundColor: '#fcf8d8',
            borderRadius: 2,
            p: 2,
            mb: 3,
          }}
        >
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            User Information
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
            {/* Name */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonAdd sx={{ fontSize: 20, color: '#666666' }} />
              <Typography variant="body2">
                <strong>{user.first_name} {user.last_name}</strong>
              </Typography>
            </Box>

            {/* Email */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Email sx={{ fontSize: 20, color: '#666666' }} />
              <Typography variant="body2">{user.email}</Typography>
            </Box>

            {/* Phone */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Phone sx={{ fontSize: 20, color: '#666666' }} />
              <Typography variant="body2">{user.phone_number}</Typography>
            </Box>

            {/* ID Number */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BadgeIcon sx={{ fontSize: 20, color: '#666666' }} />
              <Typography variant="body2">ID: {user.id_number}</Typography>
            </Box>

            {/* County */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn sx={{ fontSize: 20, color: '#666666' }} />
              <Typography variant="body2">{user.county} County</Typography>
            </Box>

            {/* Created Date */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarToday sx={{ fontSize: 20, color: '#666666' }} />
              <Typography variant="body2" color="text.secondary">
                Registered: {formatDate(user.created_at)}
              </Typography>
            </Box>
          </Box>

          {/* Current Status */}
          <Box sx={{ mt: 2 }}>
            <Chip
              label="PENDING ROLE ASSIGNMENT"
              size="small"
              sx={{
                backgroundColor: '#ffa500',
                color: '#ffffff',
                fontWeight: 600,
              }}
            />
          </Box>
        </Box>

        {/* Role Selection */}
        <TextField
          select
          fullWidth
          label="Select Role"
          value={selectedRole}
          onChange={handleRoleChange}
          error={!!roleError}
          helperText={roleError || 'Choose a role for this user'}
          sx={{ mb: 2 }}
        >
          {AVAILABLE_ROLES.map((role) => (
            <MenuItem key={role.value} value={role.value}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: role.color,
                  }}
                />
                <Typography>{role.label}</Typography>
              </Box>
            </MenuItem>
          ))}
        </TextField>

        {/* Role Description */}
        {selectedRole && (
          <Box
            sx={{
              backgroundColor: '#f5f5f5',
              borderRadius: 1,
              p: 2,
              border: '1px solid #e0e0e0',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {selectedRole === 'County Coordinator' &&
                'Full administrative access. Can invite users, assign roles, and manage emergency responses.'}
              {selectedRole === 'Rescue Team' &&
                'Can respond to emergencies, update case status, and coordinate rescue operations.'}
              {selectedRole === 'Driver' &&
                'Can view assigned routes, update vehicle status, and navigate to emergency locations.'}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={assigningRole}
          sx={{
            color: '#666666',
            '&:hover': {
              backgroundColor: '#f5f5f5',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={assigningRole}
          sx={{
            backgroundColor: '#000000',
            '&:hover': {
              backgroundColor: '#333333',
            },
            minWidth: 120,
          }}
        >
          {assigningRole ? (
            <CircularProgress size={24} sx={{ color: 'white' }} />
          ) : (
            'Assign Role'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignRoleDialog;