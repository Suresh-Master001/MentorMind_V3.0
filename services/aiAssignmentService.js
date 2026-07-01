/**
 * AI Task Assignment Engine
 * 
 * Scores every eligible employee against a task's required skills,
 * availability, current workload, and TIME CAPACITY.
 * Returns the best match with a full score breakdown for transparency.
 * 
 * Scoring weights:
 *   - Skill match: 40%
 *   - Availability: 15%
 *   - Low workload: 20%
 *   - Time capacity: 25% (new - based on remaining hours vs task estimated hours)
 */

/**
 * Calculate the skill overlap score between a task's required skills
 * and a user's skills.
 * 
 * skillScore = number of matching skills / total required skills
 * Returns 0 if the task has no required skills (everyone eligible).
 * Returns 0..1 where 1 = perfect skill match.
 */
function calculateSkillScore(requiredSkills, userSkills) {
  if (!requiredSkills || requiredSkills.length === 0) {
    // No specific skills required — everyone is equally skilled here
    return 1;
  }

  const normalizedRequired = requiredSkills.map((s) => s.toLowerCase().trim());
  const normalizedUser = userSkills.map((s) => s.toLowerCase().trim());

  let matchCount = 0;
  for (const reqSkill of normalizedRequired) {
    if (normalizedUser.includes(reqSkill)) {
      matchCount++;
    }
  }

  return matchCount / requiredSkills.length;
}

/**
 * Calculate the availability score.
 * 
 * availabilityScore = user.availability / 100
 * A user with 100% availability gets 1.0
 * A user with 0% availability gets 0.0
 */
function calculateAvailabilityScore(availability) {
  return Math.max(0, Math.min(1, availability / 100));
}

/**
 * Calculate the workload score.
 * Lower current workload is better.
 * 
 * workloadScore = (100 - user.currentWorkload) / 100
 * A user with 0% workload gets 1.0
 * A user with 100% workload gets 0.0
 */
function calculateWorkloadScore(currentWorkload) {
  return Math.max(0, Math.min(1, (100 - currentWorkload) / 100));
}

/**
 * Calculate the time capacity score.
 * Checks if the user has enough remaining hours to take on this task
 * based on their workingHoursPerDay and totalAssignedHours.
 * 
 * capacityScore = remainingCapacity / workingHoursPerDay
 * If remainingCapacity >= task estimatedHours, score is high
 * If remainingCapacity < task estimatedHours, score scales down
 * 
 * @param {Object} user - User document with workingHoursPerDay, totalAssignedHours, loggedHours
 * @param {number} taskEstimatedHours - How many hours the task is estimated to take
 * @returns {number} 0..1 score
 */
function calculateTimeCapacityScore(user, taskEstimatedHours) {
  const workingHours = user.workingHoursPerDay || 8;
  const assignedHours = user.totalAssignedHours || 0;
  const logged = user.loggedHours || 0;
  
  // Remaining capacity in hours
  const remainingCapacity = Math.max(0, workingHours - (assignedHours - logged));
  
  if (remainingCapacity <= 0) return 0;
  
  // If task fits within remaining capacity, score is proportional
  // If task is larger than capacity, score drops significantly
  if (taskEstimatedHours <= remainingCapacity) {
    // Task fits comfortably - high score
    return Math.min(1, remainingCapacity / workingHours);
  } else {
    // Task exceeds remaining capacity - penalize
    return Math.max(0, remainingCapacity / taskEstimatedHours) * 0.5;
  }
}

/**
 * Calculate the task count score.
 * Checks if the user hasn't exceeded their maxTasksPerDay limit.
 * 
 * @param {Object} user - User document with maxTasksPerDay
 * @param {number} currentTaskCount - Number of active tasks user currently has
 * @returns {number} 0..1 score
 */
function calculateTaskCountScore(user, currentTaskCount) {
  const maxTasks = user.maxTasksPerDay || 5;
  if (currentTaskCount >= maxTasks) return 0;
  return 1 - (currentTaskCount / maxTasks);
}

