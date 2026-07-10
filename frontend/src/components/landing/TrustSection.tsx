import Link from 'next/link'
import { Shield, MessageSquare, ShieldCheck, Mail } from 'lucide-react'

const CAMPUS_SECURITY = [
    {
        icon: <Mail className="w-5 h-5 text-white" />,
        title: 'University Email Verification',
        desc: 'You can only register with a student email address, which locks out scammers and external commericial spammers.',
    },
    {
        icon: <MessageSquare className="w-h h-5 text-white" />,
        title: 'In-app Handshakes',
        desc: 'Chat safely directly inside our system so you do not have to share personal phone number or WhatsApp out to strangers.',

    },
];

export default function TrustSection() {

}