/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F4F8F8', // Soft whisper of Powder Blue for ultra-clean canvas
        card: '#FFFFFF',       // Pure White
        powder: {
          DEFAULT: '#A8C9C8',  // Powder Blue from user palette
          light: '#EEF6F6',
          muted: '#82AFAF',
          dark: '#3A6867'
        },
        orange: {
          DEFAULT: '#F45B0B',  // Vibrant Racing Orange from user palette
          hover: '#D84C04',
          light: '#FFF2EB',
          dark: '#BA3E00'
        },
        // Aliasing forest to Vibrant Racing Orange for instant seamless app-wide propagation
        forest: {
          DEFAULT: '#F45B0B',  // Vibrant Racing Orange
          hover: '#D84C04',
          light: '#EEF6F6',    // Powder Blue light tint
          dark: '#BA3E00'
        },
        charcoal: {
          DEFAULT: '#141A1B',  // Rich graphite obsidian
          muted: '#667779',
          border: '#DFE8E8',
          light: '#EEF5F5'
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444'
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(20, 26, 27, 0.04), 0 1px 2px 0 rgba(20, 26, 27, 0.02)',
        'card': '0 4px 20px -2px rgba(244, 91, 11, 0.06), 0 2px 6px -1px rgba(168, 201, 200, 0.1)',
        'elevated': '0 20px 25px -5px rgba(244, 91, 11, 0.08), 0 10px 10px -5px rgba(20, 26, 27, 0.03)',
        'orange-glow': '0 0 25px -5px rgba(244, 91, 11, 0.35)',
        'powder-glow': '0 0 25px -5px rgba(168, 201, 200, 0.4)'
      }
    },
  },
  plugins: [],
}
