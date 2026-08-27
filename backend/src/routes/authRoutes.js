const express = require('express');
const router = express.Router();
const { signup, login, updatePassword, getMe } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/signup', signup);
router.post('/login', login);
router.patch('/update-password', authenticateToken, updatePassword);
router.get('/me', authenticateToken, getMe);

module.exports = router;
