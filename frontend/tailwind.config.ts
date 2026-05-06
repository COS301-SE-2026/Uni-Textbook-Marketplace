import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                DEFAULT: '#00B4D8',   // Cyan - buttons, links, accents
                hover:   '#0096B4',   // Cyan hover 
                light:   '#90E0EF',   // Light cyan - backgrounds, subtle highlights
                dark:    '#0077A8',   // Dark cyan - active states, badges
        },
            navy: {
                DEFAULT: '#000f2b',   // Dark navy - all headings
                },
                
                text: {
                dark:   '#3a3a3a',    // Body text
                subtle: '#4B4F58',    // Meta, captions, placeholders
                },
                
                background: {
                light: '#F5F5F5',     // Card/panel backgrounds
                input: '#FFFFFF',     // Input backgrounds
                },
                
                border: {
                DEFAULT: '#dddddd',   // Standard borders
                subtle:  '#E5E5E5',   // Subtle separators
                },
            },

            fontFamily: {
                sans: ['Montserrat', 'sans-serif'],
            },
            fontSize: {
                'h1':  ['3.125rem',  { lineHeight: '1.2em', fontWeight: '700' }],
                'h2':  ['1.75rem',   { lineHeight: '1.3em', fontWeight: '700' }],
                'h3':  ['1.375rem',  { lineHeight: '1.3em', fontWeight: '600' }],
                'h4':  ['1.125rem',  { lineHeight: '1.3em', fontWeight: '600' }],
                'h5':  ['1rem',      { lineHeight: '1.4em', fontWeight: '600' }],
                'h6':  ['0.875rem',  { lineHeight: '1.4em', fontWeight: '600' }],
                'btn': ['0.875rem',  { lineHeight: '1em',   fontWeight: '600' }],
            },

            borderRadius: {
                'none': '0px',
                'sm':   '2px',
                DEFAULT: '4px',        // Standard - buttons, inputs
                'md':   '6px',         // Cards
                'lg':   '8px',         // Modals
                'xl':   '12px',        // Large containers
                'full': '9999px',      // Pills - badges
            },

            maxWidth: {
                'content':   '1200px',
                'container': '1240px',
                'narrow':    '750px',
            },
        },
    },
    plugins: [],
}

export default config