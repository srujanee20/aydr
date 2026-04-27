const imagekit = require('../configs/imagekit');
const path = require('path');

const sanitizeFileName = (originalName) => {
    const ext = path.extname(originalName).toLowerCase() || '.jpg';
    const base = path.basename(originalName, ext)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 60);
    return `${base}-${Date.now()}${ext}`;
};

/**
 * Uploads an image buffer to ImageKit.
 *
 * Uses base64 encoding — explicitly supported by the ImageKit Upload API.
 * IK infers the file type from the fileName extension (.jpg / .png / etc.),
 * which is more reliable than toFile() in Node.js where MIME type passthrough
 * is inconsistent and causes files to appear as generic blobs on the dashboard.
 */
const uploadImage = async (fileBuffer, originalName, folder = '/aydr') => {
    const safeName = sanitizeFileName(originalName);

    const result = await imagekit.files.upload({
        file: fileBuffer.toString('base64'),
        fileName: safeName,
        folder: folder,
    });

    return result;
};

module.exports = { uploadImage };
