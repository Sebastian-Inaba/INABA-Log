// src/utilities/helpers.ts
export const makeSlug = (title: string): string =>
    title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

export const parseTags = (tagsString: string): string[] => {
    return tagsString
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
};

export const parseReferences = (referencesString: string): string[] => {
    return referencesString
        .split(/\n|,|;/)
        .map((r) => r.trim())
        .filter(Boolean);
};
