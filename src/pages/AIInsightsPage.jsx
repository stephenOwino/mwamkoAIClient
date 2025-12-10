// src/pages/AIInsightsPage.jsx
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
  CircularProgress,
  Chip,
  Alert,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  Psychology,
  Lightbulb,
  TrendingUp,
  Warning as WarningIcon,
  AutoFixHigh,
  Analytics,
} from '@mui/icons-material';
import {
  analyzeEmergencies,
  generatePredictiveAlerts,
  clearAIMessages,
} from '../slices/aiSlice';
import { toast } from 'react-toastify';

const AIInsightsPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const {
    analysis,
    predictiveAlerts,
    analyzing,
    generatingAlerts,
    error,
    successMessage,
  } = useSelector((state) => state.ai);

  const [showThinking, setShowThinking] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAIMessages());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearAIMessages());
    }
  }, [error, successMessage, dispatch]);

  const handleAnalyze = () => {
    setShowThinking(true);
    dispatch(analyzeEmergencies()).finally(() => {
      setTimeout(() => setShowThinking(false), 2000);
    });
  };

  const handleGenerateAlerts = () => {
    setShowThinking(true);
    dispatch(generatePredictiveAlerts()).finally(() => {
      setTimeout(() => setShowThinking(false), 2000);
    });
  };

  const AIThinkingCard = () => (
    <Card elevation={3} sx={{ borderRadius: 2, mb: 3 }}>
      <CardContent>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Psychology sx={{ fontSize: 60, color: '#9c27b0', mb: 2 }} />
          <Typography variant="h6" fontWeight={600} gutterBottom>
            AI Agent is Thinking...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Using GPT-4 capabilities to analyze emergency patterns and generate insights
          </Typography>
          <LinearProgress
            sx={{
              height: 8,
              borderRadius: 1,
              backgroundColor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#9c27b0',
              },
            }}
          />
          <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Chip label="Analyzing patterns" size="small" />
            <Chip label="Processing data" size="small" />
            <Chip label="Generating recommendations" size="small" />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', backgroundColor: '#f5f5f5', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Psychology sx={{ fontSize: 40, color: '#9c27b0' }} />
            <Box>
              <Typography variant="h4" fontWeight={700}>
                AI Insights & Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Powered by GPT-4 - Advanced emergency response intelligence
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* AI Thinking Indicator */}
        {(showThinking || analyzing || generatingAlerts) && <AIThinkingCard />}

        {/* Action Buttons */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card
              elevation={3}
              sx={{
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 16px rgba(0,0,0,0.2)' },
              }}
              onClick={handleAnalyze}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Analytics sx={{ fontSize: 60, color: '#2196f3', mb: 2 }} />
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Analyze Emergencies
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  AI-powered analysis of all active emergency situations
                </Typography>
                <Button
                  variant="contained"
                  disabled={analyzing}
                  sx={{
                    backgroundColor: '#2196f3',
                    '&:hover': { backgroundColor: '#1976d2' },
                  }}
                >
                  {analyzing ? <CircularProgress size={24} /> : 'Run Analysis'}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              elevation={3}
              sx={{
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 16px rgba(0,0,0,0.2)' },
              }}
              onClick={handleGenerateAlerts}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <TrendingUp sx={{ fontSize: 60, color: '#ffa500', mb: 2 }} />
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Predictive Alerts
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Generate predictive alerts based on historical patterns
                </Typography>
                <Button
                  variant="contained"
                  disabled={generatingAlerts}
                  sx={{
                    backgroundColor: '#ffa500',
                    '&:hover': { backgroundColor: '#ff9800' },
                  }}
                >
                  {generatingAlerts ? <CircularProgress size={24} /> : 'Generate Alerts'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Analysis Results */}
        {analysis && (
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Lightbulb sx={{ color: '#ffa500' }} />
              <Typography variant="h6" fontWeight={700}>
                AI Analysis Results
              </Typography>
              <Chip
                label={`Confidence: ${(analysis.confidence * 100).toFixed(0)}%`}
                size="small"
                sx={{
                  backgroundColor: analysis.confidence > 0.7 ? '#4caf50' : '#ffa500',
                  color: '#ffffff',
                  ml: 'auto',
                }}
              />
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
              {analysis.response}
            </Alert>

            {analysis.reasoning && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Reasoning:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {analysis.reasoning}
                </Typography>
              </Box>
            )}

            {analysis.actions_taken && analysis.actions_taken.length > 0 && (
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Actions Taken:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {analysis.actions_taken.map((action, index) => (
                    <Chip
                      key={index}
                      label={action}
                      icon={<AutoFixHigh />}
                      sx={{ backgroundColor: '#e3f2fd' }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Paper>
        )}

        {/* Predictive Alerts */}
        {predictiveAlerts && predictiveAlerts.length > 0 && (
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <WarningIcon sx={{ color: '#ff6b6b' }} />
              <Typography variant="h6" fontWeight={700}>
                Predictive Alerts
              </Typography>
              <Chip label={predictiveAlerts.length} color="error" sx={{ ml: 'auto' }} />
            </Box>

            <Grid container spacing={2}>
              {predictiveAlerts.map((alert, index) => (
                <Grid item xs={12} key={index}>
                  <Card variant="outlined" sx={{ borderLeft: `4px solid #ffa500` }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        {alert.title || `Alert ${index + 1}`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {alert.message || alert.description || JSON.stringify(alert)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        {/* Empty State */}
        {!analysis && !predictiveAlerts.length && !analyzing && !generatingAlerts && (
          <Paper elevation={3} sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
            <Psychology sx={{ fontSize: 80, color: '#e0e0e0', mb: 2 }} />
            <Typography variant="h6" fontWeight={600} gutterBottom>
              No AI Analysis Yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Click on the cards above to run AI-powered analysis or generate predictive alerts
            </Typography>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default AIInsightsPage;