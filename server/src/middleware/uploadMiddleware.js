const multer = require("multer");
const path = require("path");

const storageAvatar = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../uploads/avatars/'))
    },
    filename: function (req, file, cb) {
        const userId = req.user.id;
        cb(null, userId + '_' + Date.now() + path.extname(file.originalname))
    },
})

const storageAttachment = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../uploads/attachments/'))
    },
    filename: function (req, file, cb) {
        cb(null, Date.now()+ '_' + file.originalname.replace(/\s/g, '_'))
    }
})

const fileFilter = function (req, file, cb) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const uploadAvatar = multer({
    storage: storageAvatar,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }
})

const uploadAttachment = multer({
    storage: storageAttachment,
    limits: { fileSize: 10 * 1024 * 1024 }
})

module.exports = {uploadAvatar, uploadAttachment}