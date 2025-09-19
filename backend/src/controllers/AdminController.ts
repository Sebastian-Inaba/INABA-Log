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
        // Parse tags if sent as JSON string
        const parsedTags = tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [];
        let featuredImage: string | null = null;

        if (req.file) {
            const uploaded: UploadResult = await uploadFile(req.file, 'posts');
            featuredImage = uploaded.publicUrl;
        }

        const newPost = await Post.create({
            title,
            author: author || '',
            description: description || '',
            content,
            category,
            tags: parsedTags,
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
        const { title, content, category, tags, featured, author, description } = req.body;

        const post: IPost | null = await Post.findById(id);
        if (!post) throw createHttpError(404, 'Post not found');

        if (req.file) {
            // Replace image
            console.log('Old featured image (full URL):', post.featuredImage);

            if (post.featuredImage) {
                const urlParts = post.featuredImage.split('/');
                const encodedFilename = urlParts.pop()!;
                const filename = decodeURIComponent(encodedFilename); // ✅ decode URL
                console.log('Deleting old file from bucket:', filename);
                await removeFile('posts', filename);
            }

            const uploaded: UploadResult = await uploadFile(req.file, 'posts');
            console.log('Uploaded new file:', uploaded.filename, 'Public URL:', uploaded.publicUrl);

            post.featuredImage = uploaded.filename;
        } else if (req.body.removeImage === 'true') {
            // Delete only
            if (post.featuredImage) {
                const urlParts = post.featuredImage.split('/');
                const encodedFilename = urlParts.pop()!;
                const filename = decodeURIComponent(encodedFilename);
                console.log('Deleting image without replacement:', filename);
                await removeFile('posts', filename);
                post.featuredImage = null;
            }
        } else {
            // No change
            console.log('No image uploaded and no delete requested — keeping current image');
        }

        if (title) post.title = title;
        post.content = content || post.content;
        post.category = category || post.category;
        post.tags = tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : post.tags;
        if (featured !== undefined) post.featured = featured === true || featured === 'true';
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
            const urlParts = post.featuredImage.split('/');
            const encodedFilename = urlParts.pop()!;
            const filename = decodeURIComponent(encodedFilename);

            console.log('Deleting featured image from bucket:', filename);
            await removeFile('posts', filename);

            post.featuredImage = null;
        } else {
            console.log('No featured image to delete');
        }

        await Post.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: 'Post deleted' });
    } catch (err) {
        next(err);
    }
};

// Get Post
export const getPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const post = await Post.findById(id);
        if (!post) throw createHttpError(404, 'Post not found');
        res.status(200).json(post);
    } catch (err) {
        next(err);
    }
};

// -------------------- RESEARCH -------------------------------------------------------------------------- //

