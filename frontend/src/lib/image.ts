export const normalizeImage = (src?: string) => {
    if (!src) return '/placeholder.png';

    // already valid absolute URL
    if (src.startsWith('http')) return src;

    // fix broken legacy relative paths
    if (src.startsWith('./')) {
        return src.replace('./', '/');
    }

    // ensure leading slash
    if (!src.startsWith('/')) {
        return `/${src}`;
    }

    return src;
};