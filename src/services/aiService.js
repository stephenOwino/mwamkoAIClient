const API_BASE_URL = 'http://localhost:8000';

const aiService = {
  // AI analysis of all active emergencies
  async analyzeEmergencies(token) {
    try {
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/ai/analyze-emergencies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to analyze emergencies');
      }

      return data;
    } catch (error) {
      console.error('Analyze emergencies error:', error);
      throw error;
    }
  },

  // AI-powered route optimization and recommendations
  async optimizeRoute(routeId, token) {
    try {
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/ai/optimize-route/${routeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to optimize route');
      }

      return data;
    } catch (error) {
      console.error('Optimize route error:', error);
      throw error;
    }
  },

  // Generate predictive alerts based on historical data
  async generatePredictiveAlerts(token) {
    try {
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/ai/predictive-alerts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to generate predictive alerts');
      }

      return data;
    } catch (error) {
      console.error('Generate predictive alerts error:', error);
      throw error;
    }
  },
};

export default aiService;