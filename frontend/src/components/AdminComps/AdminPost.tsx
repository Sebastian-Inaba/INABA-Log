// src/components/AdminComps/AdminPost.tsx
import { useEffect, useRef, useState } from 'react';
import { apiClient } from '../../utilities/api';
import { makeSlug, parseTags, parseReferences } from '../../utilities/helpers';
import { FileUpload, Checkbox, PreviewPanel, StatusMessages, ConfirmationModal } from './ChildComps';
import type { ContentType, FormState } from '../../types';
import type { ChangeEvent } from 'react';

export function CreateNewModal() {
    // Modal open state and content type
    const [open, setOpen] = useState(false);
    const [type, setType] = useState<ContentType>('post');

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

    // File uploads
    const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
    const [pdfAttachment, setPdfAttachment] = useState<File | null>(null);

    // Preview URLs for files
    const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(null);
    useEffect(() => {
        if (!featuredImageFile) {
            setFeaturedImageUrl(null);
            return;
        }
        const url = URL.createObjectURL(featuredImageFile);
        setFeaturedImageUrl(url);
        return () => URL.revokeObjectURL(url); // Clean up object URL when file changes
    }, [featuredImageFile]);

    const pdfPreviewName = pdfAttachment?.name ?? null;

    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [status, setStatus] = useState<{ error: string | null; success: string | null }>({ error: null, success: null });
    const initialFocusRef = useRef<HTMLTextAreaElement>(null);

    // Generic handler to update form fields
    const updateField = (field: keyof FormState, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // Auto-generate slug from title
    useEffect(() => {
        const newSlug = makeSlug(formData.title);
        setFormData((prev) => (prev.slug === newSlug ? prev : { ...prev, slug: newSlug }));
    }, [formData.title]);

    // Prevent background scrolling when modal is open
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    // Close modal on Escape key
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open]);

    // Reset form to initial state
    const resetForm = () => {
        setFormData({
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
        setFeaturedImageFile(null);
        setPdfAttachment(null);
        setStatus({ error: null, success: null });
        setShowConfirm(false);
    };

    // Validate required fields before submission
    const isValid = () => {
        if (!formData.title.trim()) return false;
        if (!formData.content.trim()) return false;
        if (type === 'research' && !formData.abstractText.trim()) return false;
        return true;
    };

    // Handle submission: prepare FormData, call API, handle response
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

            let endpoint = '';

            if (type === 'post') {
                endpoint = '/admin/posts';
                if (formData.category) fd.append('category', formData.category);
            } else {
                endpoint = '/admin/research';
                fd.append('abstract', formData.abstractText);
                if (formData.introduction) fd.append('introduction', formData.introduction);
                if (formData.method) fd.append('method', formData.method);
                if (formData.keyFindings) fd.append('keyFindings', formData.keyFindings);
                if (formData.credibility) fd.append('credibility', formData.credibility);

                const referencesArray = parseReferences(formData.references);
                fd.append('references', JSON.stringify(referencesArray));

                if (pdfAttachment) fd.append('pdfAttachment', pdfAttachment);
            }

            await apiClient.post(endpoint, fd);

            setStatus({ success: `${type === 'post' ? 'Post' : 'Research'} created successfully.`, error: null });
            resetForm();
            setOpen(false);
        } catch (err) {
            const error = err as Error;
            const errorMessage = error.message || 'Unknown error';
            setStatus({ error: errorMessage, success: null });
        } finally {
            setLoading(false);
            setShowConfirm(false);
        }
    };

    // Standard props for all input fields
    const commonInputProps = (field: keyof FormState) => ({
        value: formData[field] as unknown as string,
        onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => updateField(field, e.target.value),
        className: 'w-full p-3 rounded-lg bg-neutral-800 border border-purple-700 focus:ring-2 focus:ring-purple-500',
    });

    return (
        <>
            {/* Trigger button to open modal */}
            <button
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-3xl transition-colors"
                onClick={() => {
                    setOpen(true);
                    setTimeout(() => initialFocusRef.current?.focus(), 60); // Focus first input after modal opens
                }}
                aria-haspopup="dialog"
            >
                Create New
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Create new content"
                >
                    {/* Background overlay */}
                    <div className="absolute inset-0 bg-neutral-900 bg-opacity-80" onClick={() => setOpen(false)} aria-hidden />

                    {/* Modal content container */}
                    <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-neutral-900 text-white rounded-xl border border-purple-700 shadow-2xl p-6 z-60">
                        {/* Header with title and content type selector */}
                        <div className="flex items-start justify-between gap-4 mb-6">
                            <div className="flex items-center gap-4">
                                <h2 className="text-2xl font-bold text-purple-400">Create New Content</h2>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value as ContentType)}
                                    className="bg-neutral-800 text-white px-3 py-2 rounded-lg border border-purple-700 focus:ring-2 focus:ring-purple-500"
                                    aria-label="Content type"
                                >
                                    <option value="post">Post</option>
                                    <option value="research">Deep Dive</option>
                                </select>
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                className="text-xl font-bold px-2 py-1 hover:bg-purple-900 rounded-lg"
                                aria-label="Close"
                            >
                                x
                            </button>
                        </div>

                        {/* Two-column layout: form and preview */}
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
                                                <label className="block text-sm font-semibold text-purple-300 mb-1 capitalize">
                                                    {field}
                                                </label>
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
                                <FileUpload
                                    label="Featured Image"
                                    accept="image/*"
                                    onChange={setFeaturedImageFile}
                                    previewUrl={featuredImageUrl}
                                />

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

                                {/* Feature checkbox */}
                                <Checkbox
                                    label="Feature this content"
                                    checked={formData.featured}
                                    onChange={(checked: boolean) => updateField('featured', checked)}
                                />

                                {/* Action buttons */}
                                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-purple-800">
                                    <button
                                        onClick={() => setOpen(false)}
                                        className="px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => setShowConfirm(true)}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                    >
                                        Create
                                    </button>
                                </div>
                            </div>

                            {/* Live preview */}
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
            )}
        </>
    );
}
