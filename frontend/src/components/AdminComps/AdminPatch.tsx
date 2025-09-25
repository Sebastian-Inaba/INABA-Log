// src/components/AdminComps/AdminPatch.tsx
import { useEffect, useRef, useState } from 'react';
import { apiClient } from '../../utilities/api';
import { makeSlug, parseTags, parseReferences } from '../../utilities/helpers';
import { FileUpload, Checkbox, PreviewPanel, StatusMessages, ConfirmationModal } from './ChildComps';
import type { ContentType, FormState, Post, Research } from '../../types';
import type { ChangeEvent } from 'react';

interface EditModalProps {
    item: Post | Research;
    type: ContentType;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

// Type guard to differentiate Post from Research
const isResearch = (item: Post | Research): item is Research => {
    return (item as Research).abstract !== undefined;
};

// Safely get a string property from the item, handling arrays(might not need array handel anymore since i fixed parsing in backend)
const getProperty = (item: Post | Research, property: string): string => {
    const itemRecord = item as unknown as Record<string, unknown>;
    const value = itemRecord[property];

    if (Array.isArray(value)) return value.join(', ');
    return typeof value === 'string' ? value : '';
};

export function EditModal({ item, type, isOpen, onClose, onUpdate }: EditModalProps) {
    // Form state for all input fields
    const [formData, setFormData] = useState<FormState>({
        title: '',
        slug: '',
        author: '',
        description: '',
        content: '',
        category: '',
        tags: '',
        featured: false,
        abstractText: '',
        introduction: '',
        method: '',
        keyFindings: '',
        credibility: '',
        references: '',
    });

    const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
    const [pdfAttachment, setPdfAttachment] = useState<File | null>(null);
    const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [status, setStatus] = useState<{ error: string | null; success: string | null }>({ error: null, success: null });

    const initialFocusRef = useRef<HTMLTextAreaElement>(null);

    // Populate form when modal opens or item changes
    useEffect(() => {
        if (isOpen && item) {
            const referencesArray = isResearch(item) && item.references ? item.references : [];

            setFormData({
                title: item.title || '',
                slug: item.slug || '',
                author: item.author || '',
                description: getProperty(item, 'description'),
                content: getProperty(item, 'content'),
                category: getProperty(item, 'category'),
                tags: Array.isArray(item.tags) ? item.tags.join(', ') : item.tags || '',
                featured: item.featured || false,
                abstractText: isResearch(item) ? item.abstract || '' : '',
                introduction: getProperty(item, 'introduction'),
                method: getProperty(item, 'method'),
                keyFindings: getProperty(item, 'keyFindings'),
                credibility: getProperty(item, 'credibility'),
                references: referencesArray.join(', '),
            });

            if (item.featuredImage) setFeaturedImageUrl(item.featuredImage);
        }
    }, [isOpen, item]);

    // Update image preview when a new file is selected
    useEffect(() => {
        if (!featuredImageFile) return;
        const url = URL.createObjectURL(featuredImageFile);
        setFeaturedImageUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [featuredImageFile]);

    const pdfPreviewName = pdfAttachment?.name || (isResearch(item) ? getProperty(item, 'pdfAttachment') : null);

    const updateField = (field: keyof FormState, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // Automatically generate slug from title
    useEffect(() => {
        const newSlug = makeSlug(formData.title);
        setFormData((prev) => (prev.slug === newSlug ? prev : { ...prev, slug: newSlug }));
    }, [formData.title]);

    // Prevent scrolling when modal is open
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Close modal on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    // Validate required fields
    const isValid = () => {
        if (!formData.title.trim()) return false;
        if (!formData.content.trim()) return false;
        if (type === 'research' && !formData.abstractText.trim()) return false;
        return true;
    };

    // Handle form submission and API request
    const handleSubmit = async () => {
        if (!isValid()) {
            setStatus({ error: 'Please fill required fields (title, content, and abstract for research).', success: null });
            setShowConfirm(false);
            return;
        }

        setLoading(true);
        setStatus({ error: null, success: null });

        try {
            const fd = new window.FormData();
            fd.append('title', formData.title);
            fd.append('slug', formData.slug || makeSlug(formData.title));
            if (formData.author) fd.append('author', formData.author);
            if (formData.description) fd.append('description', formData.description);
            fd.append('content', formData.content);

            const tagsArray = parseTags(formData.tags);
            fd.append('tags', JSON.stringify(tagsArray));
            fd.append('featured', String(formData.featured));

            if (featuredImageFile) fd.append('featuredImage', featuredImageFile);

            const endpoint = type === 'post' ? `/admin/posts/${item._id}` : `/admin/research/${item._id}`;

            if (type === 'post') {
                if (formData.category) fd.append('category', formData.category);
            } else {
                fd.append('abstract', formData.abstractText);
                if (formData.introduction) fd.append('introduction', formData.introduction);
                if (formData.method) fd.append('method', formData.method);
                if (formData.keyFindings) fd.append('keyFindings', formData.keyFindings);
                if (formData.credibility) fd.append('credibility', formData.credibility);

                const referencesArray = parseReferences(formData.references);
                fd.append('references', JSON.stringify(referencesArray));

                if (pdfAttachment) fd.append('pdfAttachment', pdfAttachment);
            }

            await apiClient.patch(endpoint, fd);

            setStatus({ success: `${type === 'post' ? 'Post' : 'Research'} updated successfully.`, error: null });
            onUpdate();
            onClose();
        } catch (err) {
            const error = err as Error;
            const errorMessage = error.message || 'Unknown error';
            setStatus({ error: errorMessage, success: null });
        } finally {
            setLoading(false);
            setShowConfirm(false);
        }
    };

    // Standardized props for input and textarea elements
    const commonInputProps = (field: keyof FormState) => ({
        value: formData[field] as unknown as string,
        onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => updateField(field, e.target.value),
        className: 'w-full p-3 rounded-lg bg-neutral-800 border border-purple-700 focus:ring-2 focus:ring-purple-500',
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Edit content">
            {/* Overlay background */}
            <div className="absolute inset-0 bg-neutral-900 bg-opacity-80" onClick={onClose} aria-hidden />

            {/* Modal container */}
            <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-neutral-900 text-white rounded-xl border border-purple-700 shadow-2xl p-6 z-60">
                {/* Header with title and close button */}
                <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold text-purple-400">Edit {type === 'post' ? 'Post' : 'Deep Dive'}</h2>
                        <div className="px-3 py-1 bg-purple-900 text-purple-300 rounded-full text-sm font-medium">{type}</div>
                    </div>
                    <button onClick={onClose} className="text-xl font-bold px-2 py-1 hover:bg-purple-900 rounded-lg" aria-label="Close">
                        x
                    </button>
                </div>

                {/* Two-column form grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-5">
                        {/* Basic fields: title and author */}
                        {(['title', 'author'] as (keyof FormState)[]).map((field) => (
                            <div key={field}>
                                <label className="block text-sm font-semibold text-purple-300 mb-1 capitalize">{field}</label>
                                <input {...commonInputProps(field)} />
                            </div>
                        ))}

                        {/* Description / Abstract */}
                        <div>
                            <label className="block text-sm font-semibold text-purple-300 mb-1">
                                {type === 'post' ? 'Description (optional)' : 'Abstract (required)'}
                            </label>
                            <textarea
                                {...commonInputProps(type === 'post' ? 'description' : 'abstractText')}
                                className={`${commonInputProps(type === 'post' ? 'description' : 'abstractText').className} min-h-[100px]`}
                            />
                        </div>

                        {/* Category for posts */}
                        {type === 'post' && (
                            <div>
                                <label className="block text-sm font-semibold text-purple-300 mb-1">Category</label>
                                <input {...commonInputProps('category')} />
                            </div>
                        )}

                        {/* Research-specific fields */}
                        {type === 'research' && (
                            <>
                                {(['introduction', 'method', 'keyFindings', 'credibility'] as (keyof FormState)[]).map((field) => (
                                    <div key={field}>
                                        <label className="block text-sm font-semibold text-purple-300 mb-1 capitalize">{field}</label>
                                        <input {...commonInputProps(field)} />
                                    </div>
                                ))}
                            </>
                        )}

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-semibold text-purple-300 mb-1">Tags (comma separated)</label>
                            <input {...commonInputProps('tags')} placeholder="tag1, tag2, tag3" />
                        </div>

                        {/* References for research */}
                        {type === 'research' && (
                            <div>
                                <label className="block text-sm font-semibold text-purple-300 mb-1">
                                    References (comma, semicolon, or newline separated)
                                </label>
                                <textarea
                                    {...commonInputProps('references')}
                                    className={`${commonInputProps('references').className} min-h-[100px]`}
                                    placeholder="Reference 1, Reference 2; Reference 3"
                                />
                            </div>
                        )}

                        {/* File uploads */}
                        <FileUpload label="Featured Image" accept="image/*" onChange={setFeaturedImageFile} previewUrl={featuredImageUrl} />
                        {type === 'research' && (
                            <FileUpload
                                label="PDF Attachment (optional)"
                                accept="application/pdf"
                                onChange={setPdfAttachment}
                                previewName={pdfPreviewName}
                            />
                        )}

                        {/* Content editor */}
                        <div>
                            <label className="block text-sm font-semibold text-purple-300 mb-1">Content (Markdown)</label>
                            <textarea
                                ref={initialFocusRef}
                                {...commonInputProps('content')}
                                className={`${commonInputProps('content').className} min-h-[200px]`}
                                placeholder="Start writing your content in Markdown format..."
                            />
                        </div>

                        {/* Featured checkbox */}
                        <Checkbox
                            label="Feature this content"
                            checked={formData.featured}
                            onChange={(checked: boolean) => updateField('featured', checked)}
                        />

                        {/* Action buttons */}
                        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-purple-800">
                            <button onClick={onClose} className="px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600">
                                Cancel
                            </button>
                            <button
                                onClick={() => setShowConfirm(true)}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                            >
                                Update
                            </button>
                        </div>
                    </div>

                    {/* Live preview of post/research */}
                    <PreviewPanel
                        title={formData.title}
                        author={formData.author}
                        description={formData.description}
                        category={formData.category}
                        tags={formData.tags}
                        featuredImageUrl={featuredImageUrl}
                        content={formData.content}
                    />
                </div>

                {/* Status messages */}
                <StatusMessages status={status} />

                {/* Confirmation modal */}
                {showConfirm && (
                    <ConfirmationModal
                        type={type}
                        loading={loading}
                        disabled={!isValid()}
                        onCancel={() => setShowConfirm(false)}
                        onConfirm={handleSubmit}
                    />
                )}
            </div>
        </div>
    );
}
