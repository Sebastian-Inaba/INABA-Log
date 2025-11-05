// src/components/CommonComps/FilterWrapper.tsx
import { useEffect, useState } from 'react';
import { FilterIcons } from '../../assets/icons/icons';
import type { ContentItem } from '../../types';

interface FilterWrapperProps {
    items: ContentItem[];
    onFilter: (filtered: ContentItem[]) => void;
    isAdmin?: boolean;
    showSearch?: boolean;
    showDateFilter?: boolean;
    showFeaturedFilter?: boolean;
    contentType?: 'post' | 'research';
}

export function FilterWrapper({
    items,
    onFilter,
    isAdmin = false,
    showSearch = true,
    showDateFilter = true,
    showFeaturedFilter = true,
    contentType = 'post',
}: FilterWrapperProps) {
    // Filter state
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedType, setSelectedType] = useState<
        'post' | 'research' | 'all'
    >('all');
    const [selectedDate, setSelectedDate] = useState<
        'all' | 'week' | 'month' | 'year' | 'oldest' | 'newest'
    >('all');
    const [selectedFeatured, setSelectedFeatured] = useState<
        'all' | 'featured' | 'non-featured'
    >('all');
    const [sortAlphabetically, setSortAlphabetically] =
        useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Extract unique values from items for filter options
    const allCategories = Array.from(
        new Set(
            items
                .map((item) =>
                    'category' in item && item.category ? item.category : '',
                )
                .filter(Boolean),
        ),
    ) as string[];

    // Filtering logic
    useEffect(() => {
        let filtered = [...items];

        // Filter by type (admin only)
        if (isAdmin && selectedType !== 'all') {
            filtered = filtered.filter((item) => item.type === selectedType);
        }

        // Filter by category
        if (selectedCategory) {
            filtered = filtered.filter(
                (item) =>
                    'category' in item && item.category === selectedCategory,
            );
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
                        return (
                            (now.getTime() - created.getTime()) /
                                (1000 * 60 * 60 * 24) <=
                            7
                        );
                    case 'month':
                        return (
                            (now.getTime() - created.getTime()) /
                                (1000 * 60 * 60 * 24) <=
                            30
                        );
                    case 'year':
                        return (
                            (now.getTime() - created.getTime()) /
                                (1000 * 60 * 60 * 24) <=
                            365
                        );
                    default:
                        return true;
                }
            });

            // Sort for 'oldest' and 'newest'
            if (selectedDate === 'oldest' || selectedDate === 'newest') {
                filtered.sort((a, b) => {
                    const dateA = new Date(a.createdAt || 0);
                    const dateB = new Date(b.createdAt || 0);
                    return selectedDate === 'oldest'
                        ? dateA.getTime() - dateB.getTime()
                        : dateB.getTime() - dateA.getTime();
                });
            }
        }

        // Sort alphabetically
        if (sortAlphabetically) {
            filtered.sort((a, b) => a.title.localeCompare(b.title));
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
    }, [
        items,
        selectedCategory,
        selectedType,
        selectedDate,
        selectedFeatured,
        sortAlphabetically,
        searchTerm,
        isAdmin,
        onFilter,
        contentType,
    ]);

    // Clear all filters
    const clearFilters = () => {
        setSelectedCategory('');
        setSelectedType('all');
        setSelectedDate('all');
        setSelectedFeatured('all');
        setSortAlphabetically(false);
        setSearchTerm('');
    };

    // Get active filter labels for display
    const getActiveFilters = () => {
        const filters: string[] = [];

        if (isAdmin && selectedType !== 'all') {
            filters.push(selectedType === 'post' ? 'Posts' : 'Research');
        }
        if (selectedCategory) {
            filters.push(selectedCategory);
        }
        if (selectedFeatured !== 'all') {
            filters.push(
                selectedFeatured === 'featured' ? 'Featured' : 'Non-Featured',
            );
        }
        if (selectedDate !== 'all') {
            const dateLabels: Record<string, string> = {
                week: 'This Week',
                month: 'This Month',
                year: 'This Year',
                newest: 'Newest First',
                oldest: 'Oldest First',
            };
            filters.push(dateLabels[selectedDate] || selectedDate);
        }
        if (sortAlphabetically) {
            filters.push('A-Z');
        }
        if (searchTerm) {
            filters.push(`"${searchTerm}"`);
        }

        return filters;
    };

    // Check if any filters are active
    const hasActiveFilters =
        selectedCategory ||
        selectedDate !== 'all' ||
        selectedFeatured !== 'all' ||
        sortAlphabetically ||
        searchTerm ||
        (isAdmin && selectedType !== 'all');

    return (
        <div className="relative">
            {/* Main filter button and search */}
            <div className="flex items-center gap-3">
                {showSearch && (
                    <div className="relative flex-1">
                        <FilterIcons.Search className="absolute left-3 top-1/2 w-4 h-4 transform -translate-y-1/2 opacity-70" />
                        <input
                            type="text"
                            placeholder={`Search ${contentType === 'research' ? 'research, abstracts' : 'posts, descriptions'}, tags...`}
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
                    className={`cursor-pointer flex items-center gap-2 px-4 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white hover:bg-neutral-700 transition ${
                        hasActiveFilters
                            ? 'border-purple-500 bg-purple-900/20'
                            : ''
                    }`}
                >
                    <FilterIcons.Filter className="w-4 h-4" />
                    <span className="hidden sm:inline">Filter</span>
                    {hasActiveFilters && (
                        <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                            Active
                        </span>
                    )}
                    <FilterIcons.ArrowDown
                        className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                </button>
            </div>

            {/* Filter dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-neutral-800 border border-neutral-600 rounded-lg z-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Content Type Select Filter - Admin only */}
                        {isAdmin && (
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-2">
                                    Content Type
                                </label>
                                <select
                                    value={selectedType}
                                    onChange={(e) =>
                                        setSelectedType(
                                            e.target.value as
                                                | 'post'
                                                | 'research'
                                                | 'all',
                                        )
                                    }
                                    className="cursor-pointer w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:border-purple-500 focus:outline-none transition"
                                >
                                    <option value="all">All Content</option>
                                    <option value="post">Posts Only</option>
                                    <option value="research">
                                        Research Only
                                    </option>
                                </select>
                            </div>
                        )}

                        {/* Categories Select Filter */}
                        {allCategories.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-2">
                                    Category ({allCategories.length} available)
                                </label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) =>
                                        setSelectedCategory(e.target.value)
                                    }
                                    className="cursor-pointer w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:border-purple-500 focus:outline-none transition"
                                >
                                    <option value="">All Categories</option>
                                    {allCategories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Featured Select Filter */}
                        {showFeaturedFilter && (
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-2">
                                    Featured Status
                                </label>
                                <select
                                    value={selectedFeatured}
                                    onChange={(e) =>
                                        setSelectedFeatured(
                                            e.target.value as
                                                | 'all'
                                                | 'featured'
                                                | 'non-featured',
                                        )
                                    }
                                    className="cursor-pointer w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:border-purple-500 focus:outline-none transition"
                                >
                                    <option value="all">All Items</option>
                                    <option value="featured">
                                        Featured Only
                                    </option>
                                    <option value="non-featured">
                                        Non-Featured Only
                                    </option>
                                </select>
                            </div>
                        )}

                        {/* Date Select Filter */}
                        {showDateFilter && (
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-2">
                                    Date Range
                                </label>
                                <select
                                    value={selectedDate}
                                    onChange={(e) =>
                                        setSelectedDate(
                                            e.target
                                                .value as typeof selectedDate,
                                        )
                                    }
                                    className="cursor-pointer w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:border-purple-500 focus:outline-none transition"
                                >
                                    <option value="all">All Time</option>
                                    <option value="week">This Week</option>
                                    <option value="month">This Month</option>
                                    <option value="year">This Year</option>
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                </select>
                            </div>
                        )}

                        {/* Sort Filter */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">
                                Sort Order
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group select-none">
                                <input
                                    type="checkbox"
                                    checked={sortAlphabetically}
                                    onChange={(e) =>
                                        setSortAlphabetically(e.target.checked)
                                    }
                                    className="peer hidden"
                                />
                                <div className="shrink-0">
                                    <div
                                        className={`w-4 h-4 flex items-center justify-center border rounded transition-colors ${
                                            sortAlphabetically
                                                ? 'bg-purple-600 border-purple-600'
                                                : 'bg-white border-neutral-600'
                                        }`}
                                    >
                                        {sortAlphabetically && (
                                            <svg
                                                className="w-3 h-3 text-white"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                <span className="text-sm text-neutral-300 group-hover:text-white transition-colors">
                                    Sort A-Z
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Filter actions */}
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-neutral-600">
                        <div className="text-sm text-neutral-400">
                            {hasActiveFilters ? (
                                <span className="text-purple-300">
                                    {getActiveFilters().length === 1
                                        ? `Filter applied: ${getActiveFilters()[0]}`
                                        : `Filters applied: ${getActiveFilters().join(', ')}`}
                                </span>
                            ) : (
                                'No filters applied'
                            )}
                        </div>
                        <div className="flex gap-2">
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="px-4 py-2 text-neutral-300 hover:text-white transition cursor-pointer"
                                >
                                    Clear All
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition cursor-pointer"
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
