/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // ========================================
        // Nossa Maternidade Design System v2.0
        // Baseado no design do site de produção
        // ========================================

        // Primary - Ocean Blue System
        primary: {
          50: '#F0F8FF', // Lightest sky
          100: '#E6F0FA', // Sky - backgrounds light
          200: '#BAD4FF', // Light blue
          300: '#7CACFF', // Mid blue
          400: '#004E9A', // Ocean Blue (MAIN)
          500: '#00427D', // Mid ocean
          600: '#003768', // Dark ocean
          700: '#002C54', // Navy
          800: '#002244', // Deep Navy (hover)
          900: '#001A36', // Darkest navy
          DEFAULT: '#004E9A',
        },

        // Secondary - Coral System
        secondary: {
          50: '#FEF2F2', // Very light coral
          100: '#FEE2E2', // Light coral
          200: '#FECACA', // Soft coral
          300: '#FCA5A5', // Mid coral
          400: '#D93025', // Coral (MAIN)
          500: '#B91C1C', // Deep coral
          600: '#991B1B', // Dark coral
          700: '#7F1D1D', // Darker coral
          800: '#6B1818', // Almost dark
          900: '#5A1313', // Darkest coral
          DEFAULT: '#D93025',
        },

        // Mint/Success System
        mint: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#236B62', // Mint (MAIN)
          500: '#0F5247', // Deep mint
          600: '#0D4B3F',
          700: '#0B4037',
          800: '#09362F',
          900: '#072D27',
          DEFAULT: '#236B62',
        },

        // Semantic Colors - Web Reference
        ocean: '#004E9A',
        deep: '#002244',
        sky: '#E6F0FA',
        cloud: '#F1F5F9',
        snow: '#FFFFFF',
        charcoal: '#0F172A',
        slate: '#334155',
        silver: '#6B7280',
        sunshine: '#F59E0B',
        coral: '#D93025',

        // Background System
        background: {
          DEFAULT: '#FFF8F3', // Brand bg (pêssego suave) ⭐ ATUALIZADO
          canvas: '#FFF8F3', // Brand bg - main background ⭐ ATUALIZADO
          surface: '#FFFFFF', // Snow - cards
          card: '#FFFFFF', // Snow - cards
          elevated: '#FFFFFF', // Snow - elevated surfaces
          input: '#FFFFFF', // Snow - input fields
        },

        // Surface for cards/modals
        surface: '#FFFFFF',

        // Ocean Dark Theme
        'dark-bg': '#020617',
        'dark-card': '#1E293B',
        'dark-elevated': '#334155',
        'dark-input': '#334155',
        'dark-border': '#475569',
        'dark-text': '#F8FAFC',
        'dark-text-secondary': '#CBD5E1',

        // Text System
        text: {
          DEFAULT: '#6A5450', // Brand text (marrom suave) ⭐ ATUALIZADO
          primary: '#6A5450', // Brand text ⭐ ATUALIZADO
          secondary: '#334155', // Slate
          tertiary: '#6B7280', // Silver
          muted: '#94A3B8', // Lighter silver
          placeholder: '#9CA3AF', // Placeholder
          inverse: '#FFFFFF', // White on dark
          light: '#F8FAFC', // Light text
        },

        // Border System
        border: {
          DEFAULT: '#CBD5E1',
          light: 'rgba(0, 0, 0, 0.08)',
          medium: '#CBD5E1',
          dark: 'rgba(0, 0, 0, 0.16)',
          focus: '#004E9A',
          error: '#D93025',
          success: '#236B62',
        },

        // Status Colors
        status: {
          success: '#236B62', // Mint
          warning: '#F59E0B', // Sunshine
          error: '#D93025', // Coral
          info: '#2563EB', // Blue
        },

        // Utility colors
        success: '#236B62',
        warning: '#F59E0B',
        error: '#D93025',
        info: '#2563EB',
        card: '#FFFFFF',

        // Accent colors
        accent: {
          purple: '#8B5CF6',
          teal: '#14B8A6',
          orange: '#FB923C',
          pink: '#EC4899',
          green: '#10B981',
          blue: '#60A5FA',
          indigo: '#6366F1',
        },

        // ⭐ NOVO: Brand Colors (Web Design System)
        // Cores premium do design web para React Native
        brand: {
          blue: '#6DA9E4', // Azul suave premium (main brand color)
          lightBlue: '#DCEBFA', // Azul claro de fundo
          bg: '#FFF8F3', // Fundo pêssego suave (canvas)
          text: '#6A5450', // Texto marrom suave (primary text)
          pink: '#FF8BA3', // Rosa maternal
          // Escala completa derivada para consistência
          50: '#F0F8FF', // Lightest brand blue
          100: '#DCEBFA', // Very light (lightBlue)
          200: '#B8D7F5', // Light brand blue
          300: '#94C3F0', // Mid-light
          400: '#6DA9E4', // MAIN brand blue ⭐
          500: '#4A8FD8', // Mid brand blue
          600: '#2E75CC', // Deep brand blue
          700: '#1E5BB0', // Darker
          800: '#134294', // Dark
          900: '#0A2A78', // Darkest
          DEFAULT: '#6DA9E4', // Default brand blue
        },

        // Legacy compatibility
        'nath-blue': '#004E9A',
        'nath-light-blue': '#E6F0FA',
        'nath-warm': '#F1F5F9',
        'nath-dark': '#0F172A',
        'nath-pink': '#D93025',
      },

      // Design System Spacing
      spacing: {
        0: '0px',
        0.5: '2px',
        1: '4px',
        1.5: '6px',
        2: '8px',
        2.5: '10px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
        10: '40px',
        12: '48px',
        16: '64px',
        20: '80px',
        24: '96px',
        // Legacy
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
      },

      // Design System Border Radius (aligned with web)
      borderRadius: {
        none: '0px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
        '4xl': '32px',
        full: '9999px',
        // Semantic aliases
        pill: '9999px', // Fully rounded buttons
        card: '20px', // Card corners (rounded-[20px])
        input: '12px', // Input fields
        bubble: '16px', // Chat bubbles
        chip: '20px', // Chips/tags
      },

      // Design System Shadows (aligned with web)
      boxShadow: {
        none: 'none',
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.08)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        // Semantic shadows
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.12)',
        soft: '0 2px 8px 0 rgba(0, 0, 0, 0.05)',
        premium: '0 10px 30px -5px rgba(0, 78, 154, 0.4)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },

      // Design System Typography
      fontFamily: {
        sans: ['System', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        body: ['System', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: [
          'System',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: ['Menlo', 'Monaco', 'Courier New', 'monospace'],
      },

      // Animations
      animation: {
        'pulse-slow': 'pulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
        'scale-in': 'scaleIn 0.2s ease-out forwards',
        'spin-slow': 'spin 2s linear infinite',
        'bounce-soft': 'bounceSoft 0.5s ease-out',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },

      fontSize: {
        '3xs': ['10px', { lineHeight: '14px' }],
        '2xs': ['11px', { lineHeight: '16px' }],
        xs: ['12px', { lineHeight: '18px' }],
        sm: ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '24px' }],
        lg: ['18px', { lineHeight: '26px' }],
        xl: ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['28px', { lineHeight: '36px' }],
        '4xl': ['32px', { lineHeight: '40px' }],
        '5xl': ['36px', { lineHeight: '44px' }],
        '6xl': ['42px', { lineHeight: '52px' }],
        '7xl': ['48px', { lineHeight: '60px' }],
      },

      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },

      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },

      // Opacity
      opacity: {
        0: '0',
        5: '0.05',
        10: '0.1',
        20: '0.2',
        25: '0.25',
        30: '0.3',
        40: '0.4',
        50: '0.5',
        60: '0.6',
        70: '0.7',
        75: '0.75',
        80: '0.8',
        90: '0.9',
        95: '0.95',
        100: '1',
      },

      // Background gradients
      backgroundImage: {
        'gradient-ocean': 'linear-gradient(to bottom right, #004E9A, #002244)',
        'gradient-sky': 'linear-gradient(to bottom right, #E6F0FA, #FFFFFF)',
        'gradient-coral': 'linear-gradient(to bottom right, #D93025, #991B1B)',
        'gradient-mint': 'linear-gradient(to bottom right, #5EEAD4, #236B62)',
        'gradient-sunshine': 'linear-gradient(to bottom right, #FCD34D, #F59E0B)',
      },
    },
  },
  plugins: [],
};
