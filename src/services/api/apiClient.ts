const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('vdx_jwt_token');
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('vdx_jwt_token', token);
    } else {
      localStorage.removeItem('vdx_jwt_token');
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = new Headers(options.headers || {});

    if (this.token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.error || errorBody.message || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  // Auth APIs
  public auth = {
    register: (data: any) => this.request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: any) => this.request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    me: () => this.request('/auth/me'),
    logout: () => {
      this.setToken(null);
      return this.request('/auth/logout', { method: 'POST' });
    },
  };

  // Wallet Linking APIs
  public wallet = {
    getNonce: (walletAddress: string) =>
      this.request('/wallet/nonce', { method: 'POST', body: JSON.stringify({ walletAddress }) }),
    verifySignature: (walletAddress: string, signature: string, nonce: string) =>
      this.request('/wallet/verify-signature', {
        method: 'POST',
        body: JSON.stringify({ walletAddress, signature, nonce }),
      }),
    getStatus: () => this.request('/wallet/status'),
  };

  // Credential Lifecycle APIs
  public credentials = {
    prepare: (formData: FormData) =>
      this.request('/credentials/prepare', { method: 'POST', body: formData }),
    confirmIssuance: (credentialId: string, blockchainTxHash: string) =>
      this.request('/credentials/confirm-issuance', {
        method: 'POST',
        body: JSON.stringify({ credentialId, blockchainTxHash }),
      }),
    prepareRevocation: (id: string, reason: string) =>
      this.request(`/credentials/${id}/prepare-revocation`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    confirmRevocation: (id: string, blockchainTxHash: string, reason: string) =>
      this.request(`/credentials/${id}/confirm-revocation`, {
        method: 'POST',
        body: JSON.stringify({ blockchainTxHash, reason }),
      }),
    list: (params?: { status?: string; search?: string }) => {
      const q = new URLSearchParams(params as any).toString();
      return this.request(`/credentials?${q}`);
    },
    downloadUrl: (credentialId: string) => `${API_BASE_URL}/credentials/${credentialId}/download`,
  };

  // Verification APIs
  public verification = {
    verify: (credentialId: string, method: string = 'MANUAL_ID') =>
      this.request('/verification/verify', {
        method: 'POST',
        body: JSON.stringify({ credentialId, verificationMethod: method }),
      }),
    getHistory: () => this.request('/verification/history'),
  };
}

export const api = new ApiClient();
