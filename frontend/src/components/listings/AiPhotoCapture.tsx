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

const FALLBACK_MESSAGE = 'Auto-fill unavailable, please enter details manually.'
const MATCHED_MESSAGE = 'We found your book. Please check the details below.'
const EXTRACTED_MESSAGE = 'We read these details from your cover. Please check them before continuing.'
const NOTHING_READ_MESSAGE = "We couldn't read any book details from that photo, please enter them manually."

function hasAnyDetail(details: ExtractedBookDetails | null): boolean {
    return details !== null && Object.values(details).some(Boolean)
}

export default function AiPhotoCapture({ onResult, disabled = false }: AiPhotoCaptureProps) {
    const cameraInputRef = useRef<HTMLInputElement>(null)
    const galleryInputRef = useRef<HTMLInputElement>(null)

    const [sourceUrl, setSourceUrl] = useState<string | null>(null)
    const [processing, setProcessing] = useState(false)
    const [notice, setNotice] = useState<string | null>(null)

    
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
        setProcessing(true)
        setNotice(null)

        let file: File
        try {
            file = await dataUrlToFile(croppedDataUrl, 'scan')
        } catch (err) {
            console.error('[AiPhotoCapture] Could not prepare cropped photo', err)
            setNotice('Something went wrong with that photo, please try again or add photos manually.')
            setProcessing(false)
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

            failedStep = 'extract-text'
            const result = await extractText(uploadedUrl)
            rawText = result.rawText
            matchedBook = result.matchedBook
            extracted = result.extracted ?? null

            if (matchedBook) setNotice(MATCHED_MESSAGE)
            else if (hasAnyDetail(extracted)) setNotice(EXTRACTED_MESSAGE)
            else setNotice(NOTHING_READ_MESSAGE)
        } catch (err) {
            
            console.error(`[AiPhotoCapture] Auto-fill failed at step "${failedStep}"`, err, { uploadedUrl })
            const detail = err instanceof Error ? err.message : ''
            setNotice(
                process.env.NODE_ENV === 'production'
                    ? FALLBACK_MESSAGE
                    : `${FALLBACK_MESSAGE} (dev: ${failedStep} failed${detail ? `, ${detail}` : ''})`,
            )
        }

        onResult({ file, uploadedUrl, rawText, matchedBook, extracted })
        setProcessing(false)
    }

    const busy = disabled || processing

    return (
        <div className="flex flex-col gap-3 rounded-[6px] border border-[#dddddd] bg-[#F5F5F5] p-4">
            <div>
                <h4>Scan with AI</h4>
                <p className="text-sm text-[#4B4F58]">
                    Photograph your book&apos;s front cover and we&apos;ll try to fill in the details.
                    You can still enter everything manually.
                </p>
            </div>

            <div className="flex flex-wrap gap-3">
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
                    className="min-h-[44px]"
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

            {processing && (
                <output className="text-sm text-[#3a3a3a]">
                    Reading your book cover…
                </output>
            )}
            {notice && !processing && (
                <output className="text-sm text-[#3a3a3a]">
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