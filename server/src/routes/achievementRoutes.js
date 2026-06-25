const express = require("express");
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {getAchievements} = require('../controllers/achievementController')

router.use(authMiddleware);
router.get('/', getAchievements);

module.exports = router;