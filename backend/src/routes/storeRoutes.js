const express = require('express');
const router = express.Router();
const { getStores, rateStore } = require('../controllers/storeController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

// GET /api/stores - Accessible to authenticated users
router.get('/', getStores);

// POST /api/stores/:storeId/rate - Only NORMAL_USER can submit ratings
router.post('/:storeId/rate', authorizeRoles('NORMAL_USER'), rateStore);

module.exports = router;
