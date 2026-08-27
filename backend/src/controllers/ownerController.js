const prisma = require('../config/prisma');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const getOwnerDashboard = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    // Find the store owned by this authenticated user
    const store = await prisma.store.findUnique({
      where: { ownerId },
      include: {
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                address: true,
              },
            },
          },
          orderBy: { updatedAt: 'desc' },
        },
      },
    });

    if (!store) {
      return sendError(
        res,
        404,
        'No store is currently assigned to your account. Please contact an Administrator.'
      );
    }

    const totalRatings = store.ratings.length;
    const averageRating =
      totalRatings > 0
        ? Number((store.ratings.reduce((sum, r) => sum + r.value, 0) / totalRatings).toFixed(1))
        : null;

    // Rating breakdown (distribution from 1 to 5 stars)
    const ratingDistribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    store.ratings.forEach((r) => {
      if (ratingDistribution[r.value] !== undefined) {
        ratingDistribution[r.value] += 1;
      }
    });

    // Customer rating history
    const customerRatings = store.ratings.map((r) => ({
      ratingId: r.id,
      value: r.value,
      updatedAt: r.updatedAt,
      user: {
        id: r.user.id,
        name: r.user.name,
        email: r.user.email,
        address: r.user.address,
      },
    }));

    const storeDetails = {
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address,
      createdAt: store.createdAt,
    };

    return sendSuccess(res, 200, {
      store: storeDetails,
      averageRating,
      totalRatings,
      ratingDistribution,
      customerRatings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOwnerDashboard,
};
