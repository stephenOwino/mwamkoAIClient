const API_BASE_URL = 'http://localhost:8000';

const userManagementService = {
  // Get pending users in coordinator's county
  async getPendingUsers(token) {
    try {
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/auth/admin/pending-users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch pending users');
      }

      return data;
    } catch (error) {
      console.error('Get pending users error:', error);
      throw error;
    }
  },

  // Assign role to a user
  async assignRole(userId, role, token) {
    try {
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/auth/admin/assign-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: userId,
          role: role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to assign role');
      }

      return data;
    } catch (error) {
      console.error('Assign role error:', error);
      throw error;
    }
  },
};

export default userManagementService;