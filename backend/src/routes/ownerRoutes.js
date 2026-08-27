const express = require('express');
const router = express.Router();
const { getOwnerDashboard } = require('../controllers/ownerController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken, authorizeRoles('STORE_OWNER'));

router.get('/dashboard', getOwnerDashboard);

module.exports = router;
