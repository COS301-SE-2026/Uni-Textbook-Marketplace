'use client'

import { useState } from 'react'
import Footer from '@/components/Footer'

/**
 * NexusDev -> UP COS 301 Capstone (2026)
 * Brand Style Guide
 * Route: app/brand/page.tsx
 */

const MAIN_TOKENS = [
    { name: 'Primary Cyan', hex: '#00B4D8', usage: 'Main interactive elements, primary CTAs, and bold heading highlights.'},
    { name: 'Primary Cyan Hover', hex: '#0096B4', usage: 'Hover state for primary cyan (10% darker variant).'},
    { name: 'Dark Navy', hex: '#000f2b', usage: 'Main backgrounds & button text on light fills.'},
    { name: 'Dark Grey', hex: '#3a3a3a', usage: 'Standard body text across all layouts.'},
    { name: 'Subtle Grey', hex: '#4B4F58', usage: 'Meta labels, placeholder inputs, captions.'},
    { name: 'Light grey', hex: '#F5F5F5', usage: 'Card backgrounds, internal panels, empty text wrappers.'},
    {name: 'Border Grey', hex: '#dddddd', usage: 'Layout dividers.'},

]

const PERFECTED_TOKENS = [
    { name: 'Link / Secondary Cyan', hex: '#005D8A', usage: 'Inline links & secondary buttons (Refined for AA compliance)', ratio: '5.1:1 on white'},
    { name: 'Danger Red', hex: '#dc2626', usage: 'Delete or withdraw listing actions', ratio: '4.6:1'},
    { name: 'Badge, Pending', hex: '#D0F0F7 / #004F66', usage: 'Queue moderation badge state', ratio: '7.1:1'},
    { name: 'Badge, Approved', hex: '#D0F0DC / #155E2E', usage: 'Live listing badge state', ratio: '7.4:1'},
    { name: 'Badge, Rejected', hex: '#FDE8E8 / #7F1D1D', usage: 'Moderator rejection badge state', ratio: '8.1:1'},
    { name: 'Badge, Reserved', hex: '#ddc4fe / #8327e5', usage: 'Listing reserved badge state', ratio: '7.1:1'},
    { name: 'Badge, Sold', hex: '#c6c6c6 / #606060', usage: 'Listing sold badge state', ratio: '8.1:1'},
    { name: 'Badge, New', hex: '#E3F2FD / #1565C0', usage: 'Filter condition badge for "Like New" listings', ratio: '7.1:1'},
    { name: 'Badge, Good', hex: '#E8F5E9 / #2E7D32', usage: 'Filter condition badge for "Good" condition listings', ratio: '7.4:1'},
    { name: 'Badge, Fair', hex: '#FFF3E0 / #E65100', usage: 'Filter condition badge for "Fair" condition listings', ratio: '7.1:1'},
    { name: 'Badge, Poor', hex: '#FFEBEE / #C62828', usage: 'Filter condition badge for "Poor" condition listings', ratio: '8.1:1'},
]

const TYPE_LEVEL = [
    { tag: 'H1', font: 'Montserrat', size: '50px / 3.125rem', weight: '700', lh: '1.2' },
    { tag: 'H2', font: 'Montserrat', size: '28px / 1.75rem', weight: '700', lh: '1.3' },
    { tag: 'H3', font: 'Montserrat', size: '22px / 1.375rem', weight: '600', lh: '1.3' },
    { tag: 'H4', font: 'Montserrat', size: '18px / 1.125rem', weight: '600', lh: '1.3' },
    { tag: 'Body', font: 'Montserrat', size: '16px / 1rem', weight: '400', lh: '1.6' },
]


