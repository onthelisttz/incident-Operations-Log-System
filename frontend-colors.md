# Frontend Color System

## Overview

All colors are defined in a single source of truth: `src/styles/colors.ts` and CSS variables in `src/styles/globals.css`. This ensures consistency across the entire application.

---

## Color Definition File: `src/styles/colors.ts`

```typescript
// ===========================================
// INCIDENT & OPERATIONS LOG SYSTEM - COLORS
// ===========================================
// Single source of truth for all colors
// Import this file wherever colors are needed

export const colors = {
  // ─────────────────────────────────────────
  // BRAND COLORS
  // ─────────────────────────────────────────
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1', // Main primary
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },

  // ─────────────────────────────────────────
  // NEUTRAL / GRAY SCALE
  // ─────────────────────────────────────────
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // ─────────────────────────────────────────
  // SEMANTIC COLORS
  // ─────────────────────────────────────────
  success: {
    light: '#D1FAE5',
    main: '#10B981',
    dark: '#059669',
  },
  warning: {
    light: '#FEF3C7',
    main: '#F59E0B',
    dark: '#D97706',
  },
  error: {
    light: '#FEE2E2',
    main: '#EF4444',
    dark: '#DC2626',
  },
  info: {
    light: '#DBEAFE',
    main: '#3B82F6',
    dark: '#2563EB',
  },

  // ─────────────────────────────────────────
  // INCIDENT STATUS COLORS
  // ─────────────────────────────────────────
  status: {
    open: {
      bg: '#FEE2E2',
      text: '#DC2626',
      border: '#FECACA',
    },
    investigating: {
      bg: '#FEF3C7',
      text: '#D97706',
      border: '#FDE68A',
    },
    resolved: {
      bg: '#DBEAFE',
      text: '#2563EB',
      border: '#BFDBFE',
    },
    closed: {
      bg: '#D1FAE5',
      text: '#059669',
      border: '#A7F3D0',
    },
  },

  // ─────────────────────────────────────────
  // PRIORITY COLORS
  // ─────────────────────────────────────────
  priority: {
    critical: {
      bg: '#FEE2E2',
      text: '#DC2626',
      border: '#FECACA',
    },
    high: {
      bg: '#FFEDD5',
      text: '#EA580C',
      border: '#FED7AA',
    },
    medium: {
      bg: '#FEF3C7',
      text: '#D97706',
      border: '#FDE68A',
    },
    low: {
      bg: '#D1FAE5',
      text: '#059669',
      border: '#A7F3D0',
    },
  },

  // ─────────────────────────────────────────
  // CATEGORY COLORS (for charts/badges)
  // ─────────────────────────────────────────
  category: {
    network: '#6366F1',
    server: '#8B5CF6',
    application: '#EC4899',
    security: '#EF4444',
    database: '#F59E0B',
    other: '#6B7280',
  },

  // ─────────────────────────────────────────
  // UI COLORS
  // ─────────────────────────────────────────
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
  },
  text: {
    primary: '#111827',
    secondary: '#4B5563',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
  },
  border: {
    light: '#E5E7EB',
    medium: '#D1D5DB',
    dark: '#9CA3AF',
  },
} as const;

// Type exports for TypeScript support
export type StatusType = keyof typeof colors.status;
export type PriorityType = keyof typeof colors.priority;
export type CategoryType = keyof typeof colors.category;
```

---

