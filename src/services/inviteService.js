const API_BASE_URL = 'http://localhost:8000';

const inviteService = {
  // Invite a new user (County Coordinator only)
  async inviteUser(inviteData, token) {
    try {
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/auth/admin/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(inviteData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to send invitation');
      }

      return data;
    } catch (error) {
      console.error('Invite user error:', error);
      throw error;
    }
  },

  // Get list of invited users (optional - for future use)
  async getInvitedUsers(token) {
    try {
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/auth/admin/invitations`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch invited users');
      }

      return data;
    } catch (error) {
      console.error('Get invited users error:', error);
      throw error;
    }
  },

  // Resend invitation (optional - for future use)
  async resendInvitation(email, token) {
    try {
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/auth/admin/invite/resend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to resend invitation');
      }

      return data;
    } catch (error) {
      console.error('Resend invitation error:', error);
      throw error;
    }
  },

  // Accept invitation and set password
  async acceptInvite(inviteToken, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/invite/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: inviteToken,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to accept invitation');
      }

      return data;
    } catch (error) {
      console.error('Accept invite error:', error);
      throw error;
    }
  },
};

export default inviteService;