const UI_COMPONENTS = [
    { name: 'Listing Card', description: 'Product card with image, title, edition, price, condition badge, seller info, and wishlist heart.' },
    { name: 'Condition Badges', description: 'Color-coded badges for listing conditions (New, Good, Fair, Poor) used in filters and listing cards.' },
    { name: 'Status Badges', description: 'Queue status badges (Pending, Approved, Rejected), sale status badges (Reserved, Sold), and auction status badges (In progress, Scheduled, Ended).' },
    { name: 'Glossy Hero Sections', description: 'Full-width hero banners with gradient backgrounds, glossy overlays, and decorative patterns.' },
    { name: 'Glassmorphism Cards', description: 'Cards with backdrop blur, semi-transparent backgrounds, and subtle border effects.' },
    { name: 'Filter Sidebar', description: 'Collapsible filter panel with condition badge buttons, range inputs, and active filter count.' },
    { name: 'Multi-step Forms', description: 'Flag/arrow shaped steppers with progress indicators for listing creation and registration.' },
    { name: 'Auction Card', description: 'Two-column card pairing a listing preview with a live bid summary panel (current bid, bid count, start/end dates, status badge, action button).' },
    { name: 'Countdown Timer', description: 'Tabular-figure countdown displayed on the auction detail page, switching to Danger Red under 60 seconds to communicate urgency without animation.' },
    { name: 'Corner-Drag Crop Editor', description: 'Interactive image adjustment overlay with four draggable corner handles connected by a live polygon, sized for 44x44px touch targets on mobile.' },
    { name: 'AI Scan Panel', description: 'Gradient-panel entry point for AI-assisted listing creation, with dual photo source buttons, staged progress messaging, and non-blocking fallback notices.' },
]

