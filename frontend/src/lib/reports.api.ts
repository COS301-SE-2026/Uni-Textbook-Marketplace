const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function getReports() {
    const response = await fetch(`${API_URL}/admin/reports`, {
        credentials: 'include',
    })

    if (!response.ok) {
        throw new Error('Failed to fetch reports')
    }

    return response.json()
}

export async function getReport(id: string) {
    const response = await fetch(`${API_URL}/admin/reports/${id}`, {
        credentials: 'include',
    })

    if (!response.ok) {
        throw new Error('Failed to fetch report')
    }

    return response.json()
}

export async function dismissReport(id: string) {
    const response = await fetch(
        `${API_URL}/admin/reports/${id}/dismiss`,
        {
            method: 'PATCH',
            credentials: 'include',
        },
    )

    if (!response.ok) {
        throw new Error('Failed to dismiss report')
    }

    return response.json()
}

export async function createReport(data: {
    listing_id: string
    reason: string
}) {
    const response = await fetch(`${API_URL}/reports`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        throw new Error('Failed to submit report')
    }

    return response.json()
}