import api from './axios';

export const getProjects = async () => {
  const { data } = await api.get('/projects');
  return data;
};

export const getProjectById = async (id) => {
  const { data } = await api.get(`/projects/${id}`);
  return data;
};

export const createProject = async (projectData) => {
  const { data } = await api.post('/projects', projectData);
  return data;
};

export const updateProject = async (id, updatedData) => {
  const { data } = await api.put(`/projects/${id}`, updatedData);
  return data;
};

export const deleteProject = async (id) => {
  const { data } = await api.delete(`/projects/${id}`);
  return data;
};