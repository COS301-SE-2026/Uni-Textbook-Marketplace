const MAX_SIDE_PX = 1600

export async function dataUrlToFile(dataUrl: string, namePrefix = 'photo'): Promise<File> {
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

    return new File([blob], `${namePrefix}-${Date.now()}.jpg`, { type: 'image/jpeg' })
}