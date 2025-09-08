// admin controller
import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { Post, IPost } from '../models/PostModel';
import { Research, IResearch } from '../models/ResearchModel';
import { uploadFile, removeFile, UploadResult } from '../controllers/UploadController';

// -------------------- POSTS -------------------------------------------------------------------- //

// Create Post
export const createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, content, category, tags, featured, author, description } = req.body;
        let featuredImage = '';

        if (req.file) {
            const uploaded: UploadResult = await uploadFile(req);
            featuredImage = uploaded.publicUrl;
        }

        const newPost = await Post.create({
            title,
            author: author || '',
            description: description || '',
            content,
            category,
            tags: tags || [],
            featured: !!featured,
            featuredImage,
        });

        res.status(201).json({ success: true, post: newPost });
    } catch (err) {
        next(err);
    }
};

// Update Post
export const updatePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { title, content, category, tags, featured, author, description, oldFilename } = req.body;

        const post: IPost | null = await Post.findById(id);
        if (!post) throw createHttpError(404, 'Post not found');

        if (req.file) {
            if (oldFilename) {
                await removeFile('posts', oldFilename);
            }
            const uploaded: UploadResult = await uploadFile(req);
            post.featuredImage = uploaded.publicUrl;
        }

        if (title) post.title = title;
        post.content = content || post.content;
        post.category = category || post.category;
        post.tags = tags || post.tags;
        post.featured = featured !== undefined ? featured : post.featured;
        post.author = author || post.author;
        post.description = description || post.description;

        await post.save();

        res.status(200).json({ success: true, post });
    } catch (err) {
        next(err);
    }
};

// Delete Post
export const deletePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const post = await Post.findById(id);
        if (!post) throw createHttpError(404, 'Post not found');

        if (post.featuredImage) {
            const filename = post.featuredImage.split('/').pop()!;
            await removeFile('posts', filename);
        }

        await Post.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: 'Post deleted' });
    } catch (err) {
        next(err);
    }
};

// -------------------- RESEARCH -------------------------------------------------------------------------- //

// Create Research
export const createResearch = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, author, abstract, introduction, method, keyFindings, credibility, content, references, tags, featured } = req.body;

        let featuredImage = '';

        if (req.file) {
            const uploaded: UploadResult = await uploadFile(req);
            featuredImage = uploaded.publicUrl;
        }

        const newResearch = await Research.create({
            title,
            author,
            abstract,
            introduction: introduction || '',
            method: method || '',
            keyFindings: keyFindings || '',
            credibility: credibility || '',
            content,
            references: references || [],
            tags: tags || [],
            featuredImage,
            attachments: [],
            featured: !!featured,
        });

        res.status(201).json({ success: true, research: newResearch });
    } catch (err) {
        next(err);
    }
};

// Update Research
export const updateResearch = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const {
            title,
            author,
            abstract,
            introduction,
            method,
            keyFindings,
            credibility,
            content,
            references,
            tags,
            featured,
            oldFilename,
        } = req.body;

        const research: IResearch | null = await Research.findById(id);
        if (!research) throw createHttpError(404, 'Research not found');

        if (req.file) {
            if (oldFilename) {
                await removeFile('research', oldFilename);
            }
            const uploaded: UploadResult = await uploadFile(req);
            research.featuredImage = uploaded.publicUrl;
        }

        if (title) research.title = title; // slug auto-generated in model
        research.author = author || research.author;
        research.abstract = abstract || research.abstract;
        research.introduction = introduction || research.introduction;
        research.method = method || research.method;
        research.keyFindings = keyFindings || research.keyFindings;
        research.credibility = credibility || research.credibility;
        research.content = content || research.content;
        research.references = references || research.references;
        research.tags = tags || research.tags;
        research.featured = featured !== undefined ? featured : research.featured;

        await research.save();

        res.status(200).json({ success: true, research });
    } catch (err) {
        next(err);
    }
};

// Delete Research
export const deleteResearch = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const research = await Research.findById(id);
        if (!research) throw createHttpError(404, 'Research not found');

        if (research.featuredImage) {
            const filename = research.featuredImage.split('/').pop()!;
            await removeFile('research', filename);
        }

        await Research.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: 'Research deleted' });
    } catch (err) {
        next(err);
    }
};
