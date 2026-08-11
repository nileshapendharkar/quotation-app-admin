export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://quotation-app-backend.onrender.com/api';

export const getImageUrl = (path) => {
  if (!path) return 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=500&q=80';
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  const baseUrl = API_BASE.replace('/api', '');
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

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
