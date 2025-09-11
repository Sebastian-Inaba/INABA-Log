// deepdives model (will most likely add more things in to this model because im not 100% on what is really needed for my flexible deepdives)
import { Schema, model, Document } from 'mongoose';

export interface IResearch extends Document {
    title: string;
    slug: string;
    author: string;
    abstract: string;
    introduction?: string;
    method?: string;
    keyFindings?: string;
    credibility?: string;
    content: string; // markdown
    references?: string[];
    tags: string[];
    featuredImage?: string | null; // Supabase storage URL
    pdfAttachment?: string | null; // PDF download
    featured?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// helper to generate URL-friendly slugs
function makeSlug(title: string): string {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

const ResearchSchema = new Schema<IResearch>(
    {
        title: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        author: { type: String, required: true },
        abstract: { type: String, required: true },
        introduction: { type: String },
        method: { type: String },
        keyFindings: { type: String },
        credibility: { type: String },
        content: { type: String, required: true },
        references: { type: [String], default: [] },
        tags: { type: [String], default: [] },
        featuredImage: { type: String, default: null },
        pdfAttachment: { type: String, default: null },
        featured: { type: Boolean, default: false },
    },
    { timestamps: true },
);

// hook to auto-generate slugs
ResearchSchema.pre('validate', function (next) {
    if (this.title && !this.slug) {
        this.slug = makeSlug(this.title);
    }
    next();
});

export const Research = model<IResearch>('Research', ResearchSchema);
