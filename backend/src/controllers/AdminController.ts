// admin controller
import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { Post, IPost } from '../models/PostModel';
import { Research, IResearch } from '../models/ResearchModel';
import { uploadFile, removeFile, UploadResult } from '../controllers/UploadController';

// -------------------- IN TESTING ---------------------------------------------------------------------------------------------- //
// -------------------- IN TESTING ---------------------------------------------------------------------------------------------- //
// -------------------- IN TESTING ---------------------------------------------------------------------------------------------- //

// -------------------- POSTS -------------------------------------------------------------------- //

// Create Post
export const createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, content, category, tags, featured, author, description } = req.body;
        let featuredImage = '';

        if (req.file) {
            const uploaded: UploadResult = await uploadFile(req, 'posts');
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
            // remove the current featured image if it exists
            if (post.featuredImage) {
                const filename = post.featuredImage.split('/').pop()!;
                await removeFile('posts', filename);
            }

            const uploaded: UploadResult = await uploadFile(req, 'posts');
            post.featuredImage = uploaded.publicUrl;
        }

        if (title) post.title = title;
        post.content = content || post.content;
        post.category = category || post.category;
        post.tags = tags || post.tags;
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
            const uploaded: UploadResult = await uploadFile(req, 'research');
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
            // remove the current featured image if it exists
            if (research.featuredImage) {
                const filename = research.featuredImage.split('/').pop()!;
                await removeFile('research', filename);
            }

            const uploaded: UploadResult = await uploadFile(req, 'research');
            research.featuredImage = uploaded.publicUrl;
        }

        if (title) research.title = title;
        research.author = author || research.author;
        research.abstract = abstract || research.abstract;
        research.introduction = introduction || research.introduction;
        research.method = method || research.method;
        research.keyFindings = keyFindings || research.keyFindings;
        research.credibility = credibility || research.credibility;
        research.content = content || research.content;
        research.references = references || research.references;
        research.tags = tags || research.tags;
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