/**
 * Main scoring function.
 * For a given task and list of eligible users, computes the best match.
 * 
 * @param {Object} task - Task document with requiredSkills[], estimatedHours
 * @param {Array} eligibleUsers - Array of User documents with skills[], availability, currentWorkload, workingHoursPerDay, totalAssignedHours, loggedHours
 * @param {Object} options - Optional configuration
 * @param {number} options.skillWeight - Weight for skill score (default 0.40)
 * @param {number} options.availabilityWeight - Weight for availability (default 0.15)
 * @param {number} options.workloadWeight - Weight for workload (default 0.20)
 * @param {number} options.timeCapacityWeight - Weight for time capacity (default 0.25)
 * @returns {Object} { bestUser, skillScore, availabilityScore, workloadScore, timeCapacityScore, taskCountScore, finalScore, allScores }
 */
export function calculateBestMatch(task, eligibleUsers, options = {}) {
  if (!eligibleUsers || eligibleUsers.length === 0) {
    return {
      bestUser: null,
      skillScore: 0,
      availabilityScore: 0,
      workloadScore: 0,
      timeCapacityScore: 0,
      taskCountScore: 0,
      finalScore: 0,
      allScores: []
    };
  }

  const requiredSkills = task.requiredSkills || [];
  const taskEstimatedHours = task.estimatedHours || 4;

  // Weights - can be overridden via options
  const skillWeight = options.skillWeight ?? 0.40;
  const availabilityWeight = options.availabilityWeight ?? 0.15;
  const workloadWeight = options.workloadWeight ?? 0.20;
  const timeCapacityWeight = options.timeCapacityWeight ?? 0.25;

  // Compute scores for every eligible user
  const allScores = eligibleUsers.map((user) => {
    const skillScore = calculateSkillScore(requiredSkills, user.skills || []);
    const availabilityScore = calculateAvailabilityScore(user.availability ?? 100);
    const workloadScore = calculateWorkloadScore(user.currentWorkload ?? 0);
    const timeCapacityScore = calculateTimeCapacityScore(user, taskEstimatedHours);
    const taskCountScore = calculateTaskCountScore(user, user.activeTaskCount || 0);

    // Weighted composite: skill 40%, availability 15%, workload 20%, time capacity 25%
    const finalScore = 
      skillScore * skillWeight + 
      availabilityScore * availabilityWeight + 
      workloadScore * workloadWeight + 
      timeCapacityScore * timeCapacityWeight;

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        skills: user.skills,
        availability: user.availability,
        currentWorkload: user.currentWorkload,
        workingHoursPerDay: user.workingHoursPerDay,
        totalAssignedHours: user.totalAssignedHours,
        loggedHours: user.loggedHours,
        remainingCapacity: user.remainingCapacity,
        capacityUtilization: user.capacityUtilization
      },
      skillScore: Math.round(skillScore * 100) / 100,
      availabilityScore: Math.round(availabilityScore * 100) / 100,
      workloadScore: Math.round(workloadScore * 100) / 100,
      timeCapacityScore: Math.round(timeCapacityScore * 100) / 100,
      taskCountScore: Math.round(taskCountScore * 100) / 100,
      finalScore: Math.round(finalScore * 100) / 100
    };
  });

  // Filter to users with at least one matching skill (skillScore > 0)
  const qualified = allScores.filter((s) => s.skillScore > 0);

  if (qualified.length === 0) {
    // No one has any matching skill — leave unassigned
    return {
      bestUser: null,
      skillScore: 0,
      availabilityScore: 0,
      workloadScore: 0,
      timeCapacityScore: 0,
      taskCountScore: 0,
      finalScore: 0,
      allScores
    };
  }

  // Sort by finalScore descending; pick the highest
  qualified.sort((a, b) => b.finalScore - a.finalScore);
  const winner = qualified[0];

  return {
    bestUser: winner.user,
    skillScore: winner.skillScore,
    availabilityScore: winner.availabilityScore,
    workloadScore: winner.workloadScore,
    timeCapacityScore: winner.timeCapacityScore,
    taskCountScore: winner.taskCountScore,
    finalScore: winner.finalScore,
    allScores
  };
}

/**
 * Configuration: how much workload to add per assigned task.
 * Exporting as a constant so it can be overridden in tests.
 */
export const WORKLOAD_INCREMENT = 10;
export const MAX_WORKLOAD = 100;

/**
 * Build a human-readable assignment reason string.
 * Includes time capacity info.
 * Example: "Skill match: React, Node.js (2/3 required) | Availability: 80% | Workload: 30% free | Time: 6h/8h remaining"
 */
