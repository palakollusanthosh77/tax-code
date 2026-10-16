const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const sendResponse = require('../utils/apiResponse');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, organization, designation } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const user = await User.create({ name, email, password, organization, designation });
  const token = generateToken(user._id, user.role);

  sendResponse(res, 201, 'Registration successful', { user: user.toSafeObject(), token });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'This account has been deactivated. Contact an administrator.');
  }

  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user._id, user.role);
  sendResponse(res, 200, 'Login successful', { user: user.toSafeObject(), token });
});

// @desc    Get current logged-in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  sendResponse(res, 200, 'Profile fetched', { user: req.user.toSafeObject() });
});

// @desc    Update current user profile
// @route   PUT /api/auth/me
// @access  Private
const updateMe = asyncHandler(async (req, res) => {
  const { name, organization, designation } = req.body;
  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (organization !== undefined) user.organization = organization;
  if (designation !== undefined) user.designation = designation;

  await user.save();
  sendResponse(res, 200, 'Profile updated', { user: user.toSafeObject() });
});

module.exports = { register, login, getMe, updateMe };
