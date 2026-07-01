import cron from 'node-cron';
import Task from '../models/Task.js';
import Notification from '../models/Notification.js';
import mongoose from 'mongoose';

// Check for delayed tasks and send notifications every hour
export const initCronJobs = () => {
  console.log('Initializing cron jobs...');

  // Run every hour: 0 * * * *
  cron.schedule('0 * * * *', async () => {
    console.log('Running delay detection check...');
    try {
      const now = new Date();

      // Find tasks that are not completed and have deadline in the past
      const delayedTasks = await Task.find({
        status: { $nin: ['completed'] },
        deadline: { $lt: now }
      }).populate('assignedTo', '_id name email').populate('createdBy', '_id name');

      console.log(`Found ${delayedTasks.length} delayed tasks`);

      for (const task of delayedTasks) {
        // Update task status
        task.status = 'delayed';
        await task.save();

        // Notify assigned user
        if (task.assignedTo) {
          await Notification.create({
            user: task.assignedTo._id,
            message: `Task "${task.title}" is overdue (deadline: ${new Date(task.deadline).toLocaleDateString()})`,
            type: 'delay',
            relatedTask: task._id
          });
        }

        // Notify task creator
        if (task.createdBy && task.createdBy._id.toString() !== task.assignedTo?._id.toString()) {
          await Notification.create({
            user: task.createdBy._id,
            message: `Task "${task.title}" assigned to ${task.assignedTo?.name || 'unassigned'} is overdue`,
            type: 'delay',
            relatedTask: task._id
          });
        }
      }
    } catch (error) {
      console.error('Error in delay detection cron:', error);
    }
  });

  console.log('Delay detection cron job scheduled (every hour)');
};