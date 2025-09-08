// research controller
import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { Research, IResearch } from '../models/ResearchModel';

// get all research(deep dives)
export const getResearch = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tag = req.query.tag as string | undefined;

        const filter: any = {};
        if (tag) filter.tags = { $in: [tag] };

        const researchList = await Research.find(filter).sort({ createdAt: -1 }); // newest first

        res.status(200).json({
            success: true,
            research: researchList,
            total: researchList.length,
        });
    } catch (err) {
        next(err);
    }
};

// get research by id(deep dives)
export const getResearchById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        if (!id) throw createHttpError(400, 'Research ID is required');

        const research: IResearch | null = await Research.findById(id);
        if (!research) throw createHttpError(404, 'Research not found');

        res.status(200).json({ success: true, research });
    } catch (err) {
        next(err);
    }
};
