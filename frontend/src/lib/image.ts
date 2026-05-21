export const normalizeImage = (src?: string) => {
        if (!src) return '/placeholder.png'
        if (src.startsWith('http')) return src
        if (src.startsWith('/')) return src
        return `/${src.replace('./', '')}`
    }