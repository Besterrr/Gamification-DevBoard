const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../uploads/avatars/'))
    },
    filename: function (req, file, cb) {
        const userId = req.user.id;
        cb(null, userId + '_' + Date.now() + path.extname(file.originalname))
    },
})

const fileFilter = function (req, file, cb) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }
})

module.exports = upload.single('avatar');