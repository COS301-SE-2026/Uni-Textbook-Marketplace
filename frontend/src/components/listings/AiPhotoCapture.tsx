'use client'

import { useEffect, useRef, useState } from 'react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import CornerCropEditor from '@/components/listings/CornerCropEditor'
import { uploadImages } from '@/lib/listings.api'
import { extractText, type MatchedBook } from '@/lib/vision.api'

export interface AiScanResult {
    file: File
    uploadedUrl: string | null
    rawText: string
    matchedBook: MatchedBook | null
}

interface AiPhotoCaptureProps {
    readonly onResult: (result: AiScanResult) => void
    readonly disabled?: boolean
}

const MAX_SIDE_PX = 1600
const FALLBACK_MESSAGE = 'Auto-fill unavailable, please enter details manually.'
const NO_MATCH_MESSAGE = "We couldn't match this book, please enter details manually."

async function dataUrlToFile(dataUrl: string): Promise<File> {
    const img = new Image()
    img.src = dataUrl
    await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('Failed to read cropped image'))
    })

    const scale = Math.min(1, MAX_SIDE_PX / Math.max(img.naturalWidth, img.naturalHeight))

    let blob: Blob
    if (scale === 1) {
        blob = await (await fetch(dataUrl)).blob()
    } else {
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.naturalWidth * scale)
        canvas.height = Math.round(img.naturalHeight * scale)
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Canvas 2D context unavailable')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
                (b) => (b ? resolve(b) : reject(new Error('Image encoding failed'))),
                'image/jpeg',
                0.9,
            )
        })
    }

    return new File([blob], `scan-${Date.now()}.jpg`, { type: 'image/jpeg' })
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
            file = await dataUrlToFile(croppedDataUrl)
        } catch (err) {
            console.error('[AiPhotoCapture] Could not prepare cropped photo', err)
            setNotice('Something went wrong with that photo, please try again or add photos manually.')
            setProcessing(false)
            return
        }

        let uploadedUrl: string | null = null
        let rawText = ''
        let matchedBook: MatchedBook | null = null

        let failedStep = 'upload'
        try {
            const { urls } = await uploadImages([file])
            uploadedUrl = urls[0] ?? null
            if (!uploadedUrl) throw new Error('Upload returned no URL')

            failedStep = 'extract-text'
            const result = await extractText(uploadedUrl)
            rawText = result.rawText
            matchedBook = result.matchedBook
            if (!matchedBook) setNotice(NO_MATCH_MESSAGE)
        } catch (err) {
           
            console.error(`[AiPhotoCapture] Auto-fill failed at step "${failedStep}"`, err, { uploadedUrl })
            const detail = err instanceof Error ? err.message : ''
            setNotice(
                process.env.NODE_ENV === 'production'
                    ? FALLBACK_MESSAGE
                    : `${FALLBACK_MESSAGE} (dev: ${failedStep} failed${detail ? `, ${detail}` : ''})`,
            )
        }

        onResult({ file, uploadedUrl, rawText, matchedBook })
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