const API_BASE_URL = 'http://localhost:8000';

const vehicleService = {
  // Create a new rescue vehicle
  async createVehicle(vehicleData, token) {
    try {
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/vehicles/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(vehicleData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to create vehicle');
      }

      return data;
    } catch (error) {
      console.error('Create vehicle error:', error);
      throw error;
    }
  },

  // Get all rescue vehicles with optional filtering
  async getVehicles(token, filters = {}) {
    try {
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.vehicle_type) queryParams.append('vehicle_type', filters.vehicle_type);

      const queryString = queryParams.toString();
      const url = queryString 
        ? `${API_BASE_URL}/vehicles/?${queryString}`
        : `${API_BASE_URL}/vehicles/`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch vehicles');
      }

      return data;
    } catch (error) {
      console.error('Get vehicles error:', error);
      throw error;
    }
  },

  // Update vehicle status
  async updateVehicleStatus(vehicleId, status, token) {
    try {
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ current_status: status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to update vehicle status');
      }

      return data;
    } catch (error) {
      console.error('Update vehicle status error:', error);
      throw error;
    }
  },

  // Update vehicle location
  async updateVehicleLocation(vehicleId, location, token) {
    try {
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ current_location: location }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to update vehicle location');
      }

      return data;
    } catch (error) {
      console.error('Update vehicle location error:', error);
      throw error;
    }
  },
};

export default vehicleService;