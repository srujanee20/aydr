const multer = require('multer');

// Store file in memory to buffer it directly to ImageKit without touching the disk
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB max file size
    }
});

module.exports = upload;
