import type { Config } from 'tailwindcss'

/**
 * Secure ID theme. Tokens are defined as CSS variables in src/styles/tokens.css
 * and surfaced here as semantic Tailwind names. Tailwind's default palette,
 * radii, shadows and fonts are intentionally NOT extended — only these tokens
 * exist, so nothing reads as "Tailwind default".
 */
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    // Replace, not extend, so stray default utilities don't leak generic styling.
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#FFFFFF',
      black: '#000000',

      paper: 'var(--paper)',
      surface: 'var(--surface)',
      sunken: 'var(--surface-sunken)',

      line: 'var(--line)',
      'line-strong': 'var(--line-strong)',

      ink: {
        DEFAULT: 'var(--ink)',
        2: 'var(--ink-2)',
        3: 'var(--ink-3)',
      },

      brand: {
        50: 'var(--brand-50)',
        500: 'var(--brand-500)',
        600: 'var(--brand-600)',
        700: 'var(--brand-700)',
      },

      ok: { DEFAULT: 'var(--ok)', bg: 'var(--ok-bg)' },
      warn: { DEFAULT: 'var(--warn)', bg: 'var(--warn-bg)' },
      risk: { DEFAULT: 'var(--risk)', bg: 'var(--risk-bg)' },
    },
    borderRadius: {
      none: '0',
      sm: '4px',
      DEFAULT: '6px',
      md: '8px',
      lg: '8px',
      xl: '10px',
      full: '9999px',
    },
    fontFamily: {
      sans: ['Geist', 'system-ui', 'sans-serif'],
      mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
    },
    fontSize: {
      // phone scale
      caption: ['12px', { lineHeight: '16px' }],
      label: ['13px', { lineHeight: '18px', fontWeight: '500' }],
      mono: ['14px', { lineHeight: '20px' }],
      body: ['15px', { lineHeight: '22px' }],
      section: ['16px', { lineHeight: '24px', fontWeight: '600' }],
      title: ['20px', { lineHeight: '28px', fontWeight: '600' }],
      // console scale (denser)
      'c-table': ['12px', { lineHeight: '16px', fontWeight: '500' }],
      'c-mono': ['13px', { lineHeight: '20px' }],
      'c-body': ['14px', { lineHeight: '21px' }],
      'c-h2': ['15px', { lineHeight: '22px', fontWeight: '600' }],
      'c-h1': ['18px', { lineHeight: '26px', fontWeight: '600' }],
      'c-page': ['24px', { lineHeight: '32px', fontWeight: '600' }],
    },
    // NOTE: Tailwind's default spacing scale is already a 4px grid (1=4px,
    // 2=8px, …), so we keep it and only add named layout tokens via `extend`
    // below — replacing it would silently drop common utilities (h-5, gap-1.5…).
    boxShadow: {
      none: 'none',
      sheet: '0 6px 24px -8px rgba(13,27,42,.18)',
      popover: '0 6px 24px -8px rgba(13,27,42,.18)',
    },
    extend: {
      // Named layout tokens (44px touch target, fixed bar/sidebar sizes).
      spacing: {
        touch: '44px',
        input: '48px',
        actionbar: '64px',
        appbar: '52px',
        topbar: '56px',
        sidebar: '240px',
      },
      ringColor: { brand: 'var(--brand-500)' },
      maxWidth: { phone: '390px', content: '1200px' },
      height: { phone: '844px' },
      transitionDuration: { 120: '120ms', 160: '160ms', 200: '200ms' },
    },
  },
  plugins: [],
}

export default config
