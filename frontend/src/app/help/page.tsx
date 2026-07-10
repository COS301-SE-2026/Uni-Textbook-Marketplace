import Link from 'next/link'
import Image from 'next/image'
import { HelpCircle, MessageCircle, Mail, BookOpen, Shield } from 'lucide-react'
import Footer from '@/components/Footer'

const HIERARCHY_FAQS = [
    {
        question: 'What exactly is the Uni Textbook Marketplace?',
        answer: 'It is a peer-to-peer platform designed strictly for students to buy, sell, or trade textbooks safely.',
    },
    {
        question: 'Who is allowed to create an account?',
        answer: 'Access is limited to registered students. You must verify your account using your official university student email address ending in @university.ac.za or @tuks.co.za.',
    },
    {
        question: 'How long do I wait for my listing to get approved?',
        answer: 'Our admin team usually clears the pending review queue within 24 to 48 hours. You will receive an immediate notice if it gets rejecteed or goes live.',
    },
    {
        question: 'How do I safely reach out to a book seller?',
        answer: 'Hit the "Message Seller" button directly on the listing page. Transactions happen within our built-in system, so your phone number stays hidden.',
    },
    {
        question: 'Where should I meet up to exchange textbooks?',
        answer: 'We highly suggest public spaces on your main university campus.',
    },
    {
        question: 'What does a "Pending" status badge mean?',
        answer: 'It means your book post is stuck in the moderation queue. Other students cannot browse or buy it until an administrator reviews and flags it clean.',
    },
]

export default function HelpPage() {}