// Create Research
export const createResearch = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, author, abstract, introduction, method, keyFindings, credibility, content, references, tags, featured } = req.body;

        const parsedTags = tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [];
        const parsedReferences = references ? (Array.isArray(references) ? references : JSON.parse(references)) : [];

        let featuredImage: string | null = null;
        let pdfAttachment: string | null = null;

        // Handle featured image
        if (req.files && (req.files as any).featuredImage?.length) {
            const imageFile = (req.files as any).featuredImage[0];
            const uploadedImage: UploadResult = await uploadFile(imageFile, 'research');
            featuredImage = uploadedImage.publicUrl;
        }

        // Handle PDF attachment
        if (req.files && (req.files as any).pdfAttachment?.length) {
            const pdfFile = (req.files as any).pdfAttachment[0];
            const uploadedPdf: UploadResult = await uploadFile(pdfFile, 'attachments');
            pdfAttachment = uploadedPdf.publicUrl;
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
            references: parsedReferences,
            tags: parsedTags,
            featuredImage,
            pdfAttachment,
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
            removeImage,
            removePdf,
        } = req.body;

        const research: IResearch | null = await Research.findById(id);
        if (!research) throw createHttpError(404, 'Research not found');

        // Handle featured image update
        if (req.files && (req.files as any).featuredImage?.length) {
            if (research.featuredImage) {
                const oldFile = decodeURIComponent(research.featuredImage.split('/').pop()!);
                console.log('Deleting old research image:', oldFile);
                await removeFile('research', oldFile);
            }

            const imageFile = (req.files as any).featuredImage[0];
            const uploadedImage: UploadResult = await uploadFile(imageFile, 'research');
            console.log('Uploaded new research image:', uploadedImage.filename, uploadedImage.publicUrl);

            research.featuredImage = uploadedImage.publicUrl;
        } else if (removeImage === 'true' && research.featuredImage) {
            const oldFile = decodeURIComponent(research.featuredImage.split('/').pop()!);
            console.log('Deleting research image only:', oldFile);
            await removeFile('research', oldFile);
            research.featuredImage = null;
        } else {
            console.log('No new image uploaded and no delete requested');
        }

        // Handle PDF attachment update
        if (req.files && (req.files as any).pdfAttachment?.length) {
            if (research.pdfAttachment) {
                const oldPdf = decodeURIComponent(research.pdfAttachment.split('/').pop()!);
                console.log('Deleting old PDF attachment:', oldPdf);
                await removeFile('attachments', oldPdf);
            }

            const pdfFile = (req.files as any).pdfAttachment[0];
            const uploadedPdf: UploadResult = await uploadFile(pdfFile, 'attachments');
            console.log('Uploaded new PDF attachment:', uploadedPdf.filename, uploadedPdf.publicUrl);

            research.pdfAttachment = uploadedPdf.publicUrl;
        } else if (removePdf === 'true' && research.pdfAttachment) {
            const oldPdf = decodeURIComponent(research.pdfAttachment.split('/').pop()!);
            console.log('Deleting PDF attachment only:', oldPdf);
            await removeFile('attachments', oldPdf);
            research.pdfAttachment = null;
        } else {
            console.log('No new PDF uploaded and no delete requested');
        }

        const parsedTags = tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [];
        const parsedReferences = references ? (Array.isArray(references) ? references : JSON.parse(references)) : [];

        if (title) research.title = title;
        research.author = author || research.author;
        research.abstract = abstract || research.abstract;
        research.introduction = introduction || research.introduction;
        research.method = method || research.method;
        research.keyFindings = keyFindings || research.keyFindings;
        research.credibility = credibility || research.credibility;
        research.content = content || research.content;
        research.references = parsedReferences;
        research.tags = parsedTags;
        if (featured !== undefined) research.featured = featured === true || featured === 'true';

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

        // Delete featured image
        if (research.featuredImage) {
            const urlParts = research.featuredImage.split('/');
            const encodedFilename = urlParts.pop()!;
            const filename = decodeURIComponent(encodedFilename);
            console.log('Deleting research image from bucket:', filename);
            await removeFile('research', filename);
            research.featuredImage = null;
        } else {
            console.log('No research image to delete');
        }

        // Delete PDF attachment
        if (research.pdfAttachment) {
            const urlParts = research.pdfAttachment.split('/');
            const encodedFilename = urlParts.pop()!;
            const filename = decodeURIComponent(encodedFilename);
            console.log('Deleting PDF attachment from bucket:', filename);
            await removeFile('attachments', filename);
            research.pdfAttachment = null;
        } else {
            console.log('No PDF attachment to delete');
        }

        await Research.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: 'Research deleted' });
    } catch (err) {
        next(err);
    }
};

// Get Research
export const getResearch = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const research = await Research.findById(id);
        if (!research) throw createHttpError(404, 'Research not found');
        res.status(200).json(research);
    } catch (err) {
        next(err);
    }
};

// -------------------- RESEARCH AND POSTS(custom getall for admin panel) ---------------------------------------------------------- //

