import Organization from '../models/Organization.js';
import { validationResult } from 'express-validator';

export const createOrganization = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, description } = req.body;

    const existingOrg = await Organization.findOne({ email });
    if (existingOrg) {
      return res.status(400).json({ message: 'Organization already exists with this email' });
    }

    const organization = await Organization.create({
      name,
      email,
      description
    });

    res.status(201).json(organization);
  } catch (error) {
    next(error);
  }
};

export const getOrganizations = async (req, res, next) => {
  try {
    const organizations = await Organization.find({});
    res.json(organizations);
  } catch (error) {
    next(error);
  }
};

export const getOrganizationById = async (req, res, next) => {
  try {
    const organization = await Organization.findById(req.params.id)
      .populate('members', 'name email role skills')
      .populate('projects', 'title status deadline');

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    res.json(organization);
  } catch (error) {
    next(error);
  }
};

export const addMember = async (req, res, next) => {
  try {
    const organization = await Organization.findById(req.params.id);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const { userId } = req.body;
    if (!organization.members.includes(userId)) {
      organization.members.push(userId);
      await organization.save();
    }

    res.json(organization);
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const organization = await Organization.findById(req.params.id);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const { userId } = req.body;
    organization.members = organization.members.filter(m => m.toString() !== userId);
    await organization.save();

    res.json(organization);
  } catch (error) {
    next(error);
  }
};