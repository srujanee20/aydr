const uploadService = require('../../services/upload.service');

const uploadSingleImage = async (req, res, next) => {
    try {
        if (!req.file) {
            const err = new Error('No file uploaded');
            err.statusCode = 400;
            return next(err);
        }

        const folderPath = req.body.folder ? `/aydr/${req.body.folder}` : '/aydr/general';
        const result = await uploadService.uploadImage(req.file.buffer, req.file.originalname, folderPath);

        // Construct URL from our env endpoint + the actual media library path (result.filePath).
        // We do NOT use result.url because it is built by the IK SDK using the URL endpoint
        // configured in the ImageKit account dashboard (which includes /aydr), causing a
        // double /aydr/aydr path. result.filePath always reflects the true storage path.
        const baseUrl = (process.env.IMAGEKIT_URL_ENDPOINT || '').replace(/\/$/, '');
        const fileUrl = `${baseUrl}${result.filePath}`;

        res.status(200).json({
            message: 'Image uploaded successfully',
            url: fileUrl,
            fileId: result.fileId
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { uploadSingleImage };
