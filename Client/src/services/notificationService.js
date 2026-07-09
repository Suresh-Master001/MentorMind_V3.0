import api from './axios';

export const getNotifications = async () => {
  try {
    const { data } = await api.get('/notifications');
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch notifications';
  }
};

export const getUnreadCount = async () => {
  try {
    const { data } = await api.get('/notifications/unread-count');
    return data;
  } catch (_error) {
    return { count: 0 };
  }
};

export const markAsRead = async (id) => {
  try {
    const { data } = await api.put(`/notifications/${id}/read`);
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to mark as read';
  }
};

export const markAllAsRead = async () => {
  try {
    const { data } = await api.put('/notifications/read-all');
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to mark all as read';
  }
};