export function buildReason(task, user, scores) {
  const requiredSkills = task.requiredSkills || [];
  const userSkills = user.skills || [];
  const normalizedRequired = requiredSkills.map((s) => s.toLowerCase().trim());
  const normalizedUser = userSkills.map((s) => s.toLowerCase().trim());

  let matchCount = 0;
  for (const reqSkill of normalizedRequired) {
    if (normalizedUser.includes(reqSkill)) {
      matchCount++;
    }
  }

  const matchText = requiredSkills.length > 0
    ? `${requiredSkills.slice(0, 3).join(', ')}${requiredSkills.length > 3 ? '...' : ''} (${matchCount}/${requiredSkills.length} required)`
    : 'General match';

  const availability = user.availability ?? 100;
  const workloadFree = Math.max(0, 100 - (user.currentWorkload ?? 0));
  const remainingCap = user.remainingCapacity ?? 0;
  const taskHours = task.estimatedHours || 4;

  return `Skill match: ${matchText} | Availability: ${availability}% | Workload: ${workloadFree}% free | Time: ${remainingCap}h/${user.workingHoursPerDay || 8}h remaining (task needs ${taskHours}h)`;
}

/**
 * Auto-assign all pending tasks for a project to the best matching member.
 * Updates workload and totalAssignedHours on assignment.
 */
export async function autoAssignAllTasks(projectId) {
  const Task = (await import('../models/Task.js')).default;
  const User = (await import('../models/User.js')).default;

  const tasks = await Task.find({ project: projectId, status: 'pending' })
    .populate('createdBy', 'name email role');

  const assignments = [];

  for (const task of tasks) {
    if (!task.assignedTo) {
      // Eligible users: members of the project
      const project = await (await import('../models/Project.js')).default.findById(projectId)
        .populate({
          path: 'members',
          select: 'name email role skills availability currentWorkload workingHoursPerDay totalAssignedHours loggedHours'
        });
      const eligibleUsers = project?.members || [];

      // Count active tasks per user for task count scoring
      const activeTaskCounts = {};
      const allActiveTasks = await Task.find({ 
        project: projectId, 
        assignedTo: { $ne: null },
        status: { $in: ['pending', 'in-progress'] }
      });
      for (const t of allActiveTasks) {
        if (t.assignedTo) {
          const uid = t.assignedTo.toString();
          activeTaskCounts[uid] = (activeTaskCounts[uid] || 0) + 1;
        }
      }

      // Attach active task count to each user
      const usersWithCounts = eligibleUsers.map(u => {
        const uObj = u.toObject ? u.toObject() : u;
        return {
          ...uObj,
          activeTaskCount: activeTaskCounts[u._id.toString()] || 0
        };
      });

      const { bestUser, skillScore, availabilityScore, workloadScore, timeCapacityScore, taskCountScore, finalScore } = 
        calculateBestMatch(task, usersWithCounts);

      if (bestUser) {
        task.assignedTo = bestUser._id;
        task.skillScore = skillScore;
        task.availabilityScore = availabilityScore;
        task.workloadScore = workloadScore;
        task.status = 'pending';
        task.finalScore = finalScore;
        await task.save();

        // Update user workload and totalAssignedHours
        const user = await User.findById(bestUser._id);
        if (user) {
          user.currentWorkload = Math.min(MAX_WORKLOAD, (user.currentWorkload || 0) + WORKLOAD_INCREMENT);
          user.totalAssignedHours = (user.totalAssignedHours || 0) + (task.estimatedHours || 4);
          await user.save();
        }

        assignments.push({
          task: task.title,
          assignedTo: bestUser.name,
          finalScore,
          estimatedHours: task.estimatedHours,
          difficulty: task.difficulty,
          reason: buildReason(task, bestUser, { skillScore, availabilityScore, workloadScore, timeCapacityScore, taskCountScore, finalScore })
        });
      } else {
        assignments.push({
          task: task.title,
          assignedTo: null,
          finalScore: 0,
          estimatedHours: task.estimatedHours,
          difficulty: task.difficulty,
          reason: 'No eligible member with matching skills found'
        });
      }
    }
  }

  return assignments;
}