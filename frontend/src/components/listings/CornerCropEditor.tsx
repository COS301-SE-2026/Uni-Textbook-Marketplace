'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { removeUniformBackground } from '@/utils/removeUniformBackground';

interface CornerPoint {
    x: number;
    y: number;
}

interface CornerCropEditorProps {
  readonly imageUrl: string;
  readonly onConfirm: (croppedDataUrl: string) => void;
  readonly onCancel: () => void;
}

const DEFAULT_CORNERS: CornerPoint[] = [
    { x: 0.1, y: 0.1 },
    { x: 0.9, y: 0.1 },
    { x: 0.9, y: 0.9 },
    { x: 0.1, y: 0.9 },
];

export default function CornerCropEditor({
    imageUrl,
    onConfirm,
    onCancel,
}: CornerCropEditorProps) {
    const [corners, setCorners] = useState<CornerPoint[]>(DEFAULT_CORNERS);
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
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.src = imageUrl;
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                });

                const result = removeUniformBackground(img);

                if (!cancelled) {
                    // null means "background not uniform enough": show the original, no error
                    setProcessedUrl(result?.dataUrl ?? imageUrl);
                    // Start the handles on the detected book corners, else the defaults
                    setCorners(result?.corners ?? DEFAULT_CORNERS);
                    setError(null);
                }
            } catch (e) {
                console.error('[CornerCropEditor] Background removal failed:', e);
                if (!cancelled) {
                    setProcessedUrl(imageUrl);
                    setCorners(DEFAULT_CORNERS);
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
        (index: number) => (e: React.PointerEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.currentTarget.setPointerCapture(e.pointerId);
            setDraggingIndex(index);
        };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (draggingIndex === null) return;
        const coords = getRelativeCoords(e);
        if (!coords) return;

        setCorners((prev) => {
            const next = [...prev];
            next[draggingIndex] = coords;
            return next;
        });
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
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
            });

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

            
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, w, h);

            const ox = Math.round(minX);
            const oy = Math.round(minY);

            
            ctx.save();
            ctx.beginPath();
            corners.forEach((c, i) => {
                const px = c.x * img.naturalWidth - ox;
                const py = c.y * img.naturalHeight - oy;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            });
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(img, ox, oy, w, h, 0, 0, w, h);
            ctx.restore();

            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            onConfirm(dataUrl);
        } catch (e) {
            setError(
                e instanceof Error
                    ? `Crop failed: ${e.message}`
                    : 'Crop failed, please try again',
            );
        } finally {
            setConfirming(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            {loading && (
                <p className="text-sm text-[#3a3a3a]">Preparing image…</p>
            )}
            {error && (
                <p className="text-sm text-red-600" role="alert">
                    {error}
                </p>
            )}

            <div
                ref={containerRef}
                className="relative inline-block select-none touch-none max-w-full outline outline-2 outline-[#00B4D8]"
            >
                <img
                    src={processedUrl ?? imageUrl}
                    alt="Textbook cover"
                    className="block max-w-full max-h-[70vh]"
                    draggable={false}
                />

                {processedUrl && (
                    <svg
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        viewBox="0 0 1 1"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                    >
                       
                        <polygon
                            points={corners.map((c) => `${c.x},${c.y}`).join(' ')}
                            fill="none"
                            stroke="#FFFFFF"
                            strokeWidth="5"
                            strokeLinejoin="round"
                            vectorEffect="non-scaling-stroke"
                        />
                        <polygon
                            points={corners.map((c) => `${c.x},${c.y}`).join(' ')}
                            fill="rgba(0,180,216,0.15)"
                            stroke="#00B4D8"
                            strokeWidth="2"
                            strokeLinejoin="round"
                            vectorEffect="non-scaling-stroke"
                        />
                    </svg>
                )}

                
                {processedUrl &&
                    corners.map((c, i) => (
                        <div
                            key={i}
                            role="button"
                            tabIndex={0}
                            aria-label={`Drag corner ${i + 1}`}
                            className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-grab items-center justify-center touch-none active:cursor-grabbing"
                            style={{ left: `${c.x * 100}%`, top: `${c.y * 100}%` }}
                            onPointerDown={handlePointerDown(i)}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onPointerCancel={handlePointerUp}
                        >
                            <span className="h-4 w-4 rounded-full border-2 border-white bg-[#00B4D8] shadow" />
                        </div>
                    ))}
            </div>

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={confirming}
                    className="min-h-[44px] px-4 py-2 border border-gray-300 rounded-[4px] text-[#3a3a3a] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:ring-offset-2 disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={!processedUrl || loading || confirming}
                    className="min-h-[44px] px-4 py-2 bg-[#00B4D8] text-white rounded-[4px] hover:bg-[#0096B4] focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:ring-offset-2 disabled:opacity-50"
                >
                    {confirming ? 'Cropping…' : 'Confirm Crop'}
                </button>
            </div>
        </div>
    );
}