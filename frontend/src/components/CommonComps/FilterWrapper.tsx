// src/components/CommonComps/FilterWrapper.tsx
import { useEffect, useState } from 'react';
import { filterIcons } from '../../assets/icons/icons';
import type { ContentItem } from '../../types';

interface FilterWrapperProps {
    items: ContentItem[];
    onFilter: (filtered: ContentItem[]) => void;
    isAdmin?: boolean;
    showSearch?: boolean;
    showDateFilter?: boolean;
    showFeaturedFilter?: boolean;
}

export function FilterWrapper({
    items,
    onFilter,
    isAdmin = false,
    showSearch = true,
    showDateFilter = true,
    showFeaturedFilter = true,
}: FilterWrapperProps) {
    // Filter state
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedType, setSelectedType] = useState<'post' | 'research' | 'all'>('all');
    const [selectedDate, setSelectedDate] = useState<'all' | 'week' | 'month' | 'year' | 'oldest' | 'newest'>('all');
    const [selectedFeatured, setSelectedFeatured] = useState<'all' | 'featured' | 'non-featured'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Local array
    const FilterIconList = [
        { key: 'search', icon: filterIcons.search, label: 'Search icon' },
        { key: 'filter', icon: filterIcons.filter, label: 'Filter icon' },
        { key: 'arrowDown', icon: filterIcons.arrowDown, label: 'Arrow down icon' },
    ];

    // Array helper
    const getIcon = (key: string) => FilterIconList.find((i) => i.key === key)?.icon || '';
    const getLabel = (key: string) => FilterIconList.find((i) => i.key === key)?.label || '';

    // Extract unique values from items for filter options
    const allTags = Array.from(new Set(items.flatMap((item) => item.tags || [])));
    const allCategories = Array.from(
        new Set(items.map((item) => ('category' in item && item.category ? item.category : '')).filter(Boolean)),
    ) as string[];

    // Filtering logic
    useEffect(() => {
        let filtered = [...items];

        // Filter by type (admin only)
        if (isAdmin && selectedType !== 'all') {
            filtered = filtered.filter((item) => item.type === selectedType);
        }

        // Filter by tags
        if (selectedTags.length > 0) {
            filtered = filtered.filter((item) => selectedTags.every((tag) => item.tags?.includes(tag)));
        }

        // Filter by category
        if (selectedCategory) {
            filtered = filtered.filter((item) => 'category' in item && item.category === selectedCategory);
        }

        // Filter by featured status
        if (selectedFeatured !== 'all') {
            const isFeatured = selectedFeatured === 'featured';
            filtered = filtered.filter((item) => item.featured === isFeatured);
        }

        // Date filter
        if (selectedDate !== 'all') {
            const now = new Date();
            filtered = filtered.filter((item) => {
                if (!item.createdAt) return true;
                const created = new Date(item.createdAt);

                switch (selectedDate) {
                    case 'week':
                        return (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24) <= 7;
                    case 'month':
                        return (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24) <= 30;
                    case 'year':
                        return (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24) <= 365;
                    default:
                        return true;
                }
            });

            // Sort for 'oldest' and 'newest'
            if (selectedDate === 'oldest' || selectedDate === 'newest') {
                filtered.sort((a, b) => {
                    const dateA = new Date(a.createdAt || 0);
                    const dateB = new Date(b.createdAt || 0);
                    return selectedDate === 'oldest' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
                });
            }
        }

        // Search filter
        if (searchTerm.trim()) {
            const lower = searchTerm.toLowerCase();
            filtered = filtered.filter((item) => {
                const searchableText = [
                    item.title,
                    'description' in item ? item.description : '',
                    'abstract' in item ? item.abstract : '',
                    item.author || '',
                    ...(item.tags || []),
                ]
                    .join(' ')
                    .toLowerCase();

                return searchableText.includes(lower);
            });
        }

        onFilter(filtered);
    }, [items, selectedTags, selectedCategory, selectedType, selectedDate, selectedFeatured, searchTerm, isAdmin, onFilter]);

    // Handle tag selection
    const handleTagToggle = (tag: string) => {
        setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
    };

    // Clear all filters
    const clearFilters = () => {
        setSelectedTags([]);
        setSelectedCategory('');
        setSelectedType('all');
        setSelectedDate('all');
        setSelectedFeatured('all');
        setSearchTerm('');
    };

    // Check if any filters are active
    const hasActiveFilters =
        selectedTags.length > 0 ||
        selectedCategory ||
        selectedDate !== 'all' ||
        selectedFeatured !== 'all' ||
        searchTerm ||
        (isAdmin && selectedType !== 'all');

    return (
        <div className="relative">
            {/* Main filter button and search */}
            <div className="flex items-center gap-3">
                {showSearch && (
                    <div className="relative flex-1">
                        <img
                            src={getIcon('search')}
                            alt={getLabel('search')}
                            className="absolute left-3 top-1/2 w-4 h-4 transform -translate-y-1/2 opacity-70"
                        />
                        <input
                            type="text"
                            placeholder="Search posts, research, tags..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:border-purple-500 focus:outline-none transition"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white transition"
                            >
                                <span className="text-lg">✕</span>
                            </button>
                        )}
                    </div>
                )}

                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`flex items-center gap-2 px-4 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white hover:bg-neutral-700 transition ${
                        hasActiveFilters ? 'border-purple-500 bg-purple-900/20' : ''
                    }`}
                >
                    <img src={getIcon('filter')} alt={getLabel('filter')} className="w-4 h-4" />
                    <span>Filters</span>
                    {hasActiveFilters && <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">Active</span>}
                    <img
                        src={getIcon('arrowDown')}
                        alt={getLabel('arrowDown')}
                        className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                </button>
            </div>

            {/* Filter dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-neutral-800 border border-neutral-600 rounded-lg shadow-lg z-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Content Type Select Filter - Admin only */}
                        {isAdmin && (
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-2">Content Type</label>
                                <div className="relative">
                                    <select
                                        value={selectedType}
                                        onChange={(e) => setSelectedType(e.target.value as 'post' | 'research' | 'all')}
                                        className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:border-purple-500 focus:outline-none transition appearance-none pr-10"
                                    >
                                        <option value="all">All Content</option>
                                        <option value="post">Posts Only</option>
                                        <option value="research">Research Only</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-400">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Categories Select Filter */}
                        {allCategories.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-2">
                                    Category ({allCategories.length} available)
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:border-purple-500 focus:outline-none transition appearance-none pr-10"
                                    >
                                        <option value="">All Categories</option>
                                        {allCategories.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-400">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Featured Select Filter */}
                        {showFeaturedFilter && (
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-2">Featured Status</label>
                                <div className="relative">
                                    <select
                                        value={selectedFeatured}
                                        onChange={(e) => setSelectedFeatured(e.target.value as 'all' | 'featured' | 'non-featured')}
                                        className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:border-purple-500 focus:outline-none transition appearance-none pr-10"
                                    >
                                        <option value="all">All Items</option>
                                        <option value="featured">Featured Only</option>
                                        <option value="non-featured">Non-Featured Only</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-400">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Date Select Filter */}
                        {showDateFilter && (
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-2">Date Range</label>
                                <div className="relative">
                                    <select
                                        value={selectedDate}
                                        onChange={(e) =>
                                            setSelectedDate(e.target.value as 'all' | 'week' | 'month' | 'year' | 'oldest' | 'newest')
                                        }
                                        className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:border-purple-500 focus:outline-none transition appearance-none pr-10"
                                    >
                                        <option value="all">All Time</option>
                                        <option value="week">This Week</option>
                                        <option value="month">This Month</option>
                                        <option value="year">This Year</option>
                                        <option value="newest">Newest First</option>
                                        <option value="oldest">Oldest First</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-400">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tags Checkboxes*/}
                    {allTags.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-neutral-600">
                            <label className="block text-sm font-medium text-neutral-300 mb-3">
                                Tags ({allTags.length} available) {selectedTags.length > 0 && `- ${selectedTags.length} selected`}
                            </label>

                            <div className="grid grid-cols-12 gap-2 max-h-80 overflow-y-auto p-1">
                                {Array.from({ length: 12 }).map((_, colIndex) => {
                                    const start = colIndex * 10;
                                    const end = start + 10;
                                    const colTags = allTags.slice(start, end);
                                    return (
                                        <div key={colIndex} className="flex flex-col gap-1">
                                            {colTags.map((tag) => (
                                                <label key={tag} className="flex items-center space-x-2 cursor-pointer group select-none">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedTags.includes(tag)}
                                                        onChange={() => handleTagToggle(tag)}
                                                        className="peer hidden"
                                                    />
                                                    <div className="relative">
                                                        <div
                                                            className={`w-4 h-4 flex items-center justify-center border rounded transition-colors
                                                                ${
                                                                    selectedTags.includes(tag)
                                                                        ? 'bg-purple-600 border-purple-600'
                                                                        : 'bg-white border-neutral-600'
                                                                }`}
                                                        >
                                                            {selectedTags.includes(tag) && (
                                                                <svg
                                                                    className="w-3 h-3 text-white"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    strokeWidth="3"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className="text-sm text-neutral-300 group-hover:text-white transition-colors">
                                                        {tag}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Filter actions*/}
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-neutral-600">
                        <div className="text-sm text-neutral-400">
                            {hasActiveFilters ? <span className="text-purple-300">Filters applied</span> : 'No filters applied'}
                        </div>
                        <div className="flex gap-2">
                            {hasActiveFilters && (
                                <button onClick={clearFilters} className="px-4 py-2 text-neutral-300 hover:text-white transition">
                                    Clear All
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
