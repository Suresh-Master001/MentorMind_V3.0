import User from '../models/User.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private
export const getUsers = async (req, res, next) => {
  try {
    let users = [];

    if (req.user.role === 'member') {
      users = await User.find({ _id: req.user._id }).select('-password');
    } else if (req.user.role === 'Team Lead') {
      users = await User.find({
        organization: req.user.organization,
        role: 'member'
      }).select('-password');
    } else if (req.user.role === 'admin') {
      users = await User.find({
        organization: req.user.organization
      }).select('-password');
    }

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
    const user = await User.findById(req.params.id).select('-password');
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

// @desc    Update a user's role (admin only)
// @route   PUT /api/users/:id/role
// @access  Private
export const changeUserRole = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can change roles' });
    }

    const { role } = req.body;
    if (!['Team Lead', 'member'].includes(role)) {
      return res.status(400).json({ message: 'Role must be Team Lead or member' });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot change your own role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.organization?.toString() !== req.user.organization?.toString()) {
      return res.status(403).json({ message: 'User is not in your organization' });
    }

    user.role = role;
    await user.save();

    res.json({
      message: 'User role updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};
