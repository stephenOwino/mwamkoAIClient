const API_BASE_URL = 'http://localhost:8000';

const routeService = {
  // Calculate optimal route for emergency cases
  async calculateRoute(caseIds, startPointGps, token) {
    try {
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/routes/route/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          case_ids: caseIds,
          start_point_gps: startPointGps,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to calculate route');
      }

      return data;
    } catch (error) {
      console.error('Calculate route error:', error);
      throw error;
    }
  },

  // Get full route details with JSON path for map display
  async getRouteDetails(routeId, token) {
    try {
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/cases/route/${routeId}/details`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch route details');
      }

      return data;
    } catch (error) {
      console.error('Get route details error:', error);
      throw error;
    }
  },

  // Get all calculated routes (summary only)
  async getAllRoutes(token) {
    try {
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/cases/routes/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch routes');
      }

      return data;
    } catch (error) {
      console.error('Get all routes error:', error);
      throw error;
    }
  },
};

export default routeService;