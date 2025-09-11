// post model
import { Schema, model, Document } from 'mongoose';

export interface IPost extends Document {
    title: string;
    slug: string;
    author?: string;
    description?: string;
    content: string; // markdown
    category: string;
    tags: string[];
    featuredImage?: string | null; // Supabase storage URL
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

const PostSchema = new Schema<IPost>(
    {
        title: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        author: { type: String },
        description: { type: String },
        content: { type: String, required: true },
        category: { type: String, required: true },
        tags: { type: [String], default: [] },
        featuredImage: { type: String, default: null },
        featured: { type: Boolean, default: false },
    },
    { timestamps: true },
);

// hook to auto-generate slug
PostSchema.pre('validate', function (next) {
    if (this.title && !this.slug) {
        this.slug = makeSlug(this.title);
    }
    next();
});

export const Post = model<IPost>('Post', PostSchema);
