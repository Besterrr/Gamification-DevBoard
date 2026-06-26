const express = require("express");
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {getActivityStats} = require('../controllers/statsController')

router.use(authMiddleware);
router.get('/activity', getActivityStats);

module.exports = router;