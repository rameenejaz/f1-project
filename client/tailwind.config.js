/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0066cc',
        'primary-focus': '#0071e3',
        'primary-on-dark': '#2997ff',
        ink: '#1d1d1f',
        parchment: '#f5f5f7',
        pearl: '#fafafc',
        hairline: '#e0e0e0',
        'divider-soft': '#f0f0f0',
        'ink-muted-80': '#333333',
        'ink-muted-48': '#7a7a7a',
        canvas: '#ffffff',
        'tile-dark': '#272729',
        'nav-black': '#000000',
        'chip-gray': '#d2d2d7',
      },
      fontFamily: {
        display: [
          'SF Pro Display',
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
        sans: [
          'SF Pro Text',
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
      },
      fontSize: {
        'hero-display': ['56px', { lineHeight: '1.07', letterSpacing: '-0.28px', fontWeight: '600' }],
        'display-lg': ['40px', { lineHeight: '1.1', letterSpacing: '0', fontWeight: '600' }],
        'display-md': ['34px', { lineHeight: '1.47', letterSpacing: '-0.374px', fontWeight: '600' }],
        lead: ['28px', { lineHeight: '1.14', letterSpacing: '0.196px', fontWeight: '400' }],
        tagline: ['21px', { lineHeight: '1.19', letterSpacing: '0.231px', fontWeight: '600' }],
        body: ['17px', { lineHeight: '1.47', letterSpacing: '-0.374px', fontWeight: '400' }],
        'body-strong': ['17px', { lineHeight: '1.24', letterSpacing: '-0.374px', fontWeight: '600' }],
        caption: ['14px', { lineHeight: '1.43', letterSpacing: '-0.224px', fontWeight: '400' }],
        'caption-strong': ['14px', { lineHeight: '1.29', letterSpacing: '-0.224px', fontWeight: '600' }],
        'nav-link': ['12px', { lineHeight: '1', letterSpacing: '-0.12px', fontWeight: '400' }],
        'fine-print': ['12px', { lineHeight: '1', letterSpacing: '-0.12px', fontWeight: '400' }],
      },
      borderRadius: {
        xs: '5px',
        sm: '8px',
        md: '11px',
        lg: '18px',
      },
      spacing: {
        section: '80px',
      },
      maxWidth: {
        content: '1440px',
        prose: '980px',
      },
      boxShadow: {
        product: '3px 5px 30px 0 rgba(0, 0, 0, 0.22)',
      },
      height: {
        'global-nav': '44px',
        'sub-nav': '52px',
      },
      screens: {
        tablet: '834px',
      },
    },
  },
  plugins: [],
};
