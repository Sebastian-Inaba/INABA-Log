// research controller
import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { Research, IResearch } from '../models/ResearchModel';

// get all research (deep dives)
export const getAllResearch = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tag = req.query.tag as string | undefined;
        const author = req.query.author as string | undefined;
        const dateFilter = req.query.dateFilter as string | undefined;
        const limit = parseInt(req.query.limit as string) || 10;
        const page = parseInt(req.query.page as string) || 1;

        const filter: any = {};
        if (tag) filter.tags = { $in: [tag] };
        if (author) filter.author = author;

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

        const skip = (page - 1) * limit;

        const researchList = await Research.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('title author abstract tags featuredImage createdAt updatedAt') // Might get changed
            .lean();

        const total = await Research.countDocuments(filter);

        res.status(200).json({
            success: true,
            research: researchList,
            total,
            page,
            pages: Math.ceil(total / limit),
            limit,
        });
    } catch (err) {
        next(err);
    }
};

// get two newest research papers (deep dives)
export const getTwoNewestResearch = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const researchList = await Research.find()
            .sort({ createdAt: -1 })
            .limit(2)
            .select('title author abstract tags featuredImage createdAt') // Might get changed
            .lean();

        if (!researchList.length) throw createHttpError(404, 'No research found');

        res.status(200).json({
            success: true,
            research: researchList,
        });
    } catch (err) {
        next(err);
    }
};

// get research by id (deep dive)
export const getResearchById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const deepDive = await Research.findById(id);

        if (!deepDive) throw createHttpError(404, 'Deep dive not found');

        res.status(200).json({ success: true, deepDive });
    } catch (err) {
        next(err);
    }
};
