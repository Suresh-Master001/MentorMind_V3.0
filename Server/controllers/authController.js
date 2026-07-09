import User from '../models/User.js';
import Organization from '../models/Organization.js';
import { generateToken } from '../middleware/authMiddleware.js';
import { validationResult } from 'express-validator';

// @desc    Register a new member user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, skills, teamName, companyName, role } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'member',
      skills: skills || [],
      teamName: teamName || '',
      companyName: companyName || ''
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      skills: user.skills,
      companyName: user.companyName,
      teamName: user.teamName,
      availability: user.availability,
      currentWorkload: user.currentWorkload,
      token: generateToken(user._id)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user and return JWT
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      skills: user.skills,
      availability: user.availability,
      currentWorkload: user.currentWorkload,
      token: generateToken(user._id)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged-in user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      skills: user.skills,
      availability: user.availability,
      currentWorkload: user.currentWorkload,
      createdAt: user.createdAt
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a hidden admin account and organization
// @route   POST /api/auth/org/setup
// @access  Public
export const orgSetup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, companyName, companyEmail, description } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const existingOrg = await Organization.findOne({ email: companyEmail.toLowerCase() });
    if (existingOrg) {
      return res.status(400).json({ message: 'Organization already exists with this email' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'admin',
      skills: ['management', 'administration'],
      companyName: companyName || '',
      teamName: 'Management'
    });

    const organization = await Organization.create({
      name: companyName,
      email: companyEmail.toLowerCase(),
      description: description || '',
      createdBy: user._id,
      members: [user._id]
    });

    user.organization = organization._id;
    await user.save();

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      skills: user.skills,
      companyName: user.companyName,
      teamName: user.teamName,
      organization: {
        _id: organization._id,
        name: organization.name,
        email: organization.email
      },
      availability: user.availability,
      currentWorkload: user.currentWorkload,
      token: generateToken(user._id)
    });
  } catch (error) {
    next(error);
  }
};
