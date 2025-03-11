const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { asyncHandler } = require('../utils/errorHandler');
const Logger = require('../utils/logger');
const { sendSuccess } = require('../utils/responseHandler');

// Define the path to the images directory
// Assuming images are stored in a directory called 'images' at the project root
const imagesPath = path.join(process.cwd(), 'public/images');

// Ensure the images directory exists
if (!fs.existsSync(imagesPath)) {
    Logger.warn(`Images directory not found at ${imagesPath}. Creating directory...`);
    fs.mkdirSync(imagesPath, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, imagesPath);
    },
    filename: (req, file, cb) => {
        // If updating an existing file, use the original filename
        if (req.params.filename && req.method === 'PUT') {
            cb(null, req.params.filename);
        } else {
            // For new uploads, create a unique filename with timestamp
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const fileExt = path.extname(file.originalname).toLowerCase();
            cb(null, `${file.fieldname}-${uniqueSuffix}${fileExt}`);
        }
    }
});

// File filter for image types
const fileFilter = (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

// Configure upload settings
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB limit
    }
});

// Get image by filename
router.get('/:filename', asyncHandler(async (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(imagesPath, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
        Logger.error(`Image not found: ${filename}`);
        return res.status(404).json({ error: 'Image not found' });
    }

    // Set content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    const contentTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
    };

    const contentType = contentTypes[ext] || 'application/octet-stream';
    res.set('Content-Type', contentType);

    // Stream the file to the response
    fs.createReadStream(filePath).pipe(res);
}));

// Upload a new image
router.post('/upload', upload.single('image'), asyncHandler(async (req, res) => {
    try {
        if (req.fileValidationError) {
            return res.status(400).json({ error: req.fileValidationError });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'Please upload an image file' });
        }

        Logger.success(`Image uploaded successfully: ${req.file.filename}`);

        // Return success response with file details
        sendSuccess(res, {
            filename: req.file.filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: `/images/${req.file.filename}`
        }, 'Image uploaded successfully', 201);

    } catch (error) {
        Logger.error(`Image upload failed: ${error.message}`);
        res.status(500).json({ error: 'Image upload failed' });
    }
}));

// Update an existing image
router.put('/:filename', upload.single('image'), asyncHandler(async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(imagesPath, filename);

        // Check if file exists before updating
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Image not found' });
        }

        if (req.fileValidationError) {
            return res.status(400).json({ error: req.fileValidationError });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'Please upload an image file' });
        }

        Logger.success(`Image updated successfully: ${filename}`);

        // Return success response
        sendSuccess(res, {
            filename: filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: `/images/${filename}`
        }, 'Image updated successfully');

    } catch (error) {
        Logger.error(`Image update failed: ${error.message}`);
        res.status(500).json({ error: 'Image update failed' });
    }
}));

// Delete an image
router.delete('/:filename', asyncHandler(async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(imagesPath, filename);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Image not found' });
        }

        // Delete the file
        fs.unlinkSync(filePath);

        Logger.success(`Image deleted successfully: ${filename}`);
        sendSuccess(res, { filename }, 'Image deleted successfully');

    } catch (error) {
        Logger.error(`Image deletion failed: ${error.message}`);
        res.status(500).json({ error: 'Image deletion failed' });
    }
}));

// Serve all images from the directory
router.use('/', express.static(imagesPath));

module.exports = router;
