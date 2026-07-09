import api from './axios';

// Helper: extract user object from response data
const extractUser = (data) => {
  // The server may return { token, user: {...} } or { token, ...userFields }
  return data.user || (data.token ? { ...data, token: undefined } : data);
};

// Helper: save auth data to localStorage
const saveAuthData = (data) => {
  if (data.token) {
    localStorage.setItem('token', data.token);
    const user = extractUser(data);
    localStorage.setItem('user', JSON.stringify(user));
  }
};

// LOGIN
export const login = async (email, password) => {
  try {
    const { data } = await api.post('/auth/login', { email, password });
    saveAuthData(data);
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Login failed';
  }
};

// REGISTER
export const register = async (name, email, password, skills, teamName = '', companyName = '', role = 'member') => {
  try {
    const { data } = await api.post('/auth/register', { name, email, password, skills, teamName, companyName, role });
    saveAuthData(data);
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Registration failed';
  }
};

// HIDDEN ORGANIZATION SETUP
export const orgSetup = async (name, email, password, companyName, companyEmail, description) => {
  try {
    const { data } = await api.post('/auth/org/setup', {
      name,
      email,
      password,
      companyName,
      companyEmail,
      description
    });
    saveAuthData(data);
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Organization setup failed';
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// GET CURRENT USER
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const { data } = await api.get('/auth/me');
    return data;
  } catch (error) {
    // Only clear auth state for 401 (invalid/expired token), not network errors
    if (error.response?.status === 401) {
      logout();
    }
    return null;
  }
};