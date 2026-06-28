const express = require("express");
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {uploadTheAttachment, getAttachments} = require('../controllers/attachmentController')
const {uploadAttachment} = require('../middleware/uploadMiddleware')

router.use(authMiddleware);

router.post('/tasks/:id/attachments',uploadAttachment.single('file'), uploadTheAttachment);
router.get('/tasks/:id/attachments', getAttachments);

module.exports = router;