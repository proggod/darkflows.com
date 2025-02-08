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
            color: '#9ca3af',
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
            a: {
              color: '#3b82f6',
              '&:hover': {
                color: '#60a5fa',
              },
            },
            pre: {
              backgroundColor: '#1f2937',
              color: '#e5e7eb',
            },
            code: {
              color: '#e5e7eb',
              backgroundColor: '#374151',
              padding: '0.25rem 0.4rem',
              borderRadius: '0.25rem',
              fontSize: '0.875em',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
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