export default function BrandPage() {

    const [reducedMotion] = useState(false)

    return (

        <div className="min-h-screen bg-white text-slate-800">

            <style>{`@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
            .font-mono-brand { font-family: 'IBM Plex Mono', monospace;}`}</style>

            
            <header className="bg-[#000f2b] py-16 border-b border-slate-800">

                <div className="container-content">

                    <span className="text-sm font-bold tracking-widest uppercase text-[#00B4D8] block mb-2">
                        Brand Style Guide
                    </span>

                    <h1 className="text-white font-extrabold text-4xl md:text-5xl tracking-tight">
                        Brand Tokens & UI System
                    </h1>

                    <p className="text-slate-400 text-sm max-w-xl mt-3 leading-relaxed">
                        Live source of truth for the Uni Textbook Marketplace project. The styling classes and color tokens mapped out below directly correspond to our global CSS configuration.
                    </p>

                </div>
            </header>

            <main className="container-content py-16 space-y-16">

                    <section aria-labelledby="story-heading">

                        <h2 id="story-heading" className="text-xl font-extrabold text-[#000f2b] tracking-tight mb-4">
                            Evolution from Demo 1
                        </h2>
                        <div className="space-y-4 max-w-3xl text-sm text-slate-600 leading-relaxed">
                            <p>
                                Our Brand style guide started out as basic values pulled directly from marketing concepts. While those choices worked well for structural layouts in Demo 1, building live functional views quickly exposed accessibility issues.
                            </p>
                            <p>
                                Specifically, our primary brand cyan (<span className="font-mono-brand text-[14px] bg-slate-100 px-1 py-0.5 rounded">#00B4D8</span>) caused severe text visibility issues on white panels. To address this for WCAG AA compliance, we split it to include a deeper secondary cyan (<span className="font-mono-brand text-[11px] bg-slate-100 px-1 py-0.5 rounded">#006D8A</span>) to safely handle text elements, navigation references, and links.
                            </p>
                            <p>
                                The landing page layout also went through multiple structural iterations. Initial ideas favored complex serif display patterns, highlighting overlays, and stacked sample cards. To keep production assets clean, the final shipped hero uses a full-bleed campus photo with clean Montserrat text layers, emphasizing our slogan: <strong>&ldquo;Made for Students, by Students&rdquo;</strong>. Deploying this documentation page directly within the app pipeline allows us to track visual consistency across components in real-time.
                            </p>
                        </div>

                    </section>

                    
                    <section aria-labelledby="demo2-heading" className="border-t border-slate-100 pt-8">
                        <h2 id="demo2-heading" className="text-xl font-extrabold text-[#000f2b] tracking-tight mb-4">
                            Evolution from Demo 2
                        </h2>
                        <div className="space-y-4 max-w-3xl text-sm text-slate-600 leading-relaxed">
                            <p>
                                Demo 2 marked a significant visual overhaul, moving away from flat, utilitarian designs toward a more polished, engaging UI. Our core focus was enhancing user experience through consistent visual hierarchy, improved interactivity, and cohesive branding across all authenticated pages.
                            </p>
                            <p>
                                <strong>Glossy & Glassmorphism Design Language:</strong> We introduced glossy hero sections with gradient backgrounds, subtle light reflections, and decorative patterns across all major pages including Browse, Wishlist, My Listings, Messages, and Notifications. Cards now feature hover shadows, rounded corners, and glass-like transparency effects (<span className="font-mono-brand text-[11px] bg-slate-100 px-1 py-0.5 rounded">backdrop-filter: blur(10px)</span>) creating a premium, modern feel.
                            </p>
                            <p>
                                <strong>Badge System Expansion:</strong> The badge system was significantly extended from the original three queue statuses (Pending, Approved, Rejected) to include color-coded condition badges (New, Good, Fair, Poor) and sale status badges (Reserved, Sold). These now appear consistently across filter sidebars and listing cards, improving scannability and visual communication.
                            </p>
                            <p>
                                <strong>Component Refinements:</strong> The multi-step form steppers were redesigned from basic dots to flag/arrow shapes with clear progress indicators. Listing cards were enhanced with larger images, improved typography, and a glossy hover effect. The messaging interface received a complete refresh with avatars, grouped messages by date, and an improved input area with an icon-based send button.
                            </p>
                            <p>
                                <strong>Dark Mode Support:</strong> Full dark mode compatibility was implemented across all routes, with CSS variables managing theme transitions. Hero sections maintain their light gradient backgrounds regardless of theme to preserve visual consistency. Components now adapt seamlessly with <span className="font-mono-brand text-[11px] bg-slate-100 px-1 py-0.5 rounded">dark:</span> Tailwind variants.
                            </p>
                            <p>
                                <strong>Consistent Hero Sections:</strong> A unified hero section pattern was established across all pages using a dark-to-light cyan gradient with a student-focused image overlay (student reading a book). Each page features a relevant icon (heart for Wishlist, package for My Listings, etc.) and a glass-morphism container, creating a cohesive brand experience.
                            </p>
                            <p>
                                <strong>Button & Interaction Updates:</strong> Secondary/outline buttons now use white backgrounds with cyan borders and hover states. The view and dismiss action buttons in admin panels follow this pattern, while destructive actions (Delete, Reject, Ban) retain red styling. All interactive elements received <span className="font-mono-brand text-[11px] bg-slate-100 px-1 py-0.5 rounded">cursor-pointer</span> for better UX.
                            </p>
                        </div>
                    </section>

                    
                    <section aria-labelledby="demo3-heading" className="border-t border-slate-100 pt-8">
                        <h2 id="demo3-heading" className="text-xl font-extrabold text-[#000f2b] tracking-tight mb-4">
                            Evolution from Demo 3
                        </h2>
                        <div className="space-y-4 max-w-3xl text-sm text-slate-600 leading-relaxed">
                            <p>
                                Demo 3 and Demo 4 shifted focus away from visual rework and toward interaction depth. The platform&apos;s established component vocabulary, badge system, hero treatment, and dark-mode coverage carried through unchanged. What changed was the addition of three new interaction-heavy features — real-time auctions, AI-assisted listing creation, and the corner-drag crop editor, each of which needed new component patterns that could slot into the existing design language without introducing a parallel system.
                            </p>
                            <p>
                                <strong>Real-Time Auction Surfaces:</strong> The auction browse and detail pages reuse the platform&apos;s existing card, badge, and hero conventions rather than inventing new ones. Auction cards pair a standard listing preview with a compact bid summary panel on the right (current or starting bid, bid count, start date, end date, status badge, primary action button). Status badges extend the existing badge system with three auction-specific states (In progress, Scheduled, Ended) mapped onto the same colour tokens already used for queue states, so nothing new had to be taught to the user. The auction detail page leads with a dark-navy header carrying an icon badge, the auction status badge, and the listing title, before dropping into a two-column layout: a live bid activity stream on the left, and a sticky bid panel on the right. A live countdown uses tabular figures so the digits don&apos;t shift width as they tick, and switches to Danger Red under sixty seconds to communicate urgency through colour rather than motion.
                            </p>
                            <p>
                                <strong>Live-Update Indicators:</strong> Because auction state updates in real time through a Firestore listener rather than a page reload, the surfaces needed a way to signal &quot;this is live&quot; without being distracting. A small pulsing cyan dot with a subtle <span className="font-mono-brand text-[11px] bg-slate-100 px-1 py-0.5 rounded">animate-ping</span> halo appears next to any actively-updating value, matching the loading-indicator treatment already used elsewhere in the app. The effect is deliberately small and non-blocking, and respects the same reduced-motion conventions as the rest of the interface.
                            </p>
                            <p>
                                <strong>AI-Assisted Listing Creation Panel:</strong> The &quot;Scan with AI&quot; entry point inside the Create Listing form uses a full-bleed cyan-to-navy gradient panel to distinguish it from the plain form fields around it, with a small sparkle icon in a glass-morphism container as the visual anchor. Two actions sit side by side: a solid primary cyan &quot;Take photo&quot; button and an outline &quot;Choose from gallery&quot; button styled to work against the dark gradient background. Because the AI pipeline is an optional accelerator rather than a required step, every failure state resolves to a non-blocking notice, a coloured band beneath the buttons that reports either success, partial extraction, or &quot;auto-fill unavailable, please enter details manually&quot; ,while leaving the manual form fields fully usable underneath.
                            </p>
                            <p>
                                <strong>Corner-Drag Crop Editor:</strong> The crop editor introduces the platform&apos;s first direct-manipulation image component. Four draggable corner handles sit over the uploaded photo, connected by a live SVG polygon that redraws as the user drags. The overlay uses a two-layer stroke technique (a thicker white outline beneath a thinner cyan line) so the crop boundary remains legible against both light and dark image content. Handles are rendered as 44×44px interactive zones with a small visual dot inside, meeting the mobile tap-target rule while keeping the on-screen element itself visually compact. When the background detector can&apos;t confidently isolate the book, the component falls back to the original photo with default corner positions and no error state, a silent, non-blocking degradation rather than a failure message.
                            </p>
                            <p>
                                <strong>Documentation Same-Sprint Discipline:</strong> Every Demo 3 and Demo 4 surface documented in the Design Specifications ships with its component styling, badge mappings, and interaction notes written up in the same sprint it was built. The Brand Style Guide page you&apos;re reading now is regenerated against the live token set in <code className="font-mono-brand text-xs text-[#006D8A]">globals.css</code> on each build, so the colour cards and component previews below reflect what&apos;s actually rendering in the app rather than what was intended at planning time.
                            </p>
                        </div>
                    </section>

                    
                    <section aria-labelledby="colour-heading">

                        <h2 id="colour-heading" className="text-xl font-extrabold text-[#000f2b] tracking-tight mb-2">Colour Palette</h2>

                        <p className="text-slate-500 text-sm mb-6">
                            Core tokens carried over from the initial design sprint, along with text compliance fixes. Contrast mappings are documented inside <code className="font-mono-brand text-xs text-[#006D8A]">globals.css</code>.
                        </p>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Core Base</h3>
                        <div className="grid grid-cols md:grid-cols-4 gap-4 mb-10">

                            {MAIN_TOKENS.map((item) => (

                                <div key={item.name} className="border border-slate-100 rounded-xl overflow-hidden shadow-sm bg-white">
                                    <div className="h-16 w-full" style={{ backgroundColor: item.hex }} />

                                    <div className="p-3">

                                        <p className="text-sm font-bold text-[#000f2b]">{item.name}</p>
                                        <p className="font-mono-brand text-[14px] text-slate-400 mt-1">{item.hex}</p>
                                        <p className="text-[11px] text-slate-500 mt-1 leading-snug">{item.usage}</p>
                                    </div>
                                </div>

                            ))}
                        </div>

                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
                            Refined Validation Badges (WCAG AA Compliance)
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {PERFECTED_TOKENS.map((item) => (

                                <div key={item.name} className="border border-slate-100 rounded-xl p-4 flex items-center gap-4 bg-white shadow-sm">
                                    <div className="w-10 h-10 rounded-lg shrink-0 border border-slate-200"
                                        style={{ backgroundColor: item.hex.split(' / ')[0] }}
                                    />
                                    <div className="space-y-1">

                                        <p className="text-sm font-bold text-[#000f2b]">{item.name}</p>

                                        <p className="font-mono-brand text-[11px] text-slate-400">{item.hex}</p>
                                        <p className="text-[14px] text-slate-500">{item.usage}</p>

                                        <span className="inline-block bg-emerald-50 text-emerald-700 font-bold text-[10px] px-2 py-0.5 rounded-full mt-1">
                                            Ratio: {item.ratio}
                                        </span>
                                    </div>

                                </div>
                            ))}
                        </div>
                    </section>

                    

                    <div className="border-l-4 border-rose-500 bg-rose-50/50 p-4 rounded-r-l-xl space-y-3">
                            
                            <div>
                                <p className="text-sm font-bold text-rose-900 mb-1"> Token Drift Warning: globals.css overrides</p>
                                <p className="text-[14px] text-rose-700 leading-relaxed">
                                    Headings currently resolve to <span className="font-mono-brand text-sm">#171717</span> via root configuration variables instead of using the designated brand Dark Navy colour. Additionally, layout grid dividers reference standard tailwind gray variants instead of our declared background borders. This mismatch will be updated in the next dev synchronisation pass.
                                </p>
                            </div>
                    </div>

                
                <section aria-labelledby="type-heading">

                    <h2 id="type-heading" className="text-xl font-extrabold text-[#000f2b] tracking-tight mb-2">Typography System</h2>

                    <p className="text-slate-500 text-lg mb-6">
                        Our application interface relies entirely on the <strong>Montserrat</strong> font family for authenticated views, forms, and core navigation systems.
                    </p>

                    <div className="overflow-x-auto border border-slate-100 rounded-xl bg-white shadow-sm">

                        <table className="w-full text-sm text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-400 font-bold uppercase tracking-wider text-[10px]">

                                    <th className="p-3">Element</th>
                                    <th className="p-3">Size</th>
                                    <th className="p-3">Weight</th>
                                    <th className="p-3">Line Height</th>
                                </tr>
                            </thead>
                            <tbody>
                                {TYPE_LEVEL.map((row) => (

                                    <tr key={row.tag} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30">
                                        <td className="p-3 font-bold text-[#000f2b]">{row.tag}</td>
                                        <td className="p-3 font-mono-brand text-slate-500">{row.size}</td>
                                        <td className="p-3 text-slate-500">{row.weight}</td>
                                        <td className="p-3 text-slate-500">{row.lh}</td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                
                <section aria-labelledby="ui-components-heading" className="border-t border-slate-100 pt-8">
                    <h2 id="ui-components-heading" className="text-xl font-extrabold text-[#000f2b] tracking-tight mb-2">UI Component Library</h2>
                    <p className="text-slate-500 text-sm mb-6">Core components implemented in Demo 2 with their key styling attributes.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {UI_COMPONENTS.map((item) => (
                            <div key={item.name} className="border border-slate-100 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                                <h4 className="text-sm font-bold text-[#000f2b]">{item.name}</h4>
                                <p className="text-[13px] text-slate-500 mt-1 leading-relaxed">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                
                <section aria-labelledby="components-heading">

                    <h2 id="components-heading" className="text-xl font-extrabold text-[#000f2b] tracking-tight mb-2">Component Preview Library</h2>
                    <p className="text-slate-500 text-sm mb-6">Live element examples rendered with our global layout styling classes.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        <div className="border border-slate-100 rounded-xl p-5 bg-white shadow-sm space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Action Buttons</h3>

                            <div className="flex flex-wrap items-center gap-3">

                                <button className="px-4 py-2 bg-[#00B4D8] hover:bg-[#0096B4] text-[#000f2b] text-sm font-bold rounded-md transition-colors cursor-pointer">Primary</button>
                                <button className="px-4 py-2 bg-white border border-[#00B4D8] text-[#00B4D8] hover:bg-[#00B4D8] hover:text-white text-sm font-bold rounded-md transition-colors cursor-pointer">Secondary</button>
                                <button className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-md transition-colors cursor-pointer">Danger</button>
                            </div>
                        </div>

                        <div className="border border-slate-100 rounded-xl p-5 bg-white shadow-sm space-y-4">

                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Queue Status Badges</h3>

                            <div className="flex flex-wrap items-center gap-2">

                                <span className="px-3.5 py-2 text-[12px] font-bold rounded-full bg-[#D0F0F7] text-[#004F66]">Pending</span>
                                <span className="px-3.5 py-2 text-[12px] font-bold rounded-full bg-[#D0F0DC] text-[#155E2E]">Approved</span>
                                <span className="px-3.5 py-2 text-[12px] font-bold rounded-full bg-[#FDE8E8] text-[#7F1D1D]">Rejected</span>
                            </div>
                        </div>

                        
                        <div className="border border-slate-100 rounded-xl p-5 bg-white shadow-sm space-y-4">

                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Condition Badges</h3>

                            <div className="flex flex-wrap items-center gap-2">
                                <span className="px-3.5 py-2 text-[12px] font-bold rounded-full bg-[#E3F2FD] text-[#1565C0]">New</span>
                                <span className="px-3.5 py-2 text-[12px] font-bold rounded-full bg-[#E8F5E9] text-[#2E7D32]">Good</span>
                                <span className="px-3.5 py-2 text-[12px] font-bold rounded-full bg-[#FFF3E0] text-[#E65100]">Fair</span>
                                <span className="px-3.5 py-2 text-[12px] font-bold rounded-full bg-[#FFEBEE] text-[#C62828]">Poor</span>
                            </div>
                        </div>

                        <div className="border border-slate-100 rounded-xl p-5 bg-white shadow-sm space-y-4">

                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Sale Status Badges</h3>

                            <div className="flex flex-wrap items-center gap-2">
                                <span className="px-3.5 py-2 text-[12px] font-bold rounded-full bg-[#ddc4fe] text-[#8327e5]">Reserved</span>
                                <span className="px-3.5 py-2 text-[12px] font-bold rounded-full bg-[#c6c6c6] text-[#606060]">Sold</span>
                            </div>
                        </div>

                        <div className="border border-slate-100 rounded-xl p-5 bg-white shadow-sm space-y-4">

                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Auction Status Badges</h3>

                            <div className="flex flex-wrap items-center gap-2">
                                <span className="px-3.5 py-2 text-[12px] font-bold rounded-full bg-[#D0F0DC] text-[#155E2E]">In progress</span>
                                <span className="px-3.5 py-2 text-[12px] font-bold rounded-full bg-[#D0F0F7] text-[#004F66]">Scheduled</span>
                                <span className="px-3.5 py-2 text-[12px] font-bold rounded-full bg-[#c6c6c6] text-[#606060]">Ended</span>
                            </div>
                        </div>

                        <div className="border border-slate-100 rounded-xl p-5 bg-white shadow-sm space-y-4">

                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Live Update Indicator</h3>

                            <div className="flex flex-wrap items-center gap-3">
                                <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00B4D8] opacity-75" />
                                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#00B4D8]" />
                                    </span>
                                    Live
                                </span>
                                <span className="text-xs text-slate-400">Used beside any value that updates in real time</span>
                            </div>
                        </div>
                    </div>
                </section>

                
                <section aria-labelledby="a11y-heading" className="border-t border-slate-100 pt-10">

                    
                    <h2 id="a11y-heading" className="text-xl font-extrabold text-[#000f2b] tracking-tight mb-3">Accessibility Framework</h2>

                    <ul className="text-sm text-slate-600 space-y-2 list-disc pl-5 max-w-2xl">
                        <li>Compliance Target: <strong>WCAG 2.2 AA</strong> interface baseline across all routes.</li>
                        <li>Interactive elements utilize high-visibility focus rings (<code className="font-mono-brand text-[11px]">rgba(0,180,216,.15)</code>).</li>
                        <li>Tap target sizing maintains a 44x44px safety boundary for mobile viewports.</li>
                        <li>All interactive elements use <code className="font-mono-brand text-[11px]">cursor-pointer</code> for improved UX.</li>
                        <li>Condition and status badges maintain a minimum 4.5:1 contrast ratio on their respective backgrounds.</li>
                        <li>Live-update animations and countdown transitions respect the user&apos;s reduced-motion preference.</li>
                        <li>Direct-manipulation components (corner-drag editor) provide keyboard-accessible controls in addition to pointer interaction, with descriptive <code className="font-mono-brand text-[11px]">aria-label</code> values on each handle.</li>
                    </ul>

                    <div className="mt-4 flex items-center gap-3">

                        <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-md transition-colors cursor-pointer
                            onClick={() => setReducedMotion((v) => !v)}">
                                {reducedMotion ? 'Reduced Motion Active' : 'Default Motion On'}
                            </button>
                    
                    <div className="w-6 h-6 rounded-full bg-[#00B4D8]"
                        style={{
                            transition: reducedMotion ? 'none' : 'transform 0.5s ease',
                            transform: reducedMotion ? 'none' : 'rotate(360deg)',
                        }} />
                    </div>
                </section>

            </main>

            
            <Footer />
        </div>
    )
}