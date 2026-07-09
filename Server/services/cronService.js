import cron from 'node-cron';
import Task from '../models/Task.js';
import { sendNotification } from './notificationService.js';

// Check for delayed tasks and send notifications every hour
export const initCronJobs = (io) => {
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
      })
        .populate('assignedTo', '_id name email')
        .populate('createdBy', '_id name')
        .populate('project', '_id title');

      console.log(`Found ${delayedTasks.length} delayed tasks`);

      for (const task of delayedTasks) {
        // Update task status
        task.status = 'delayed';
        await task.save();

        if (task.assignedTo) {
          await sendNotification(io, {
            userId: task.assignedTo._id,
            message: `⚠️ Your task "${task.title}" is overdue. Please update your progress or contact your manager.`,
            type: 'delay',
            relatedTask: task._id,
            relatedProject: task.project,
            fromUser: task.createdBy?._id,
          });
        }

        if (task.createdBy && task.createdBy._id.toString() !== task.assignedTo?._id.toString()) {
          await sendNotification(io, {
            userId: task.createdBy._id,
            message: `⚠️ "${task.title}" assigned to ${task.assignedTo?.name || 'an unassigned member'} is overdue in ${task.project?.title || 'the project'}`,
            type: 'delay',
            relatedTask: task._id,
            relatedProject: task.project,
            fromUser: task.assignedTo?._id,
          });
        }
      }
    } catch (error) {
      console.error('Error in delay detection cron:', error);
    }
  });

  console.log('Delay detection cron job scheduled (every hour)');
};