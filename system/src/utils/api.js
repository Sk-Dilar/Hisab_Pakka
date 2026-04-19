const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiRequest = async (endpoint, method = 'GET', data = null) => {
  const token = localStorage.getItem('token');
  
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Something went wrong');
    }

    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const register = (name, email, password) => {
  return apiRequest('/auth/register', 'POST', { name, email, password });
};

export const login = (email, password) => {
  return apiRequest('/auth/login', 'POST', { email, password });
};
