import { auth } from './firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiRequest = async (path, options = {}) => {
  const request = async (forceRefresh = false) => {
    const token = await auth?.currentUser?.getIdToken(forceRefresh);
    return fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  };

  let response = await request();
  if (response.status === 401 && auth?.currentUser) {
    response = await request(true);
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || 'The server could not complete this request.');
  }
  return response.status === 204 ? undefined : response.json();
};
