'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import SimpleBackgroundRemover from 'simple-background-remover';

interface CornerPoint {
    x: number;
    y: number;
}

interface CornerCropEditorProps {
    imageUrl: string;
    onConfirm: (croppedDataUrl: string) => void;
    onCancel: () => void;
}

export default function CornerCropEditor({
    imageUrl,
    onConfirm,
    onCancel,
}: CornerCropEditorProps) {
    const [corners, setCorners] = useState<CornerPoint[]>([
        { x: 0.1, y: 0.1 },
        { x: 0.9, y: 0.1 },
        { x: 0.9, y: 0.9 },
        { x: 0.1, y: 0.9 },
    ]);
    const [processedUrl, setProcessedUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let cancelled = false;

        async function removeBg() {
            try {
                setLoading(true);
                const remover = new SimpleBackgroundRemover();
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.src = imageUrl;

                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                });

                const result = await remover.removeBackground(img, {
                    return: 'base64',
                });

                if (!cancelled) {
                    setProcessedUrl(result as string);
                    setError(null);
                }
            } catch (e) {
                if (!cancelled) {
                    setProcessedUrl(imageUrl);
                    setError('Background removal unavailable');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        removeBg();
        return () => {
            cancelled = true;
        };
    }, [imageUrl]);
}