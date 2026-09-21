'use client'

import { useEffect, useRef, useState } from "react"
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import CornerCropEditor from "./CornerCropEditor"
import { uploadImages } from "@/lib/listings.api"
import { extractText, type MatchedBook } from "@/lib/vision.api"
import { resolve } from "path"

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
const NO_MATCH_MESSAGE = "We couldn't match this book, please enter the details manually."

async function dataUrlToFile(dataUrl: string): Promise<File> {
    const img = new Image()
    img.src = dataUrl
    await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('Failed to read cropped image'))
    })

    const scale = Math.min(1, MAX_SIDE_PX / Math.max(img.naturalWidth, img.naturalHeight))

    let blob: Blob
    if(scale === 1) {
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
}
