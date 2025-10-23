// src/types/index.ts
import type Lenis from 'lenis';

/**
 * Global augmentation: attach an optional Lenis instance to the window object.
 * Use `window.lenis` safely throughout the app (it may be undefined).
 */
declare global {
    interface Window {
        lenis?: Lenis;
    }
}
export {};

/**
 * Content type literals.
 */
export const CONTENT_TYPES = ['post', 'research'] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

/**
 * Fields shared by all content items (Post and Research).
 * Keep these minimal and stable across different content shapes.
 */
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

/**
 * Blog post content shape.
 * Extends ContentBase and adds fields that are specific to posts.
 */
export interface Post extends ContentBase {
    type: 'post';
    description?: string;
    category?: string;
    content: string;
}

/**
 * Research content shape.
 * Extends ContentBase and adds fields that are specific to research.
 */
export interface Research extends ContentBase {
    type: 'research';
    abstract?: string;
    introduction?: string;
    method?: string;
    keyFindings?: string;
    credibility?: string;
    content: string;
    pdfAttachment?: string | null;
    references: string[];
}

/**
 * Union of all content item shapes. Useful when an API returns mixed content types.
 */
export type ContentItem = Post | Research;

/**
 * Shape used by content creation/edit forms.
 */
export interface FormState {
    title: string;
    slug: string;
    author: string;
    description: string; // for Post
    content: string; // for Post (markdown)
    category: string; // for Post
    tags: string; // comma-separated or other formatted string from the input
    featured: boolean;

    // Research-specific fields
    abstractText: string;
    introduction: string;
    method: string;
    keyFindings: string;
    credibility: string;
    references: string;
}

/**
 * Generic API response.
 * - I don't remember where or what i used it for
 */
export interface ApiResponse<T> {
    data?: T;
    error?: string;
}
