/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        // === Oxblood, Ivory & Sage Palette ===
        oxblood:  '#542536',
        cherry:   '#321923',
        ivory:    '#F7F1E8',
        white:    '#FFFFFF',
        taupe:    '#E8DDD3',
        border:   '#E1D4CA',
        charcoal: '#302A2B',
        secondary:'#79666A',
        forest:   '#34483A',
        sage:     '#687B62',
        rose:     '#C58D98',
        'pale-rose': '#EEE3E0',
        brass:    '#B69A69',

        // Semantic aliases
        background: '#F7F1E8',
        surface:    '#FFFFFF',
        primary: {
          DEFAULT: '#542536',
          light:   '#6e3349',
          dark:    '#321923',
        },
        accent: {
          DEFAULT: '#542536',
          light:   '#EEE3E0',
          dark:    '#321923',
        },
        success: {
          DEFAULT: '#34483A',
          light:   '#e8f0ea',
        },
        warning: {
          DEFAULT: '#B69A69',
          light:   '#f5ede0',
        },
        danger: {
          DEFAULT: '#8b2c35',
          light:   '#fbeaec',
        },
        muted: '#EEE3E0',
        text: {
          primary:   '#302A2B',
          secondary: '#79666A',
          muted:     '#a08a8e',
        },
        ink: {
          DEFAULT:   '#302A2B',
          secondary: '#79666A',
          muted:     '#a08a8e',
        },
      },
      borderRadius: {
        'sm':  '10px',
        DEFAULT: '14px',
        'md':  '16px',
        'lg':  '18px',
        'xl':  '22px',
        '2xl': '24px',
      },
      boxShadow: {
        // Soft, blurred luxury shadows — no hard offset
        'card':       '0 2px 8px rgba(84,37,54,0.08), 0 1px 2px rgba(84,37,54,0.06)',
        'card-hover': '0 6px 20px rgba(84,37,54,0.13), 0 2px 6px rgba(84,37,54,0.08)',
        'sidebar':    '2px 0 16px rgba(84,37,54,0.07)',
        'topbar':     '0 2px 12px rgba(84,37,54,0.06)',
        'modal':      '0 20px 50px rgba(50,25,35,0.20), 0 6px 20px rgba(50,25,35,0.10)',
        'input-focus':'0 0 0 3px rgba(84,37,54,0.15)',
        'btn':        '0 2px 6px rgba(84,37,54,0.22)',
        'btn-hover':  '0 4px 14px rgba(84,37,54,0.30)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
}
