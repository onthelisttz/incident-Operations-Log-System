/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: 'rgb(var(--color-primary-50) / <alpha-value>)',
          100: 'rgb(var(--color-primary-100) / <alpha-value>)',
          200: 'rgb(var(--color-primary-200) / <alpha-value>)',
          600: 'rgb(var(--color-primary-600) / <alpha-value>)',
          700: 'rgb(var(--color-primary-700) / <alpha-value>)',
        },
        surface: {
          DEFAULT: 'rgb(var(--color-surface) / <alpha-value>)',
          muted: 'rgb(var(--color-surface-muted) / <alpha-value>)',
        },
        ink: {
          DEFAULT: 'rgb(var(--color-ink) / <alpha-value>)',
          muted: 'rgb(var(--color-ink-muted) / <alpha-value>)',
          subtle: 'rgb(var(--color-ink-subtle) / <alpha-value>)',
        },
        line: {
          DEFAULT: 'rgb(var(--color-line) / <alpha-value>)',
          strong: 'rgb(var(--color-line-strong) / <alpha-value>)',
        },
        success: {
          50: 'rgb(var(--color-success-50) / <alpha-value>)',
          600: 'rgb(var(--color-success-600) / <alpha-value>)',
          700: 'rgb(var(--color-success-700) / <alpha-value>)',
        },
        status: {
          open: {
            bg: 'rgb(var(--color-status-open-bg) / <alpha-value>)',
            text: 'rgb(var(--color-status-open-text) / <alpha-value>)',
          },
          investigating: {
            bg: 'rgb(var(--color-status-investigating-bg) / <alpha-value>)',
            text: 'rgb(var(--color-status-investigating-text) / <alpha-value>)',
          },
          resolved: {
            bg: 'rgb(var(--color-status-resolved-bg) / <alpha-value>)',
            text: 'rgb(var(--color-status-resolved-text) / <alpha-value>)',
          },
        },
        severity: {
          low: {
            bg: 'rgb(var(--color-severity-low-bg) / <alpha-value>)',
            text: 'rgb(var(--color-severity-low-text) / <alpha-value>)',
          },
          medium: {
            bg: 'rgb(var(--color-severity-medium-bg) / <alpha-value>)',
            text: 'rgb(var(--color-severity-medium-text) / <alpha-value>)',
          },
          high: {
            bg: 'rgb(var(--color-severity-high-bg) / <alpha-value>)',
            text: 'rgb(var(--color-severity-high-text) / <alpha-value>)',
          },
          critical: {
            bg: 'rgb(var(--color-severity-critical-bg) / <alpha-value>)',
            text: 'rgb(var(--color-severity-critical-text) / <alpha-value>)',
          },
        },
        priority: {
          low: {
            bg: 'rgb(var(--color-priority-low-bg) / <alpha-value>)',
            text: 'rgb(var(--color-priority-low-text) / <alpha-value>)',
          },
          normal: {
            bg: 'rgb(var(--color-priority-normal-bg) / <alpha-value>)',
            text: 'rgb(var(--color-priority-normal-text) / <alpha-value>)',
          },
          high: {
            bg: 'rgb(var(--color-priority-high-bg) / <alpha-value>)',
            text: 'rgb(var(--color-priority-high-text) / <alpha-value>)',
          },
          urgent: {
            bg: 'rgb(var(--color-priority-urgent-bg) / <alpha-value>)',
            text: 'rgb(var(--color-priority-urgent-text) / <alpha-value>)',
          },
        },
      },
    },
  },
  plugins: [],
}

