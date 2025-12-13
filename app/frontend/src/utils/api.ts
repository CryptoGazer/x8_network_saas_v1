const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  role?: 'client' | 'manager' | 'admin';
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

interface UserResponse {
  id: number;
  email: string;
  full_name: string;
  role: string;
  subscription_tier?: string;
  is_active: boolean;
  created_at: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async login(email: string, password: string): Promise<TokenResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    const data: TokenResponse = await response.json();
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    return data;
  }

  async register(registerData: RegisterRequest): Promise<TokenResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }

    const data: TokenResponse = await response.json();
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    return data;
  }

  async getCurrentUser(): Promise<UserResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/me`, {
      method: 'GET',
      headers: {
        ...this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    return await response.json();
  }

  async refreshToken(): Promise<TokenResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.baseUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data: TokenResponse = await response.json();
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    return data;
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('isAuthenticated');
  }

  async requestPasswordReset(email: string): Promise<{ message: string; email: string }> {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/request-password-reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to send reset code');
    }

    return await response.json();
  }

  async verifyResetCode(email: string, code: string): Promise<{ message: string; email: string }> {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/verify-reset-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Invalid or expired reset code');
    }

    return await response.json();
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<TokenResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code, new_password: newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to reset password');
    }

    const data: TokenResponse = await response.json();
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    return data;
  }

  async requestMagicLink(email: string): Promise<{ message: string; email: string }> {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/request-magic-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to send magic link');
    }

    return await response.json();
  }

  async verifyMagicLink(token: string): Promise<TokenResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/verify-magic-link?token=${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Invalid or expired magic link');
    }

    const data: TokenResponse = await response.json();
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    return data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to change password');
    }

    return await response.json();
  }

  async getAllManagers(): Promise<UserResponse[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/admin/managers`, {
      method: 'GET',
      headers: {
        ...this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch managers');
    }

    return await response.json();
  }

  async getMyClients(): Promise<UserResponse[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/managers/clients`, {
      method: 'GET',
      headers: {
        ...this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch clients');
    }

    return await response.json();
  }

  async getAdminStats(): Promise<{
    total_managers: number;
    clients_with_subscription: number;
    clients_on_trial: number;
    trial_clients: Array<{ id: number; email: string; full_name: string; days_remaining: number }>;
    paid_clients: Array<{ id: number; email: string; full_name: string; subscription_tier: string; days_until_renewal: number; renewal_date: string }>;
  }> {
    const response = await fetch(`${this.baseUrl}/api/v1/admin/stats`, {
      method: 'GET',
      headers: {
        ...this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch stats');
    }

    return await response.json();
  }

  async getManagerStats(): Promise<{
    clients_with_subscription: number;
    clients_on_trial: number;
    trial_clients: Array<{ id: number; email: string; full_name: string; days_remaining: number }>;
    paid_clients: Array<{ id: number; email: string; full_name: string; subscription_tier: string; days_until_renewal: number; renewal_date: string }>;
  }> {
    const response = await fetch(`${this.baseUrl}/api/v1/managers/stats`, {
      method: 'GET',
      headers: {
        ...this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch manager stats');
    }

    return await response.json();
  }

  async createPaymentLink(planId: string): Promise<{
    payment_link_url: string;
    plan: string;
    amount: number;
    currency: string;
  }> {
    const response = await fetch(`${this.baseUrl}/api/v1/subscriptions/create-payment-link?plan_id=${planId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create payment link');
    }

    return await response.json();
  }

  async getCompanies(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/companies`, {
      method: 'GET',
      headers: {
        ...this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch companies');
    }

    return await response.json();
  }

  async updateProfile(data: { full_name?: string; email?: string }): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/users/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update profile');
    }

    return await response.json();
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
