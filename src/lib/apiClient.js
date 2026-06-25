export async function requestJson(url, options = {}) {
  const { json, token, headers = {}, body, ...fetchOptions } = options;
  const requestHeaders = { ...headers };

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  // If caller provided `json` but didn't specify a method, default to POST
  if (json !== undefined && !fetchOptions.method) {
    fetchOptions.method = 'POST';
  }

  let requestBody = body;
  if (json !== undefined) {
    // Avoid attaching a body to GET/HEAD requests (browsers reject this)
    const method = (fetchOptions.method || '').toUpperCase();
    if (method === 'GET' || method === 'HEAD') {
      // remove body and content-type to prevent fetch errors
      requestBody = undefined;
    } else {
      requestHeaders['Content-Type'] = 'application/json';
      requestBody = JSON.stringify(json);
    }
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers: requestHeaders,
    body: requestBody,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Request failed');
  }

  return data;
}

export const authStorage = {
  getToken() {
    return localStorage.getItem('token');
  },
  setToken(token) {
    localStorage.setItem('token', token);
  },
  getMockUser() {
    const value = localStorage.getItem('mock_user');
    return value ? JSON.parse(value) : null;
  },
  setMockUser(user) {
    localStorage.setItem('mock_user', JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem('token');
    localStorage.removeItem('mock_user');
  },
};