import Notification from '../models/Notification.js';

export const sendNotification = async (
  io,
  { userId, message, type = 'task_assigned', relatedTask = null, relatedProject = null, fromUser = null }
) => {
  if (!userId || !message) {
    return null;
  }

  try {
    const notification = await Notification.create({
      user: userId,
      message,
      type,
      relatedTask,
      relatedProject,
      fromUser,
    });

    if (io) {
      io.to(`user:${notification.user.toString()}`).emit('notification:new', notification);
    }

    return notification;
  } catch (error) {
    console.error('Failed to send notification:', error);
    return null;
  }
};
