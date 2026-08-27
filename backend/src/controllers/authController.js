const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { signupSchema, loginSchema, updatePasswordSchema } = require('../utils/validationSchemas');

const signup = async (req, res, next) => {
  try {
    const validated = signupSchema.parse(req.body);
    const emailClean = validated.email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: emailClean },
    });

    if (existingUser) {
      return sendError(res, 400, 'An account with this email address already exists');
    }

    const hashedPassword = await bcrypt.hash(validated.password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: validated.name.trim(),
        email: emailClean,
        password: hashedPassword,
        address: validated.address.trim(),
        role: 'NORMAL_USER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
      },
    });

    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    return sendSuccess(res, 201, { user: newUser, token }, 'Account created successfully');
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const validated = loginSchema.parse(req.body);
    const emailClean = validated.email.toLowerCase().trim();
    const passwordClean = validated.password.trim();

    const user = await prisma.user.findUnique({
      where: { email: emailClean },
    });

    if (!user) {
      return sendError(res, 401, 'Invalid email or password');
    }

    const isMatch = await bcrypt.compare(passwordClean, user.password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password');
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    const sanitizedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
      createdAt: user.createdAt,
    };

    return sendSuccess(res, 200, { user: sanitizedUser, token }, 'Logged in successfully');
  } catch (error) {
    next(error);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    const validated = updatePasswordSchema.parse(req.body);
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    const isMatch = await bcrypt.compare(validated.oldPassword, user.password);
    if (!isMatch) {
      return sendError(res, 400, 'Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(validated.newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return sendSuccess(res, 200, {}, 'Password updated successfully');
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    return sendSuccess(res, 200, { user: req.user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  updatePassword,
  getMe,
};
