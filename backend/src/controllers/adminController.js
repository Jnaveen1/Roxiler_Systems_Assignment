const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { createUserAdminSchema, createStoreSchema } = require('../utils/validationSchemas');

const getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count(),
    ]);

    return sendSuccess(res, 200, {
      totalUsers,
      totalStores,
      totalRatings,
    });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const validated = createUserAdminSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email.toLowerCase() },
    });

    if (existingUser) {
      return sendError(res, 400, 'User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(validated.password, 10);

    const user = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email.toLowerCase(),
        password: hashedPassword,
        address: validated.address,
        role: validated.role,
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

    return sendSuccess(res, 201, { user }, 'User created successfully');
  } catch (error) {
    next(error);
  }
};

const createStore = async (req, res, next) => {
  try {
    const validated = createStoreSchema.parse(req.body);

    // Verify owner exists and has role STORE_OWNER
    const owner = await prisma.user.findUnique({
      where: { id: validated.ownerId },
      include: { ownedStore: true },
    });

    if (!owner) {
      return sendError(res, 404, 'Selected store owner user does not exist');
    }

    if (owner.role !== 'STORE_OWNER') {
      return sendError(res, 400, 'The assigned user does not have the STORE_OWNER role');
    }

    if (owner.ownedStore) {
      return sendError(res, 400, 'This store owner is already assigned to another store');
    }

    // Verify store email uniqueness
    const existingStoreEmail = await prisma.store.findUnique({
      where: { email: validated.email.toLowerCase() },
    });

    if (existingStoreEmail) {
      return sendError(res, 400, 'A store with this email already exists');
    }

    const store = await prisma.store.create({
      data: {
        name: validated.name,
        email: validated.email.toLowerCase(),
        address: validated.address,
        ownerId: validated.ownerId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return sendSuccess(res, 201, { store }, 'Store created and owner assigned successfully');
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const { search = '', role, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Allowed sort fields
    const allowedSortFields = ['name', 'email', 'role', 'createdAt'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const validSortOrder = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

    // Where clause
    const where = {};

    if (role && ['ADMIN', 'NORMAL_USER', 'STORE_OWNER'].includes(role.toUpperCase())) {
      where.role = role.toUpperCase();
    }

    if (search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { email: { contains: search.trim(), mode: 'insensitive' } },
        { address: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          address: true,
          role: true,
          createdAt: true,
          ownedStore: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { [validSortBy]: validSortOrder },
        skip,
        take: limitNum,
      }),
    ]);

    return sendSuccess(res, 200, {
      users,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getStores = async (req, res, next) => {
  try {
    const { search = '', sortBy = 'name', sortOrder = 'asc' } = req.query;

    const allowedSortFields = ['name', 'email', 'createdAt'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'name';
    const validSortOrder = sortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc';

    const where = {};
    if (search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { address: { contains: search.trim(), mode: 'insensitive' } },
        { email: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const stores = await prisma.store.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ratings: {
          select: {
            value: true,
          },
        },
      },
      orderBy: { [validSortBy]: validSortOrder },
    });

    const formattedStores = stores.map((store) => {
      const totalRatingsCount = store.ratings.length;
      const overallRating =
        totalRatingsCount > 0
          ? Number((store.ratings.reduce((sum, r) => sum + r.value, 0) / totalRatingsCount).toFixed(1))
          : null;

      const { ratings, ...storeData } = store;

      return {
        ...storeData,
        overallRating,
        totalRatingsCount,
      };
    });

    // If client requested sort by overallRating
    if (sortBy === 'overallRating') {
      formattedStores.sort((a, b) => {
        const ratingA = a.overallRating ?? -1;
        const ratingB = b.overallRating ?? -1;
        return validSortOrder === 'asc' ? ratingA - ratingB : ratingB - ratingA;
      });
    }

    return sendSuccess(res, 200, { stores: formattedStores });
  } catch (error) {
    next(error);
  }
};

const getAvailableStoreOwners = async (req, res, next) => {
  try {
    // Find all users with role STORE_OWNER who do not have an assigned store yet
    const unassignedOwners = await prisma.user.findMany({
      where: {
        role: 'STORE_OWNER',
        ownedStore: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return sendSuccess(res, 200, { owners: unassignedOwners });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  createUser,
  createStore,
  getUsers,
  getStores,
  getAvailableStoreOwners,
};
