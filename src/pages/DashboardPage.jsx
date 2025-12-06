// src/pages/DashboardPage.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Container, Typography, Box, Paper, Grid } from '@mui/material';
import { Dashboard, People, Route, Warning } from '@mui/icons-material';

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', minHeight: 'calc(100vh - 64px)', py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Welcome, {user?.email?.split('@')[0] || 'User'}!
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
          {user?.role} - {user?.county} County
        </Typography>

        <Grid container spacing={3}>
          {/* Dashboard Cards */}
          <Grid item xs={12} md={6} lg={3}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                backgroundColor: '#ffffff',
                borderLeft: '4px solid #ff6b6b',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Warning sx={{ fontSize: 40, color: '#ff6b6b' }} />
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    12
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Cases
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                backgroundColor: '#ffffff',
                borderLeft: '4px solid #4caf50',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Route sx={{ fontSize: 40, color: '#4caf50' }} />
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    5
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Routes Optimized
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                backgroundColor: '#ffffff',
                borderLeft: '4px solid #2196f3',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <People sx={{ fontSize: 40, color: '#2196f3' }} />
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    8
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Team Members
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                backgroundColor: '#ffffff',
                borderLeft: '4px solid #ffa500',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Dashboard sx={{ fontSize: 40, color: '#ffa500' }} />
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    24
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Resolved Cases
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Recent Activity
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Dashboard content coming soon...
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default DashboardPage;