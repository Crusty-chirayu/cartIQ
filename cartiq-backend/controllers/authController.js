// c:\Users\chira\cartIQ\cartiq-backend\controllers\authController.js
const User = require("../models/User");
const { generateTokens } = require("../utils/generateToken");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { asyncHandler } = require("../middleware/errorHandlerMiddleware");
const nodemailer = require("nodemailer");

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * @route  POST /api/auth/register
 * @desc   Register new user
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  // Validate
  if (!name || !email || !password) {
    return res.status(400).json(errorResponse("Name, email, and password required", 400));
  }

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json(errorResponse("User already exists", 400));
  }

  // Create user
  const user = await User.create({
    name,
    email,
    passwordHash: password,
    phone,
    role: role || "customer",
  });

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id, user.role);

  // Update refresh token in DB
  user.refreshToken = refreshToken;
  await user.save();

  // Set cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(201).json(
    successResponse({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
    }, "Registration successful", 201)
  );
});

/**
 * @route  POST /api/auth/login
 * @desc   Login user
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json(errorResponse("Email and password required", 400));
  }

  const user = await User.findOne({ email }).select("+passwordHash");

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json(errorResponse("Invalid credentials", 401));
  }

  if (user.isBanned) {
    return res.status(403).json(errorResponse("Account suspended", 403));
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id, user.role);

  // Update last login
  user.lastLoginAt = new Date();
  user.refreshToken = refreshToken;
  await user.save();

  // Set cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json(
    successResponse({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
    }, "Login successful")
  );
});

/**
 * @route  POST /api/auth/refresh
 * @desc   Refresh access token
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.cookies;

  if (!token) {
    return res.status(401).json(errorResponse("No refresh token", 401));
  }

  const decoded = require("../utils/generateToken").verifyRefreshToken(token);
  const user = await User.findById(decoded.id);

  if (!user || user.refreshToken !== token) {
    return res.status(401).json(errorResponse("Invalid refresh token", 401));
  }

  const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id, user.role);

  user.refreshToken = newRefreshToken;
  await user.save();

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json(successResponse({ accessToken }, "Token refreshed"));
});

/**
 * @route  POST /api/auth/logout
 * @desc   Logout user
 */
const logout = asyncHandler(async (req, res) => {
  const user = req.user;
  user.refreshToken = null;
  await user.save();

  res.clearCookie("refreshToken");
  res.json(successResponse(null, "Logged out successfully"));
});

/**
 * @route  GET /api/auth/profile
 * @desc   Get user profile
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json(successResponse(user));
});

/**
 * @route  PATCH /api/auth/profile
 * @desc   Update user profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, avatar },
    { new: true, runValidators: true }
  );

  res.json(successResponse(user, "Profile updated"));
});

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
};