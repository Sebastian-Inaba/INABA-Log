import { Request } from 'express';
import sharp from 'sharp';
import createHttpError from 'http-errors';
import { supabase, buckets } from '../config/Storage';

export interface UploadResult {
    publicUrl: string;
    filename: string;
    contentType: string;
}

// Upload file (returns info)
export const uploadFile = async (file: Express.Multer.File, bucketName: keyof typeof buckets): Promise<UploadResult> => {
    if (!file) throw createHttpError(400, 'No file uploaded');

    const { originalname, mimetype, buffer } = file;
    let finalBuffer = buffer;
    let finalName = originalname;
    let contentType = mimetype;

    // Convert images to WebP
    if (mimetype.startsWith('image/')) {
        finalBuffer = await sharp(buffer).webp({ quality: 80 }).toBuffer();
        finalName = originalname.replace(/\.[^/.]+$/, '.webp');
        contentType = 'image/webp';
    }

    if (!buckets[bucketName]) throw createHttpError(400, 'Invalid bucket');

    const { error } = await supabase.storage.from(buckets[bucketName]).upload(finalName, finalBuffer, {
        contentType,
        cacheControl: '3600',
        upsert: true,
    });

    if (error) throw createHttpError(500, error.message);

    const { data } = supabase.storage.from(buckets[bucketName]).getPublicUrl(finalName);

    if (!data?.publicUrl) throw createHttpError(500, 'Failed to get public URL');

    return {
        publicUrl: data.publicUrl,
        filename: finalName,
        contentType,
    };
};

// Remove file from Supabase
export const removeFile = async (bucket: keyof typeof buckets, filename: string) => {
    if (!buckets[bucket]) throw createHttpError(400, 'Invalid bucket');

    const { error } = await supabase.storage.from(buckets[bucket]).remove([filename]);

    if (error) throw createHttpError(500, error.message);
};
