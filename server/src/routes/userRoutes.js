const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');
const {uploadAvatar} = require("../controllers/userController");

router.use(authMiddleware);

router.post('/avatar',uploadMiddleware, uploadAvatar);

module.exports = router;