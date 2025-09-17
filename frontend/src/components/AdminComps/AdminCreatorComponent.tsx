// src/components/AdminComps/AdminCreatorComponent.tsx
import { useState, useEffect, useRef } from 'react';
import MarkdownRenderer from '../UtilityComps/MarkdownRenderer';

// todo:
// put api in config and take from there
// split in to more components
// clean up
const API_BASE = 'http://localhost:5000/api/admin';

function makeSlug(title: string) {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

type ContentType = 'post' | 'research';

export default function CreateNewModal() {
    // states
    const [open, setOpen] = useState(false);
    const [type, setType] = useState<ContentType>('post');
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [author, setAuthor] = useState('');
    const [description, setDescription] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState('');
    const [featured, setFeatured] = useState(false);
    const [featuredImage, setFeaturedImage] = useState<File | null>(null);
    const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(null);
    const [abstractText, setAbstractText] = useState('');
    const [introduction, setIntroduction] = useState('');
    const [method, setMethod] = useState('');
    const [keyFindings, setKeyFindings] = useState('');
    const [credibility, setCredibility] = useState('');
    const [references, setReferences] = useState('');
    const [pdfAttachment, setPdfAttachment] = useState<File | null>(null);
    const [pdfPreviewName, setPdfPreviewName] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const initialFocusRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
        setSlug(makeSlug(title));
    }, [title]);

    useEffect(() => {
        if (!featuredImage) {
            setFeaturedImagePreview(null);
            return;
        }
        const url = URL.createObjectURL(featuredImage);
        setFeaturedImagePreview(url);
        return () => URL.revokeObjectURL(url);
    }, [featuredImage]);

    useEffect(() => {
        if (!pdfAttachment) {
            setPdfPreviewName(null);
            return;
        }
        setPdfPreviewName(pdfAttachment.name);
    }, [pdfAttachment]);

    function resetForm() {
        setTitle('');
        setSlug('');
        setAuthor('');
        setDescription('');
        setContent('');
        setCategory('');
        setTags('');
        setFeatured(false);
        setFeaturedImage(null);
        setFeaturedImagePreview(null);
        setAbstractText('');
        setIntroduction('');
        setMethod('');
        setKeyFindings('');
        setCredibility('');
        setReferences('');
        setPdfAttachment(null);
        setPdfPreviewName(null);
        setError(null);
        setSuccessMessage(null);
        setShowConfirm(false);
    }

    async function handleSubmit() {
        setError(null);
        setSuccessMessage(null);
        setLoading(true);

        try {
            const fd = new FormData();
            fd.append('title', title);
            fd.append('slug', slug || makeSlug(title));
            if (author) fd.append('author', author);
            if (description) fd.append('description', description);
            fd.append('content', content);
            if (category) fd.append('category', category);
            fd.append(
                'tags',
                JSON.stringify(
                    tags
                        .split(',')
                        .map((t) => t.trim())
                        .filter(Boolean),
                ),
            );
            fd.append('featured', featured ? 'true' : 'false');

            if (featuredImage) fd.append('featuredImage', featuredImage);

            let endpoint = '';

            if (type === 'post') {
                endpoint = `${API_BASE}/posts`;
            } else {
                endpoint = `${API_BASE}/research`;
                fd.append('abstract', abstractText);
                if (introduction) fd.append('introduction', introduction);
                if (method) fd.append('method', method);
                if (keyFindings) fd.append('keyFindings', keyFindings);
                if (credibility) fd.append('credibility', credibility);
                fd.append(
                    'references',
                    JSON.stringify(
                        references
                            .split(/\n|,|;/)
                            .map((r) => r.trim())
                            .filter(Boolean),
                    ),
                );
                if (pdfAttachment) fd.append('pdfAttachment', pdfAttachment);
            }

            const res = await fetch(endpoint, {
                method: 'POST',
                body: fd,
                credentials: 'include',
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `Server returned ${res.status}`);
            }

            await res.json();
            setSuccessMessage(`${type === 'post' ? 'Post' : 'Research'} created successfully.`);
            resetForm();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
        } finally {
            setLoading(false);
            setShowConfirm(false);
        }
    }

    return (
        <>
            {/* Call button */}
            <button
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                onClick={() => {
                    setOpen(true);
                    setTimeout(() => initialFocusRef.current?.focus(), 60);
                }}
            >
                Create New
            </button>

            {/* Modal */}
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-neutral-900 bg-opacity-80" onClick={() => setOpen(false)} aria-hidden />

                    <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-neutral-900 text-white rounded-xl border border-purple-700 shadow-2xl p-6 z-60">
                        {/* Top bar */}
                        <div className="flex items-start justify-between gap-4 mb-6">
                            <div className="flex items-center gap-4">
                                <h2 className="text-2xl font-bold text-purple-400">Create New Content</h2>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value as ContentType)}
                                    className="bg-neutral-800 text-white px-3 py-2 rounded-lg border border-purple-700 focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="post">Post</option>
                                    <option value="research">Deep Dive</option>
                                </select>
                            </div>

                            {/* top-right X cancel */}
                            <button
                                aria-label="Close"
                                className="text-xl font-bold px-2 py-1 hover:bg-purple-900 rounded-lg transition-colors"
                                onClick={() => setOpen(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left: form */}
                            <div className="space-y-5">
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-semibold text-purple-300 mb-1">Title</label>
                                    <input
                                        className="w-full p-3 rounded-lg bg-neutral-800 border border-purple-700 focus:ring-2 focus:ring-purple-500"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                    <p className="text-xs text-purple-400 mt-1">Slug: {slug}</p>
                                </div>

                                {/* Author */}
                                <div>
                                    <label className="block text-sm font-semibold text-purple-300 mb-1">Author</label>
                                    <input
                                        className="w-full p-3 rounded-lg bg-neutral-800 border border-purple-700 focus:ring-2 focus:ring-purple-500"
                                        value={author}
                                        onChange={(e) => setAuthor(e.target.value)}
                                    />
                                </div>

                                {/* Description / Abstract */}
                                <div>
                                    <label className="block text-sm font-semibold text-purple-300 mb-1">
                                        {type === 'post' ? 'Description (optional)' : 'Abstract (required)'}
                                    </label>
                                    <textarea
                                        className="w-full p-3 rounded-lg bg-neutral-800 border border-purple-700 focus:ring-2 focus:ring-purple-500 min-h-[100px]"
                                        value={type === 'post' ? description : abstractText}
                                        onChange={(e) =>
                                            type === 'post' ? setDescription(e.target.value) : setAbstractText(e.target.value)
                                        }
                                    />
                                </div>

                                {/* Category (post) */}
                                {type === 'post' && (
                                    <div>
                                        <label className="block text-sm font-semibold text-purple-300 mb-1">Category</label>
                                        <input
                                            className="w-full p-3 rounded-lg bg-neutral-800 border border-purple-700 focus:ring-2 focus:ring-purple-500"
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                        />
                                    </div>
                                )}

                                {/* Research specific small fields */}
                                {type === 'research' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-semibold text-purple-300 mb-1">Introduction</label>
                                            <input
                                                className="w-full p-3 rounded-lg bg-neutral-800 border border-purple-700 focus:ring-2 focus:ring-purple-500"
                                                value={introduction}
                                                onChange={(e) => setIntroduction(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-purple-300 mb-1">Method</label>
                                            <input
                                                className="w-full p-3 rounded-lg bg-neutral-800 border border-purple-700 focus:ring-2 focus:ring-purple-500"
                                                value={method}
                                                onChange={(e) => setMethod(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-purple-300 mb-1">Key Findings</label>
                                            <input
                                                className="w-full p-3 rounded-lg bg-neutral-800 border border-purple-700 focus:ring-2 focus:ring-purple-500"
                                                value={keyFindings}
                                                onChange={(e) => setKeyFindings(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-purple-300 mb-1">Credibility</label>
                                            <input
                                                className="w-full p-3 rounded-lg bg-neutral-800 border border-purple-700 focus:ring-2 focus:ring-purple-500"
                                                value={credibility}
                                                onChange={(e) => setCredibility(e.target.value)}
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Tags */}
                                <div>
                                    <label className="block text-sm font-semibold text-purple-300 mb-1">Tags (comma separated)</label>
                                    <input
                                        className="w-full p-3 rounded-lg bg-neutral-800 border border-purple-700 focus:ring-2 focus:ring-purple-500"
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                        placeholder="tag1, tag2, tag3"
                                    />
                                </div>

                                {/* Featured image upload */}
                                <div>
                                    <label className="block text-sm font-semibold text-purple-300 mb-1">Featured Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setFeaturedImage(e.target.files ? e.target.files[0] : null)}
                                        className="mt-1 block w-full text-sm text-purple-400
                                                  file:mr-4 file:py-2 file:px-4
                                                  file:rounded-lg file:border-0
                                                  file:text-sm file:font-semibold
                                                  file:bg-purple-600 file:text-white
                                                  hover:file:bg-purple-700"
                                    />
                                    {featuredImagePreview && (
                                        <div className="mt-3">
                                            <p className="text-sm text-purple-300 mb-1">Image Preview:</p>
                                            <img
                                                src={featuredImagePreview}
                                                alt="preview"
                                                className="mt-2 w-full h-48 object-cover rounded-lg"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* PDF upload for research */}
                                {type === 'research' && (
                                    <div>
                                        <label className="block text-sm font-semibold text-purple-300 mb-1">
                                            PDF Attachment (optional)
                                        </label>
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            onChange={(e) => setPdfAttachment(e.target.files ? e.target.files[0] : null)}
                                            className="mt-1 block w-full text-sm text-purple-400
                                                      file:mr-4 file:py-2 file:px-4
                                                      file:rounded-lg file:border-0
                                                      file:text-sm file:font-semibold
                                                      file:bg-purple-600 file:text-white
                                                      hover:file:bg-purple-700"
                                        />
                                        {pdfPreviewName && <p className="text-xs text-purple-400 mt-2">Selected: {pdfPreviewName}</p>}
                                    </div>
                                )}

                                {/* Content (markdown) */}
                                <div>
                                    <label className="block text-sm font-semibold text-purple-300 mb-1">Content (Markdown)</label>
                                    <textarea
                                        ref={initialFocusRef}
                                        className="w-full p-3 rounded-lg bg-neutral-800 border border-purple-700 focus:ring-2 focus:ring-purple-500 min-h-[200px]"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Start writing your content in Markdown format..."
                                    />
                                </div>

                                {/* Featured checkbox */}
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="featured"
                                        name="featured"
                                        checked={featured}
                                        onChange={(e) => setFeatured(e.target.checked)}
                                        className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                    />
                                    <label htmlFor="featured" className="ml-2 block text-sm text-purple-300">
                                        Feature this content
                                    </label>
                                </div>

                                {/* Footer actions */}
                                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-purple-800">
                                    <button
                                        className="px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors"
                                        onClick={() => setOpen(false)}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                        onClick={() => setShowConfirm(true)}
                                    >
                                        Create
                                    </button>
                                </div>
                            </div>

                            {/* Right: Preview area */}
                            <div className="border-l border-purple-800 pl-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-purple-400 text-lg">Preview</h3>
                                    <div className="text-xs text-purple-500">Live markdown preview</div>
                                </div>

                                <div className="overflow-auto max-h-[70vh] p-5 bg-neutral-800 rounded-lg border border-purple-700">
                                    {/* Featured image preview */}
                                    {featuredImagePreview && (
                                        <div className="mb-6">
                                            <img
                                                src={featuredImagePreview}
                                                alt="Featured"
                                                className="w-full h-64 object-cover rounded-lg mb-4"
                                            />
                                        </div>
                                    )}

                                    {/* Title and metadata */}
                                    <div className="mb-6">
                                        <h1 className="text-3xl font-bold text-white mb-2">{title || 'Untitled'}</h1>
                                        <div className="flex items-center text-sm text-purple-300 mb-3">
                                            <span>By {author || 'Author'}</span>
                                            <span className="mx-2">•</span>
                                            <span>{new Date().toLocaleDateString()}</span>
                                        </div>

                                        {/* Category and tags */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {category && (
                                                <span className="px-3 py-1 bg-purple-900 text-purple-300 rounded-full text-sm">
                                                    {category}
                                                </span>
                                            )}
                                            {tags
                                                .split(',')
                                                .filter((tag) => tag.trim())
                                                .map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-1 bg-neutral-700 text-neutral-300 rounded-full text-sm"
                                                    >
                                                        {tag.trim()}
                                                    </span>
                                                ))}
                                        </div>

                                        {/* Description/Abstract */}
                                        {description && <p className="text-lg text-neutral-300 italic mb-4">{description}</p>}
                                    </div>

                                    {/* Rendered markdown(component) */}
                                    <MarkdownRenderer content={content || '*Start typing markdown to see preview...*'} variant="preview" />
                                </div>
                            </div>
                        </div>

                        {/* Error / success messages */}
                        <div className="mt-6">
                            {error && <div className="p-3 bg-red-900 border border-red-700 text-red-200 rounded-lg">{error}</div>}
                            {successMessage && (
                                <div className="p-3 bg-green-900 border border-green-700 text-green-200 rounded-lg">{successMessage}</div>
                            )}
                        </div>

                        {/* Secondary confirmation modal */}
                        {showConfirm && (
                            <div className="fixed inset-0 z-70 flex items-center justify-center">
                                <div className="absolute inset-0 bg-black bg-opacity-70" />
                                <div className="relative z-80 bg-neutral-800 border border-purple-700 p-6 rounded-lg w-full max-w-md">
                                    <h4 className="font-bold text-lg text-purple-300 mb-3">Confirm Creation</h4>
                                    <p className="text-neutral-300 mb-4">
                                        Are you sure you want to create this {type === 'post' ? 'post' : 'research'}? This action cannot be
                                        undone.
                                    </p>

                                    <div className="flex justify-end gap-3">
                                        <button
                                            className="px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors"
                                            onClick={() => setShowConfirm(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                                            onClick={() => handleSubmit()}
                                            disabled={loading}
                                        >
                                            {loading ? 'Creating...' : 'Yes, Create'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
