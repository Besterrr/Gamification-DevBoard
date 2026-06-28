const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { uploadAvatar } = require('../middleware/uploadMiddleware');
const {uploadTheAvatar} = require("../controllers/userController");

router.use(authMiddleware);
router.post('/avatar', uploadAvatar.single('file'), uploadTheAvatar);

module.exports = router;