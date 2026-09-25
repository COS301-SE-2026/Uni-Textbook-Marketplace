'use client'

import { useEffect, useRef, useState } from 'react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import CornerCropEditor from '@/components/listings/CornerCropEditor'
import { uploadImages } from '@/lib/listings.api'
import { extractText, type ExtractedBookDetails, type MatchedBook } from '@/lib/vision.api'
import { dataUrlToFile } from '@/utils/dataUrlToFile'

export interface AiScanResult {
    file: File
    uploadedUrl: string | null
    rawText: string
    matchedBook: MatchedBook | null
    extracted: ExtractedBookDetails | null
}

interface AiPhotoCaptureProps {
    readonly onResult: (result: AiScanResult) => void
    readonly disabled?: boolean
}

type Stage = 'idle' | 'uploading' | 'reading' | 'done'
type NoticeTone = 'success' | 'info' | 'neutral' | 'error'

const FALLBACK_MESSAGE = 'Auto-fill unavailable, please enter details manually.'
const MATCHED_MESSAGE = 'We found your book. Please check the details below.'
const EXTRACTED_MESSAGE = 'We read these details from your cover. Please check them before continuing.'
const NOTHING_READ_MESSAGE = "We couldn't read any book details from that photo, please enter them manually."

const STAGE_MESSAGES: Record<Stage, string> = {
    idle: '',
    uploading: 'Uploading your photo…',
    reading: 'Scanning the cover for title, author and ISBN…',
    done: '',
}

const TONE_STYLES: Record<NoticeTone, string> = {
    success: 'bg-emerald-400/15 text-emerald-100 border border-emerald-300/30',
    info: 'bg-[#00B4D8]/15 text-white border border-[#00B4D8]/40',
    neutral: 'bg-white/10 text-white/80 border border-white/20',
    error: 'bg-red-400/15 text-red-100 border border-red-300/30',
}

function hasAnyDetail(details: ExtractedBookDetails | null): boolean {
    return details !== null && Object.values(details).some(Boolean)
}

export default function AiPhotoCapture({ onResult, disabled = false }: AiPhotoCaptureProps) {
    const cameraInputRef = useRef<HTMLInputElement>(null)
    const galleryInputRef = useRef<HTMLInputElement>(null)

    const [sourceUrl, setSourceUrl] = useState<string | null>(null)
    const [stage, setStage] = useState<Stage>('idle')
    const [notice, setNotice] = useState<string | null>(null)
    const [noticeTone, setNoticeTone] = useState<NoticeTone>('neutral')

    useEffect(() => {
        return () => {
            if (sourceUrl) URL.revokeObjectURL(sourceUrl)
        }
    }, [sourceUrl])

    function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        e.target.value = ''
        if (!file) return

        setNotice(null)
        setSourceUrl(URL.createObjectURL(file))
    }

    function handleCancel() {
        setSourceUrl(null)
    }

    async function handleConfirm(croppedDataUrl: string) {
        setSourceUrl(null)
        setStage('uploading')
        setNotice(null)

        let file: File
        try {
            file = await dataUrlToFile(croppedDataUrl, 'scan')
        } catch (err) {
            console.error('[AiPhotoCapture] Could not prepare cropped photo', err)
            setNotice('Something went wrong with that photo, please try again or add photos manually.')
            setNoticeTone('error')
            setStage('done')
            return
        }

        let uploadedUrl: string | null = null
        let rawText = ''
        let matchedBook: MatchedBook | null = null
        let extracted: ExtractedBookDetails | null = null

        let failedStep = 'upload'
        try {
            const { urls } = await uploadImages([file])
            uploadedUrl = urls[0] ?? null
            if (!uploadedUrl) throw new Error('Upload returned no URL')

            setStage('reading')
            failedStep = 'extract-text'
            const result = await extractText(uploadedUrl)
            rawText = result.rawText
            matchedBook = result.matchedBook
            extracted = result.extracted ?? null

            if (matchedBook) {
                setNotice(MATCHED_MESSAGE)
                setNoticeTone('success')
            } else if (hasAnyDetail(extracted)) {
                setNotice(EXTRACTED_MESSAGE)
                setNoticeTone('info')
            } else {
                setNotice(NOTHING_READ_MESSAGE)
                setNoticeTone('neutral')
            }
        } catch (err) {
            console.error(`[AiPhotoCapture] Auto-fill failed at step "${failedStep}"`, err, { uploadedUrl })
            const detail = err instanceof Error ? err.message : ''
            setNotice(
                process.env.NODE_ENV === 'production'
                    ? FALLBACK_MESSAGE
                    : `${FALLBACK_MESSAGE} (dev: ${failedStep} failed${detail ? `, ${detail}` : ''})`,
            )
            setNoticeTone('error')
        }

        onResult({ file, uploadedUrl, rawText, matchedBook, extracted })
        setStage('done')
    }

    const working = stage === 'uploading' || stage === 'reading'
    const busy = disabled || working

    return (
        <div
            className="relative overflow-hidden rounded-xl p-5 sm:p-6"
            style={{ background: 'linear-gradient(135deg, #000f2b 0%, #004F66 60%, #00B4D8 130%)' }}
        >
            <div
                className="pointer-events-none absolute inset-0 opacity-10"
                style={{ backgroundImage: 'radial-gradient(circle at 15% 20%, rgba(255,255,255,0.4) 0%, transparent 45%)' }}
            />

            <div className="relative z-10 flex items-start gap-3 mb-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-lg">
                    ✨
                </span>
                <div>
                    <h4 className="text-white font-bold text-base sm:text-lg tracking-tight">
                        Scan with AI
                    </h4>
                    <p className="text-white/80 text-xs sm:text-sm mt-0.5">
                        Photograph your book&apos;s front cover and we&apos;ll try to fill in the
                        details. You can still enter everything manually.
                    </p>
                </div>
            </div>

            <div className="relative z-10 flex flex-wrap gap-3">
                <Button
                    type="button"
                    variant="primary"
                    className="min-h-[44px]"
                    disabled={busy}
                    onClick={() => cameraInputRef.current?.click()}
                >
                    Take photo
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    className="min-h-[44px] !border-white/50 !text-[#00B4D8] hover:!bg-white/10"
                    disabled={busy}
                    onClick={() => galleryInputRef.current?.click()}
                >
                    Choose from gallery
                </Button>
            </div>

            <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelected}
                className="hidden"
                aria-label="Take a photo of the book cover"
            />
            <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelected}
                className="hidden"
                aria-label="Choose a photo of the book cover from your gallery"
            />

            {working && (
                <output className="relative z-10 mt-4 flex items-center gap-2 text-sm font-semibold text-white">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00B4D8] opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#00B4D8]" />
                    </span>
                    {STAGE_MESSAGES[stage]}
                </output>
            )}

            {notice && stage === 'done' && (
                <output className={`relative z-10 mt-4 block rounded-lg px-3 py-2 text-sm font-medium ${TONE_STYLES[noticeTone]}`}>
                    {notice}
                </output>
            )}

            <Modal isOpen={sourceUrl !== null} title="Adjust the corners" onClose={handleCancel}>
                {sourceUrl && (
                    <CornerCropEditor
                        imageUrl={sourceUrl}
                        onConfirm={handleConfirm}
                        onCancel={handleCancel}
                    />
                )}
            </Modal>
        </div>
    )
}