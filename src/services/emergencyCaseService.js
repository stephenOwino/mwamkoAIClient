// src/services/emergencyCaseService.js
const API_BASE_URL = 'http://localhost:8000';

const emergencyCaseService = {
  // Create a new emergency case
  async createEmergencyCase(caseData, token) {
    try {
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('🚨 Creating emergency case with data:', caseData);

      const response = await fetch(`${API_BASE_URL}/api/v1/cases/emergency_cases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(caseData),
      });

      const data = await response.json();
      console.log('✅ API Response:', data);

      if (!response.ok) {
        console.error('❌ API Error:', data);
        throw new Error(data.detail || 'Failed to create emergency case');
      }

      return data;
    } catch (error) {
      console.error('💥 Create emergency case error:', error);
      throw error;
    }
  },

  // Get all emergency cases (with optional filtering)
  async getEmergencyCases(token, filters = {}) {
    try {
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.severity) queryParams.append('severity', filters.severity);
      if (filters.disaster_type) queryParams.append('disaster_type', filters.disaster_type);

      const queryString = queryParams.toString();
      const url = queryString 
        ? `${API_BASE_URL}/api/v1/cases/emergency_cases?${queryString}`
        : `${API_BASE_URL}/api/v1/cases/emergency_cases`;

      console.log('📡 Fetching cases from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log('📦 Received cases:', data);

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch emergency cases');
      }

      // Log the RAW data structure
      if (Array.isArray(data) && data.length > 0) {
        console.log('🔍 RAW first case structure:', data[0]);
        console.log('🔍 All keys in first case:', Object.keys(data[0]));
      }

      return data;
    } catch (error) {
      console.error('Get emergency cases error:', error);
      throw error;
    }
  },
};

export default emergencyCaseService;