## CSS Variables: `src/styles/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Brand Colors */
  --color-primary-50: #EEF2FF;
  --color-primary-100: #E0E7FF;
  --color-primary-200: #C7D2FE;
  --color-primary-300: #A5B4FC;
  --color-primary-400: #818CF8;
  --color-primary-500: #6366F1;
  --color-primary-600: #4F46E5;
  --color-primary-700: #4338CA;
  --color-primary-800: #3730A3;
  --color-primary-900: #312E81;

  /* Gray Scale */
  --color-gray-50: #F9FAFB;
  --color-gray-100: #F3F4F6;
  --color-gray-200: #E5E7EB;
  --color-gray-300: #D1D5DB;
  --color-gray-400: #9CA3AF;
  --color-gray-500: #6B7280;
  --color-gray-600: #4B5563;
  --color-gray-700: #374151;
  --color-gray-800: #1F2937;
  --color-gray-900: #111827;

  /* Semantic Colors */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;

  /* Status Colors */
  --status-open-bg: #FEE2E2;
  --status-open-text: #DC2626;
  --status-investigating-bg: #FEF3C7;
  --status-investigating-text: #D97706;
  --status-resolved-bg: #DBEAFE;
  --status-resolved-text: #2563EB;
  --status-closed-bg: #D1FAE5;
  --status-closed-text: #059669;

  /* Priority Colors */
  --priority-critical-bg: #FEE2E2;
  --priority-critical-text: #DC2626;
  --priority-high-bg: #FFEDD5;
  --priority-high-text: #EA580C;
  --priority-medium-bg: #FEF3C7;
  --priority-medium-text: #D97706;
  --priority-low-bg: #D1FAE5;
  --priority-low-text: #059669;

  /* UI Colors */
  --bg-primary: #FFFFFF;
  --bg-secondary: #F9FAFB;
  --bg-tertiary: #F3F4F6;
  --text-primary: #111827;
  --text-secondary: #4B5563;
  --text-tertiary: #9CA3AF;
  --border-light: #E5E7EB;
  --border-medium: #D1D5DB;
}
```

---

## Tailwind Configuration: `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
        },
        status: {
          'open-bg': 'var(--status-open-bg)',
          'open-text': 'var(--status-open-text)',
          'investigating-bg': 'var(--status-investigating-bg)',
          'investigating-text': 'var(--status-investigating-text)',
          'resolved-bg': 'var(--status-resolved-bg)',
          'resolved-text': 'var(--status-resolved-text)',
          'closed-bg': 'var(--status-closed-bg)',
          'closed-text': 'var(--status-closed-text)',
        },
        priority: {
          'critical-bg': 'var(--priority-critical-bg)',
          'critical-text': 'var(--priority-critical-text)',
          'high-bg': 'var(--priority-high-bg)',
          'high-text': 'var(--priority-high-text)',
          'medium-bg': 'var(--priority-medium-bg)',
          'medium-text': 'var(--priority-medium-text)',
          'low-bg': 'var(--priority-low-bg)',
          'low-text': 'var(--priority-low-text)',
        },
      },
    },
  },
  plugins: [],
};
```

---

## Usage Examples

### In React Components (TypeScript)

```tsx
import { colors, StatusType } from '@/styles/colors';

// Using colors object directly
const StatusBadge = ({ status }: { status: StatusType }) => {
  return (
    <span
      style={{
        backgroundColor: colors.status[status].bg,
        color: colors.status[status].text,
        border: `1px solid ${colors.status[status].border}`,
      }}
    >
      {status.toUpperCase()}
    </span>
  );
};
```

### With Tailwind Classes

```tsx
// Using extended Tailwind classes
const StatusBadge = ({ status }: { status: string }) => {
  const statusClasses = {
    open: 'bg-status-open-bg text-status-open-text',
    investigating: 'bg-status-investigating-bg text-status-investigating-text',
    resolved: 'bg-status-resolved-bg text-status-resolved-text',
    closed: 'bg-status-closed-bg text-status-closed-text',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-sm ${statusClasses[status]}`}>
      {status.toUpperCase()}
    </span>
  );
};
```

### In Charts (Recharts)

```tsx
import { colors } from '@/styles/colors';

const CHART_COLORS = [
  colors.category.network,
  colors.category.server,
  colors.category.application,
  colors.category.security,
  colors.category.database,
  colors.category.other,
];

<PieChart>
  <Pie data={data} dataKey="value">
    {data.map((_, index) => (
      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
    ))}
  </Pie>
</PieChart>
```

---

## Color Guidelines

| Element              | Color Usage                          |
|----------------------|--------------------------------------|
| Primary Actions      | `primary-500` / `primary-600`        |
| Secondary Actions    | `gray-200` bg, `gray-700` text       |
| Destructive Actions  | `error.main`                         |
| Page Background      | `background.secondary`               |
| Card Background      | `background.primary`                 |
| Primary Text         | `text.primary`                       |
| Secondary Text       | `text.secondary`                     |
| Borders              | `border.light`                       |
| Hover States         | One shade darker (500 → 600)         |
