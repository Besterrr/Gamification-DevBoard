const {register, login, refresh, getUserData} = require('../controllers/authController')
const authMiddleware = require('../middleware/authMiddleware');

const router = require('express').Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.get('/me', authMiddleware, getUserData);

module.exports = router;