// Get all content (both posts and research)
export const getAllContent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            type, // 'post', 'research', or 'all'
            tag,
            category,
            author,
            featured,
            dateFilter,
            limit = 10,
            page = 1,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = req.query;

        // Validate type parameter
        const contentType = type === 'research' ? 'research' : type === 'post' ? 'post' : 'all';

        // Build base filter
        const filter: any = {};

        if (tag) filter.tags = { $in: [tag] };
        if (author) filter.author = author;
        if (featured === 'true') filter.featured = true;
        if (featured === 'false') filter.featured = false;

        // Type-specific filters
        if (contentType === 'post' && category) {
            filter.category = category;
        }

        // Date filtering
        const now = new Date();
        if (dateFilter) {
            filter.createdAt = {};

            switch (dateFilter) {
                case 'newest':
                    filter.createdAt.$gte = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    break;
                case 'week':
                    filter.createdAt.$gte = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    filter.createdAt.$gte = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                case 'year':
                    filter.createdAt.$gte = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                    break;
                case 'older':
                    filter.createdAt.$lt = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                    break;
            }
        }

        const skip = (Number(page) - 1) * Number(limit);
        const sortOption: any = { [sortBy as string]: sortOrder === 'desc' ? -1 : 1 };

        let results: any = {};

        if (contentType === 'all') {
            // Get both posts and research
            const [posts, research] = await Promise.all([
                Post.find(filter)
                    .sort(sortOption)
                    .skip(skip)
                    .limit(Number(limit))
                    .select('title slug author description category tags featuredImage featured createdAt updatedAt')
                    .lean(),
                Research.find(filter)
                    .sort(sortOption)
                    .skip(skip)
                    .limit(Number(limit))
                    .select('title slug author abstract tags featuredImage featured attachments createdAt updatedAt')
                    .lean(),
            ]);

            const [totalPosts, totalResearch] = await Promise.all([Post.countDocuments(filter), Research.countDocuments(filter)]);

            results = {
                posts,
                research,
                totals: {
                    posts: totalPosts,
                    research: totalResearch,
                    combined: totalPosts + totalResearch,
                },
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    pages: {
                        posts: Math.ceil(totalPosts / Number(limit)),
                        research: Math.ceil(totalResearch / Number(limit)),
                    },
                },
            };
        } else if (contentType === 'post') {
            // Get only posts
            const posts = await Post.find(filter)
                .sort(sortOption)
                .skip(skip)
                .limit(Number(limit))
                .select('title slug author description category tags featuredImage featured createdAt updatedAt')
                .lean();

            const total = await Post.countDocuments(filter);

            results = {
                posts,
                totals: { posts: total },
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / Number(limit)),
                },
            };
        } else {
            // Get only research
            const research = await Research.find(filter)
                .sort(sortOption)
                .skip(skip)
                .limit(Number(limit))
                .select('title slug author abstract tags featuredImage featured attachments createdAt updatedAt')
                .lean();

            const total = await Research.countDocuments(filter);

            results = {
                research,
                totals: { research: total },
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / Number(limit)),
                },
            };
        }

        res.status(200).json({
            success: true,
            ...results,
        });
    } catch (err) {
        next(err);
    }
};

// Get content statistics for admin dashboard
export const getContentStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get counts by different criteria
        const [
            totalPosts,
            totalResearch,
            featuredPosts,
            featuredResearch,
            postsThisMonth,
            researchThisMonth,
            postsByCategory,
            researchByTag,
        ] = await Promise.all([
            // Total counts
            Post.countDocuments(),
            Research.countDocuments(),

            // Featured content
            Post.countDocuments({ featured: true }),
            Research.countDocuments({ featured: true }),

            // This month's content
            Post.countDocuments({
                createdAt: {
                    $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                },
            }),
            Research.countDocuments({
                createdAt: {
                    $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                },
            }),

            // Group by category (for posts)
            Post.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),

            // Group by tag (for research)
            Research.aggregate([
                { $unwind: '$tags' },
                { $group: { _id: '$tags', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 },
            ]),
        ]);

        res.status(200).json({
            success: true,
            stats: {
                total: {
                    posts: totalPosts,
                    research: totalResearch,
                    combined: totalPosts + totalResearch,
                },
                featured: {
                    posts: featuredPosts,
                    research: featuredResearch,
                    combined: featuredPosts + featuredResearch,
                },
                thisMonth: {
                    posts: postsThisMonth,
                    research: researchThisMonth,
                    combined: postsThisMonth + researchThisMonth,
                },
                byCategory: {
                    posts: postsByCategory,
                },
                popularTags: {
                    research: researchByTag,
                },
            },
        });
    } catch (err) {
        next(err);
    }
};

// Toggle featured status for content
export const toggleFeatured = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, type } = req.params;

        if (!id) throw createHttpError(400, 'Content ID is required');
        if (!type || (type !== 'post' && type !== 'research')) {
            throw createHttpError(400, 'Content type must be "post" or "research"');
        }

        let content;
        if (type === 'post') {
            content = await Post.findById(id);
        } else {
            content = await Research.findById(id);
        }

        if (!content) throw createHttpError(404, 'Content not found');

        // Toggle featured status
        content.featured = !content.featured;
        await content.save();

        res.status(200).json({
            success: true,
            message: `Content ${content.featured ? 'featured' : 'not featured'} successfully`,
            featured: content.featured,
        });
    } catch (err) {
        next(err);
    }
};
