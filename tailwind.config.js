/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            width: '100%',
            pre: {
              backgroundColor: '#111827',
              color: '#e5e7eb',
              overflowX: 'auto',
              fontSize: '0.875rem !important',
              lineHeight: '1.5',
              padding: '1rem',
              margin: '1rem 0',
              code: {
                backgroundColor: 'transparent',
                padding: '0',
                fontSize: '0.875rem !important',
                border: 'none',
              }
            },
            code: {
              backgroundColor: '#1f2937',
              color: '#e5e7eb',
              padding: '0.2rem 0.4rem',
              fontSize: '0.875rem !important',
              fontWeight: '400',
              borderRadius: '0.25rem',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            p: {
              fontSize: '1rem !important',
              lineHeight: '1.75',
              marginTop: '1.25em',
              marginBottom: '1.25em',
            },
            a: {
              color: '#60a5fa',
              '&:hover': {
                color: '#93c5fd',
              },
            },
            h1: {
              color: '#fff',
              fontSize: '2.25em',
              margin: '0',
              padding: '0',
              '&:first-child': {
                marginTop: '0',
              },
            },
            h2: {
              color: '#fff',
              fontSize: '1.875em',
              marginTop: '1.75em',
              marginBottom: '0.75em',
            },
            h3: {
              color: '#fff',
              fontSize: '1.5em',
              marginTop: '1.5em',
              marginBottom: '0.75em',
            },
            h4: {
              color: '#fff',
              marginTop: '1.25em',
              marginBottom: '0.75em',
            },
            '.hljs': {
              background: 'transparent',
              padding: '0',
              fontSize: '0.875em',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 