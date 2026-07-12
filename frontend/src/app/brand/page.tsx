'use client'

import { useState } from 'react'
import Footer from '@/components/Footer'

/**
 * NexusDev -> UP COS 301 Capstone (2026)
 * Brand Style Guidde
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
    { name: 'Link / Secondary Cyan', hex: '#005D8S', usage: 'Inline links & secondary buttons (Refined for AA compliance)', ratio: '5.1:1 on white'},
    { name: 'Danger Red', hex: '#dc2626', usage: 'Delete or withdraw listing actions', ratio: '4.6:1'},
    { name: 'Badge, Pending', hex: '#D0F0F7 / #004F66', usage: 'Queue moderation badge state', ratio: '7.1:1'},
    { name: 'Badge, Approved', hex: '#D0F0DC / #155E2E', usage: 'Live listing badge state', ratio: '7.4:1'},
    { name: 'Badge, Rejected', hex: '#FDE8E8 / #7F1D1D', usage: 'Moderator rejection badge state', ratio: '8.1:1'},
]

export default function BrandPage() {

    const [reducedMotion, setReducedMotion] = useState(false)

    return (
        <div className="min-h-screen bg-white text-slate-800">
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
            .font-mono-brand { font-family: 'IBM Plex Mono', monospace;}`}</style>

            {/* Header */}
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
                                Specifically, our primary brand cyan (<span className="font-mono-brand text-[14px] bg-slate-100 px-1 py-0.5 rounded">#00B4D8</span>) caused severe text visibilty issues on white panels. To address this for WCAG AA compliance, we split it to include a deeper secondary cyan (<span className="font-mono-brand text-[11px] bg-slate-100 px-1 py-0.5 rounded">#006D8A</span>) to safely handle text elements, navigation references, and links.
                            </p>
                            <p>
                                The landing page layout also went through multiple structural iterations. Initial ideas favored complex serif display patterns, highlighting overlays, and stacked sample cards. To keep production assets clean, the final shipped hero uses a full-bleed campus photo with clean Montserrat text layers, emphasizing our slogan: <strong>&ldquo;Made for Students, by Students&rdquo;</strong>. Deploying this documentation page directly within the app pipeline allows us to track visual consistency across components in real-time.
                            </p>
                        </div>
                    </section>

                    {/* Swatches */}
                    
                    <section aria-labelledby="colour-heading">
                        <h2 id="colour-heading" className="text-xl font-extrabold text-[#000f2b] tracking-tight mb-2">Colour Palette</h2>
                        <p className="text-slate-500 text-sm mb-6">
                            Core tokens carried over from the initial design sprint,along with text compliance fixes. Contrast mappings are documented inside <code className="font-mono-brand text-xs text-[#006D8A]">globals.css</code>.

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

                    {/* Token Drift Alerts */}

                    <div className="border-l-4 border-rose-500 bg-rose-50/50 p-4 rounded-r-l-xl space-y-3">
                            
                            <div>
                                <p className="text-sm font-bold text-rose-900 mb-1"> Token Drift Warning: globals.css overrides</p>
                                <p className="text-[14px] text-rose-700 leading-relaxed">
                                    Headings currently resolve to <span className="font-mono-brand text-sm">#171717</span> via root configuration variables instead of using the designated brand Dark Navy colour. Additionally, layout grid dividers reference standard tailwind gray variants instead of our declared background borders. This mismatch will be updated in the next dev synchronisation pass.
                                </p>
                            </div>
                    </div>
            </main>
            <Footer />
        </div>
    )
}