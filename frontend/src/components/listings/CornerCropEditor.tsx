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
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const [confirming, setConfirming] = useState(false);
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

    const getRelativeCoords = useCallback(
        (e: React.PointerEvent): CornerPoint | null => {
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return null;
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            return {
                x: Math.min(1, Math.max(0, x)),
                y: Math.min(1, Math.max(0, y)),
            };
        },
        [],
    );

    const handlePointerDown =
        (index: number) => (e: React.PointerEvent<SVGCircleElement>) => {
            e.preventDefault();
            e.currentTarget.setPointerCapture(e.pointerId);
            setDraggingIndex(index);
        };

    const handlePointerMove = (e: React.PointerEvent<SVGCircleElement>) => {
        if (draggingIndex === null) return;
        const coords = getRelativeCoords(e);
        if (!coords) return;

        setCorners((prev) => {
            const next = [...prev];
            next[draggingIndex] = getRelativeCoords;
            return next;
        });
    };

    const handlePointerUp = (e: React.PointerEvent<SVGCircleElement>) => {
        if (draggingIndex === null) return;
        try {
            e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {
            // Pointer released
        }
        setDraggingIndex(null);
    };

    const handleConfirm = async () => {
        if (!processedUrl) return;
        setConfirming(true);
        try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = processedUrl;
            await new Promise<void>((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject(new Error('Failed to load processed image'));
            })

            const xs = corners.map((c) => c.x);
            const ys = corners.map((c) => c.y);
            const minX = Math.min(...xs) * img.naturalWidth;
            const minY = Math.min(...ys) * img.naturalHeight;
            const maxX = Math.max(...xs) * img.naturalWidth;
            const maxY = Math.max(...ys) * img.naturalHeight;
            const w = Math.max(1, Math.round(maxX - minX));
            const h = Math.max(1, Math.round(maxY - minY));

            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('Canvas 2D context unavailable');
            }

            ctx.drawImage(
                img,
                Math.round(minX),
                Math.round(minY),
                w,
                h,
                0,
                0,
                w,
                h,
            );

            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            onConfirm(dataUrl);
        } catch (e) {
            setError(
                e instanceof Error
                  ? `Crop failed: ${e.message}`
                  : 'Crop failed -> please try again',
            );
        } finally {
            setConfirming(false);
        }
    };
}