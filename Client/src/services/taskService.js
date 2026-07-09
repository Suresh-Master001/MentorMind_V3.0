import api from './axios';

export const getTasks = async (projectId) => {
  const params = projectId ? `?projectId=${projectId}` : '';
  const { data } = await api.get(`/tasks${params}`);
  return data;
};

export const getTaskById = async (id) => {
  const { data } = await api.get(`/tasks/${id}`);
  return data;
};

export const createTask = async (taskData) => {
  const { data } = await api.post('/tasks', taskData);
  return data;
};

export const updateTask = async (id, updatedData) => {
  const { data } = await api.put(`/tasks/${id}`, updatedData);
  return data;
};

export const deleteTask = async (id) => {
  const { data } = await api.delete(`/tasks/${id}`);
  return data;
};

export const confirmTask = async (id) => {
  const { data } = await api.put(`/tasks/${id}/confirm`);
  return data;
};

export const completeTask = async (id, payload) => {
  const { data } = await api.put(`/tasks/${id}/complete`, payload);
  return data;
};

export const selfAssignTask = async (id) => {
  const { data } = await api.post(`/tasks/${id}/self-assign`);
  return data;
};

export const assignTask = async (id, userId) => {
  const body = userId ? { userId } : {};
  const { data } = await api.post(`/tasks/${id}/assign`, body);
  return data;
};

export const autoAssignAll = async (projectId) => {
  const { data } = await api.post('/tasks/auto-assign-all', { projectId });
  return data;
};

export const getMatchPreview = async (id) => {
  const { data } = await api.get(`/tasks/${id}/match-preview`);
  return data;
};