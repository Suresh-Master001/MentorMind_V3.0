import api from './axios';

export const getUsers = async () => {
  const { data } = await api.get('/users');
  return data;
};

export const getUserById = async (id) => {
  const { data } = await api.get(`/users/${id}`);
  return data;
};

// Updates the current user's profile (name, skills, etc.)
export const updateUserProfile = async (profileData) => {
  const { data } = await api.put('/users/profile', profileData);
  return data;
};