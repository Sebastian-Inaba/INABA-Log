// src/components/AdminComps/AdminPost.tsx
import React, { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import MarkdownRenderer from '../UtilityComps/MarkdownRenderer';
import { apiClient } from '../../utilities/api';
import { makeSlug, parseTags, parseReferences } from '../../utilities/helpers';
import type { ContentType, FormState } from '../../types';

interface FileUploadProps {
    label: string;
    accept: string;
    onChange: (file: File | null) => void;
    previewUrl?: string | null;
    previewName?: string | null;
}

interface CheckboxProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

interface PreviewPanelProps {
    title: string;
    author: string;
    description: string;
    category: string;
    tags: string;
    featuredImageUrl: string | null;
    content: string;
}

interface StatusMessagesProps {
    status: { error: string | null; success: string | null };
}

interface ConfirmationModalProps {
    type: ContentType;
    loading: boolean;
    disabled?: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

export default function CreateNewModal() {
    const [open, setOpen] = useState(false);
    const [type, setType] = useState<ContentType>('post');
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
    useEffect(() => {
        if (!featuredImageFile) {
            setFeaturedImageUrl(null);
            return;
        }
        const url = URL.createObjectURL(featuredImageFile);
        setFeaturedImageUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [featuredImageFile]);

    const pdfPreviewName = pdfAttachment?.name ?? null;

    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [status, setStatus] = useState<{ error: string | null; success: string | null }>({ error: null, success: null });
    const initialFocusRef = useRef<HTMLTextAreaElement>(null);

    const updateField = (field: keyof FormState, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    useEffect(() => {
        const newSlug = makeSlug(formData.title);
        setFormData((prev) => (prev.slug === newSlug ? prev : { ...prev, slug: newSlug }));
    }, [formData.title]);

    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open]);

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

    const isValid = () => {
        if (!formData.title.trim()) return false;
        if (!formData.content.trim()) return false;
        if (type === 'research' && !formData.abstractText.trim()) return false;
        return true;
    };

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

    const commonInputProps = (field: keyof FormState) => ({
        value: formData[field] as unknown as string,
        onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => updateField(field, e.target.value),
        className: 'w-full p-3 rounded-lg bg-neutral-800 border border-purple-700 focus:ring-2 focus:ring-purple-500',
    });

    return (
        <>
            <button
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                onClick={() => {
                    setOpen(true);
                    setTimeout(() => initialFocusRef.current?.focus(), 60);
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
                    <div className="absolute inset-0 bg-neutral-900 bg-opacity-80" onClick={() => setOpen(false)} aria-hidden />

                    <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-neutral-900 text-white rounded-xl border border-purple-700 shadow-2xl p-6 z-60">
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
                                ×
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-5">
                                {(['title', 'author'] as (keyof FormState)[]).map((field) => (
                                    <div key={field}>
                                        <label className="block text-sm font-semibold text-purple-300 mb-1 capitalize">{field}</label>
                                        <input {...commonInputProps(field)} />
                                    </div>
                                ))}

                                <div>
                                    <label className="block text-sm font-semibold text-purple-300 mb-1">
                                        {type === 'post' ? 'Description (optional)' : 'Abstract (required)'}
                                    </label>
                                    <textarea
                                        {...commonInputProps(type === 'post' ? 'description' : 'abstractText')}
                                        className="min-h-[100px]"
                                    />
                                </div>

                                {type === 'post' && (
                                    <div>
                                        <label className="block text-sm font-semibold text-purple-300 mb-1">Category</label>
                                        <input {...commonInputProps('category')} />
                                    </div>
                                )}

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

                                <div>
                                    <label className="block text-sm font-semibold text-purple-300 mb-1">Tags (comma separated)</label>
                                    <input {...commonInputProps('tags')} placeholder="tag1, tag2, tag3" />
                                </div>

                                {type === 'research' && (
                                    <div>
                                        <label className="block text-sm font-semibold text-purple-300 mb-1">
                                            References (comma, semicolon, or newline separated)
                                        </label>
                                        <textarea
                                            {...commonInputProps('references')}
                                            className="min-h-[100px]"
                                            placeholder="Reference 1, Reference 2; Reference 3"
                                        />
                                    </div>
                                )}

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

                                <div>
                                    <label className="block text-sm font-semibold text-purple-300 mb-1">Content (Markdown)</label>
                                    <textarea
                                        ref={initialFocusRef}
                                        {...commonInputProps('content')}
                                        className="min-h-[200px]"
                                        placeholder="Start writing your content in Markdown format..."
                                    />
                                </div>

                                <Checkbox
                                    label="Feature this content"
                                    checked={formData.featured}
                                    onChange={(checked: boolean) => updateField('featured', checked)}
                                />

                                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-purple-800">
                                    <button
                                        onClick={() => {
                                            setOpen(false);
                                        }}
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

                        <StatusMessages status={status} />

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

const FileUpload: React.FC<FileUploadProps> = ({ label, accept, onChange, previewUrl, previewName }) => (
    <div>
        <label className="block text-sm font-semibold text-purple-300 mb-1">{label}</label>
        <input
            type="file"
            accept={accept}
            onChange={(e) => onChange(e.target.files?.[0] || null)}
            className="mt-1 block w-full text-sm text-purple-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
        />
        {previewUrl && <img src={previewUrl} alt="preview" className="mt-2 w-full h-48 object-cover rounded-lg" />}
        {previewName && <p className="text-xs text-purple-400 mt-2">Selected: {previewName}</p>}
    </div>
);

const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange }) => (
    <div className="flex items-center">
        <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
        />
        <label className="ml-2 block text-sm text-purple-300">{label}</label>
    </div>
);

const PreviewPanel: React.FC<PreviewPanelProps> = ({ title, author, description, category, tags, featuredImageUrl, content }) => (
    <div className="border-l border-purple-800 pl-6">
        <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-purple-400 text-lg">Preview</h3>
            <div className="text-xs text-purple-500">Live markdown preview</div>
        </div>
        <div className="overflow-auto max-h-[70vh] p-5 bg-neutral-800 rounded-lg border border-purple-700">
            {featuredImageUrl && <img src={featuredImageUrl} alt="Featured" className="w-full h-64 object-cover rounded-lg mb-4" />}
            <h1 className="text-3xl font-bold text-white mb-2">{title || 'Untitled'}</h1>
            <div className="flex items-center text-sm text-purple-300 mb-3">
                <span>By {author || 'Author'}</span>
                <span className="mx-2">•</span>
                <span>{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
                {category && <span className="px-3 py-1 bg-purple-900 text-purple-300 rounded-full text-sm">{category}</span>}
                {tags
                    .split(',')
                    .filter((tag) => tag.trim())
                    .map((tag: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-neutral-700 text-neutral-300 rounded-full text-sm">
                            {tag.trim()}
                        </span>
                    ))}
            </div>
            {description && <p className="text-lg text-neutral-300 italic mb-4">{description}</p>}
            <MarkdownRenderer content={content || '*Start typing markdown to see preview...*'} variant="preview" />
        </div>
    </div>
);

const StatusMessages: React.FC<StatusMessagesProps> = ({ status }) => (
    <div className="mt-6">
        {status.error && <div className="p-3 bg-red-900 border border-red-700 text-red-200 rounded-lg">{status.error}</div>}
        {status.success && <div className="p-3 bg-green-900 border border-green-700 text-green-200 rounded-lg">{status.success}</div>}
    </div>
);

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ type, loading, disabled, onCancel, onConfirm }) => (
    <div className="fixed inset-0 z-70 flex items-center justify-center">
        <div className="absolute inset-0 bg-black bg-opacity-70" />
        <div className="relative z-80 bg-neutral-800 border border-purple-700 p-6 rounded-lg w-full max-w-md">
            <h4 className="font-bold text-lg text-purple-300 mb-3">Confirm Creation</h4>
            <p className="text-neutral-300 mb-4">Are you sure you want to create this {type}? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
                <button onClick={onCancel} className="px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600">
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    disabled={loading || disabled}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                    {loading ? 'Creating...' : 'Yes, Create'}
                </button>
            </div>
        </div>
    </div>
);
