// c:\Users\chira\cartIQ\cartiq-backend\controllers\authController.js
const { z } = require("zod");
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

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name too long").trim(),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  role: z.enum(["customer", "seller"]).optional().default("customer"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password required"),
});

const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).trim().optional(),
  phone: z.string().optional(),
  avatar: z.string().url("Invalid avatar URL").optional(),
});

/**
 * @route  POST /api/auth/register
 * @desc   Register new user with validation
 */
const register = asyncHandler(async (req, res) => {
  // Validate input
  const validated = registerSchema.parse(req.body);
  const { name, email, password, phone, role } = validated;

  // Check if user exists
  const userExists = await User.findOne({ email: email.toLowerCase() });
  if (userExists) {
    return res.status(409).json(errorResponse("Email already registered", 409));
  }

  // Create user (password will be hashed by pre-save hook)
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash: password,
    phone: phone || "",
    role: role || "customer",
  });

  // If registering as seller, create KYC request
  if (role === "seller") {
    const KYC = require("../models/KYC");
    await KYC.create({
      seller: user._id,
      status: "not_submitted",
      businessName: name,
      businessType: "individual",
      panNumber: "",
      documents: [],
    });
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id, user.role);

  // Update refresh token in DB
  user.refreshToken = refreshToken;
  await user.save();

  // Set cookies
  res.cookie("accessToken", accessToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json(
    successResponse({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: accessToken,
      refreshToken,
    }, "Registration successful", 201)
  );
});

/**
 * @route  POST /api/auth/login
 * @desc   Login user
 */
const login = asyncHandler(async (req, res) => {
  const validated = loginSchema.parse(req.body);
  const { email, password } = validated;

  const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json(errorResponse("Invalid email or password", 401));
  }

  if (user.isBanned) {
    return res.status(403).json(errorResponse("Account has been suspended. Contact support.", 403));
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id, user.role);

  // Update last login
  user.lastLoginAt = new Date();
  user.refreshToken = refreshToken;
  await user.save();

  // Set cookies
  res.cookie("accessToken", accessToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 1000,
  });

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
      token: accessToken,
      refreshToken,
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
    return res.status(401).json(errorResponse("No refresh token provided", 401));
  }

  const decoded = require("../utils/generateToken").verifyRefreshToken(token);
  const user = await User.findById(decoded.id);

  if (!user || user.refreshToken !== token) {
    return res.status(401).json(errorResponse("Invalid or expired refresh token", 401));
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
  res.clearCookie("accessToken");
  res.json(successResponse(null, "Logged out successfully"));
});

/**
 * @route  GET /api/auth/profile
 * @desc   Get user profile
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-passwordHash -refreshToken");
  res.json(successResponse(user));
});

/**
 * @route  PATCH /api/auth/profile
 * @desc   Update user profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const validated = updateProfileSchema.parse(req.body);

  const user = await User.findByIdAndUpdate(
    req.user._id,
    validated,
    { new: true, runValidators: true }
  ).select("-passwordHash -refreshToken");

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