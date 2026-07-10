'use client'

import { usePathname } from 'next/navigation'
import HelpMenu from './HelpMenu'

const RESTRICTED_ROUTES = [
    '/',
    '/admin/review',
    '/auth/login',
    '/auth/register',
    '/auth/resetpassword'
]

export default function HelpMenuWrapper() {

    const pathName = usePathname()

    if (RESTRICTED_ROUTES.includes(pathName)) {
        return null
    }

    return <HelpMenu />
}