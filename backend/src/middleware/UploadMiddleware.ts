// upload middleware
import multer, { FileFilterCallback, Multer } from 'multer'; // file handler
import { Request } from 'express';
import createHttpError from 'http-errors';

// temporary storage for processing images/PDFs
const imagePdfMemoryStorage = multer.memoryStorage();

const uploadMiddleware: Multer = multer({
    storage: imagePdfMemoryStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(createHttpError(400, 'Invalid file type'));
        }
        cb(null, true);
    },
});

export default uploadMiddleware;
