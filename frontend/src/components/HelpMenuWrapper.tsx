'use client'

import { usePathname } from 'next/navigation'
import HelpMenu from './HelpMenu'

const RESTRICTED_ROUTES = [
    '/',
    '/admin/review',
    '/admin/log',
    '/auth/login',
    '/auth/register',
    '/auth/resetpassword',
    '/listings/create',
    '/messages',
    '/saved-searches',
    '/help',
    '/brand'
]

export default function HelpMenuWrapper() {

    const pathName = usePathname()

    if (RESTRICTED_ROUTES.includes(pathName)) {
        return null
    }

    return <HelpMenu />
}