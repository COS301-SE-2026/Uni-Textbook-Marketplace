export interface CreateReportData {
    listing_id: string
    reason: string
}

export async function createReport(data: CreateReportData) {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reports`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(data),
        },
    )

    if (!response.ok) {
        throw new Error('Failed to submit report')
    }

    return response.json()
}