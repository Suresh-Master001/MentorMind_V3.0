import User from '../models/User.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user's profile (skills only for members)
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, skills, workingHoursPerDay, maxTasksPerDay } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name !== undefined) user.name = name;
    if (skills !== undefined) user.skills = skills;
    if (workingHoursPerDay !== undefined) user.workingHoursPerDay = workingHoursPerDay;
    if (maxTasksPerDay !== undefined) user.maxTasksPerDay = maxTasksPerDay;

    const updated = await user.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};
