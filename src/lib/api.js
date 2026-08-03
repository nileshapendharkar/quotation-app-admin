const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export async function apiFetch(endpoint, options = {}) {
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('admin_token');
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(`API Fetch Error [${endpoint}]:`, err);
    return { success: false, message: 'Server connection failed' };
  }
}
