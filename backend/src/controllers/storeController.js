const prisma = require('../config/prisma');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { rateStoreSchema } = require('../utils/validationSchemas');

const getStores = async (req, res, next) => {
  try {
    const { name = '', address = '', sortBy = 'name', sortOrder = 'asc' } = req.query;
    const userId = req.user?.id;

    const where = {};

    if (name.trim()) {
      where.name = { contains: name.trim(), mode: 'insensitive' };
    }

    if (address.trim()) {
      where.address = { contains: address.trim(), mode: 'insensitive' };
    }

    const stores = await prisma.store.findMany({
      where,
      include: {
        ratings: {
          select: {
            id: true,
            value: true,
            userId: true,
          },
        },
      },
    });

    let formattedStores = stores.map((store) => {
      const totalRatingsCount = store.ratings.length;
      const overallRating =
        totalRatingsCount > 0
          ? Number((store.ratings.reduce((sum, r) => sum + r.value, 0) / totalRatingsCount).toFixed(1))
          : null;

      // Find current user's rating if logged in as NORMAL_USER
      const userRatingObj = userId ? store.ratings.find((r) => r.userId === userId) : null;
      const userSubmittedRating = userRatingObj ? userRatingObj.value : null;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        overallRating,
        totalRatingsCount,
        userSubmittedRating,
      };
    });

    // Sorting logic
    const isDesc = sortOrder.toLowerCase() === 'desc';
    if (sortBy === 'overallRating') {
      formattedStores.sort((a, b) => {
        const ratingA = a.overallRating ?? -1;
        const ratingB = b.overallRating ?? -1;
        return isDesc ? ratingB - ratingA : ratingA - ratingB;
      });
    } else {
      formattedStores.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        if (nameA < nameB) return isDesc ? 1 : -1;
        if (nameA > nameB) return isDesc ? -1 : 1;
        return 0;
      });
    }

    return sendSuccess(res, 200, { stores: formattedStores });
  } catch (error) {
    next(error);
  }
};

const rateStore = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const userId = req.user.id;
    const validated = rateStoreSchema.parse(req.body);

    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      return sendError(res, 404, 'Store not found');
    }

    // Upsert rating using unique constraint (userId, storeId)
    const rating = await prisma.rating.upsert({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
      update: {
        value: validated.value,
      },
      create: {
        userId,
        storeId,
        value: validated.value,
      },
    });

    // Recalculate store overall rating
    const allRatings = await prisma.rating.findMany({
      where: { storeId },
      select: { value: true },
    });

    const totalRatingsCount = allRatings.length;
    const overallRating =
      totalRatingsCount > 0
        ? Number((allRatings.reduce((sum, r) => sum + r.value, 0) / totalRatingsCount).toFixed(1))
        : null;

    return sendSuccess(
      res,
      200,
      {
        rating,
        overallRating,
        totalRatingsCount,
        userSubmittedRating: rating.value,
      },
      'Rating saved successfully'
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStores,
  rateStore,
};
