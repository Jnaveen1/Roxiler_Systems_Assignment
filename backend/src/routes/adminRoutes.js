const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  createUser,
  createStore,
  getUsers,
  getStores,
  getAvailableStoreOwners,
} = require('../controllers/adminController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All admin routes require ADMIN role
router.use(authenticateToken, authorizeRoles('ADMIN'));

router.get('/dashboard-stats', getDashboardStats);
router.post('/users', createUser);
router.get('/users', getUsers);
router.post('/stores', createStore);
router.get('/stores', getStores);
router.get('/available-owners', getAvailableStoreOwners);

module.exports = router;
