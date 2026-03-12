// SecureChain API Service - Connects Frontend to Backend

const API_BASE_URL = 'http://localhost:3000/api';

// API Service Class
class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.token = localStorage.getItem('auth_token');
  }

  // Get headers with authentication
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  // Clear authentication token
  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Generic request method
  async request(endpoint, method = 'GET', data = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const options = {
      method,
      headers: this.getHeaders()
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Request failed');
      }
      
      return result;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // ============ AUTH API ============
  
  // Register new user
  async register(name, email, password) {
    const result = await this.request('/auth/register', 'POST', { name, email, password });
    if (result.token) {
      this.setToken(result.token);
    }
    return result;
  }

  // Login user
  async login(email, password) {
    const result = await this.request('/auth/login', 'POST', { email, password });
    if (result.token) {
      this.setToken(result.token);
    }
    return result;
  }

  // Logout user
  async logout() {
    try {
      await this.request('/auth/logout', 'POST');
    } catch (e) {
      // Continue with local logout even if server fails
    }
    this.clearToken();
  }

  // Get current user profile
  async getProfile() {
    return await this.request('/auth/profile', 'GET');
  }

  // ============ DASHBOARD API ============
  
  // Get dashboard data
  async getDashboard() {
    return await this.request('/dashboard', 'GET');
  }

  // Get real-time metrics
  async getMetrics() {
    return await this.request('/dashboard/metrics', 'GET');
  }

  // ============ UPLOAD API ============
  
  // Upload file
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`
      },
      body: formData
    });

    return await response.json();
  }

  // Get user's files
  async getMyFiles() {
    return await this.request('/upload/myfiles', 'GET');
  }

  // ============ VERIFY API ============
  
  // Verify file by hash
  async verifyHash(hash) {
    return await this.request('/verify/hash', 'POST', { hash });
  }

  // ============ THREAT API ============
  
  // Get all threats
  async getThreats(severity, status, limit) {
    const params = new URLSearchParams();
    if (severity) params.append('severity', severity);
    if (status) params.append('status', status);
    if (limit) params.append('limit', limit);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return await this.request(`/threats${query}`, 'GET');
  }

  // Get threat statistics
  async getThreatStats() {
    return await this.request('/threats/stats', 'GET');
  }

  // Get threats by country
  async getThreatsByCountry() {
    return await this.request('/threats/by-country', 'GET');
  }

  // ============ AUDIT API ============
  
// Get audit logs (admin)
  async getAuditLogs(page, limit, eventType) {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (eventType) params.append('eventType', eventType);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return await this.request(`/audit${query}`, 'GET');
  }

  // Get user's activity
  async getMyActivity() {
    return await this.request('/audit/my-activity', 'GET');
  }

  // ============ SIMULATE API ============
  
  // Simulate DDoS attack (admin)
  async simulateDDoS(targetIP, intensity) {
    return await this.request('/simulate/ddos', 'POST', { targetIP, intensity });
  }

  // Simulate brute force (admin)
  async simulateBruteForce(targetIP) {
    return await this.request('/simulate/brute-force', 'POST', { targetIP });
  }

  // Simulate malware detection (admin)
  async simulateMalware() {
    return await this.request('/simulate/malware', 'POST');
  }

  // ============ HEALTH CHECK ============
  
  // Check API health
  async checkHealth() {
    try {
      return await this.request('/health', 'GET');
    } catch (e) {
      return { status: 'unhealthy', error: e.message };
    }
  }
}

// Create global API instance
const api = new ApiService();

// Export for use
window.ApiService = ApiService;
window.api = api;
