import api from './axios';

export const getMyReportStats = async () => {
  const { data } = await api.get('/reports/my-stats');
  return data;
};

export const saveStandupNote = async (payload) => {
  const { data } = await api.post('/reports/standup', payload);
  return data;
};

export const getStandupNotes = async () => {
  const { data } = await api.get('/reports/standup');
  return data;
};

export const getAnalyticsOverview = async () => {
  const { data } = await api.get('/analytics/overview');
  return data;
};

export const getAnalyticsMonthly = async () => {
  const { data } = await api.get('/analytics/monthly');
  return data;
};

export const getTeamReport = async () => {
  const { data } = await api.get('/analytics/team-report');
  return data;
};

export const getProjectReport = async () => {
  const { data } = await api.get('/analytics/project-report');
  return data;
};

export const getMemberReport = async (userId) => {
  const { data } = await api.get(`/reports/member/${userId}`);
  return data;
};
