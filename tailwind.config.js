/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        // Custom brand colors
        brand: {
          'primary-light': '#3244DD',
          'heading-dark': '#364153',
          'secondary-text': '#6B6C6E',
          'background-dark': '#020817',
          'accent-dark': '#00D9FF',
          'muted-text-dark': '#99A1AF',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient':
          'linear-gradient(130.34deg, rgba(82, 94, 229, 0.9) 30.76%, rgba(50, 68, 221, 0.9) 75.24%)',
          'brand-gradient': 'linear-gradient(180deg, #00D9FF 0%, #00A8B5 100%)',
          'hr-glow': 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,217,255,0.5) 50%, rgba(0,0,0,0) 100%)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
