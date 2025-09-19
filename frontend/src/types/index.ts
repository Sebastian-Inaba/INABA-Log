// src/types/TypeHelper.ts
export type ContentType = 'post' | 'research';

export interface ContentBase {
    _id: string;
    title: string;
    slug: string;
    author?: string;
    tags: string[];
    featured: boolean;
    featuredImage?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Post extends ContentBase {
    type: 'post';
    description?: string;
    category?: string;
}

export interface Research extends ContentBase {
    type: 'research';
    abstract?: string;
    pdfAttachment?: string | null;
}

export type ContentItem = Post | Research;

// Form related types
export interface FormState {
    title: string;
    slug: string;
    author: string;
    description: string;
    content: string;
    category: string;
    tags: string;
    featured: boolean;
    abstractText: string;
    introduction: string;
    method: string;
    keyFindings: string;
    credibility: string;
    references: string;
}

// API response types
export interface ApiResponse<T> {
    data?: T;
    error?: string;
}
