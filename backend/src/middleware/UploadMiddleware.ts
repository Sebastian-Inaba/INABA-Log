// upload middleware
import multer, { FileFilterCallback } from 'multer'; // file handler
import { Request } from 'express';
import createHttpError from 'http-errors';

// -------------------- IN TESTING ---------------------------------------------------------------------------------------------- //
// -------------------- IN TESTING ---------------------------------------------------------------------------------------------- //
// -------------------- IN TESTING ---------------------------------------------------------------------------------------------- //

// temporary storage for processing images/PDFs
const imagePdfMemoryStorage = multer.memoryStorage();

export const uploadMiddleware = multer({
    storage: imagePdfMemoryStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

        if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(createHttpError(400, 'Invalid file type'));
        }

        cb(null, true);
    },
});
