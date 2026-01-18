# Frontend Plan - Incident & Operations Log System

## Tech Stack
- **Framework:** React 18+ (with Vite or Create React App)
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **State Management:** React Context + useReducer / Zustand
- **Routing:** React Router v6
- **Form Handling:** React Hook Form + Zod validation
- **UI Components:** Headless UI / Radix UI + Custom Components
- **Icons:** Lucide React
- **Date Handling:** date-fns
- **Notifications:** React Hot Toast
- **Charts:** Recharts

---

## Centralized Color System

All colors MUST be defined in a single place: `src/styles/colors.ts`. This file exports a `colors` object that is used throughout the application. CSS variables are generated from this file and applied in `globals.css`.

### Color Definition File (`src/styles/colors.ts`)
```typescript
export const colors = {
  // Brand Colors
  primary: {
    DEFAULT: '#2563EB',  // Blue-600
    light: '#3B82F6',    // Blue-500
    dark: '#1D4ED8',     // Blue-700
    foreground: '#FFFFFF',
  },
  
  // Status Colors
  status: {
    open: {
      bg: '#FEE2E2',      // Red-100
      text: '#991B1B',    // Red-800
      border: '#FECACA',  // Red-200
    },
    investigating: {
      bg: '#FEF3C7',      // Yellow-100
      text: '#92400E',    // Yellow-800
      border: '#FDE68A',  // Yellow-200
    },
    resolved: {
      bg: '#DBEAFE',      // Blue-100
      text: '#1E40AF',    // Blue-800
      border: '#BFDBFE',  // Blue-200
    },
    closed: {
      bg: '#D1FAE5',      // Green-100
      text: '#065F46',    // Green-800
      border: '#A7F3D0',  // Green-200
    },
  },
  
  // Severity Colors
  severity: {
    low: {
      bg: '#F3F4F6',      // Gray-100
      text: '#1F2937',    // Gray-800
    },
    medium: {
      bg: '#DBEAFE',      // Blue-100
      text: '#1E40AF',    // Blue-800
    },
    high: {
      bg: '#FFEDD5',      // Orange-100
      text: '#9A3412',    // Orange-800
    },
    critical: {
      bg: '#FEE2E2',      // Red-100
      text: '#991B1B',    // Red-800
    },
  },
  
  // Priority Colors
  priority: {
    low: {
      bg: '#F3F4F6',
      text: '#6B7280',
    },
    normal: {
      bg: '#DBEAFE',
      text: '#1E40AF',
    },
    high: {
      bg: '#FFEDD5',
      text: '#9A3412',
    },
    urgent: {
      bg: '#FEE2E2',
      text: '#991B1B',
    },
  },
  
  // Chart Colors (for Recharts)
  chart: {
    palette: [
      '#2563EB',  // Blue
      '#10B981',  // Green
      '#F59E0B',  // Amber
      '#EF4444',  // Red
      '#8B5CF6',  // Purple
      '#EC4899',  // Pink
    ],
  },
  
  // UI Colors
  ui: {
    background: '#FFFFFF',
    foreground: '#111827',
    muted: '#F9FAFB',
    mutedForeground: '#6B7280',
    border: '#E5E7EB',
    input: '#E5E7EB',
    ring: '#2563EB',
    
    // Dark mode variants
    dark: {
      background: '#111827',
      foreground: '#F9FAFB',
      muted: '#1F2937',
      mutedForeground: '#9CA3AF',
      border: '#374151',
    },
  },
  
  // Semantic Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
} as const;

export type Colors = typeof colors;
```

### Usage in Components
```tsx
import { colors } from '@/styles/colors';

// Use in inline styles
<div style={{ backgroundColor: colors.status.open.bg }}>

// Or create utility functions
export const getStatusColor = (status: string) => colors.status[status] || colors.status.open;
```

### CSS Variables in globals.css
```css
@layer base {
  :root {
    --color-primary: 37 99 235;
    --color-status-open-bg: 254 226 226;
    --color-status-open-text: 153 27 27;
    /* ... all colors as CSS variables */
  }
  
  .dark {
    --color-background: 17 24 39;
    --color-foreground: 249 250 251;
    /* ... dark mode overrides */
  }
}
```

### Tailwind Extension (tailwind.config.js)
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        'status-open-bg': 'rgb(var(--color-status-open-bg) / <alpha-value>)',
        // ... extend with CSS variables
      },
    },
  },
};
```

**Key Principle:** Never use hardcoded hex values in components. Always reference `colors.ts` or use the extended Tailwind classes.

---

## Project Structure

```
src/
├── api/
│   ├── axios.ts                 # Axios instance with interceptors
│   ├── auth.api.ts              # Authentication API calls
│   ├── incidents.api.ts         # Incidents API calls
│   ├── users.api.ts             # Users API calls
│   ├── dashboard.api.ts         # Dashboard API calls
│   ├── notifications.api.ts     # Notifications API calls
│   └── export.api.ts            # NEW: Export API calls
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Table.tsx
│   │   ├── Pagination.tsx       # ENHANCED: Full pagination component
│   │   ├── Spinner.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── ConfirmDialog.tsx
│   │   └── ExportButton.tsx     # NEW: CSV export button
│   ├── layout/
│   │   ├── AppLayout.tsx        # Main authenticated layout (NO SIDEBAR)
│   │   ├── Header.tsx           # Top header with navigation + user menu
│   │   ├── MobileNav.tsx        # Mobile navigation dropdown
│   │   └── AuthLayout.tsx       # Layout for auth pages
│   ├── incidents/
│   │   ├── IncidentCard.tsx
│   │   ├── IncidentTable.tsx
│   │   ├── IncidentFilters.tsx
│   │   ├── IncidentForm.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── SeverityBadge.tsx
│   │   ├── PriorityBadge.tsx
│   │   ├── StatusUpdateModal.tsx
│   │   ├── AssignmentModal.tsx
│   │   ├── ActivityTimeline.tsx
│   │   ├── CommentForm.tsx
│   │   └── AttachmentList.tsx
│   ├── dashboard/
│   │   ├── StatsCard.tsx
│   │   ├── StatusChart.tsx          # Pie/Donut chart
│   │   ├── RecentIncidents.tsx
│   │   ├── SeverityBreakdown.tsx    # Bar chart
│   │   ├── TrendChart.tsx           # Line chart
│   │   ├── MTTRCard.tsx             # NEW: Mean Time To Resolution
│   │   ├── EscalationAlerts.tsx     # NEW: SLA warnings widget
│   │   ├── CategoryBreakdown.tsx    # NEW: Category distribution
│   │   └── OperatorPerformance.tsx  # NEW: Admin only - operator metrics
│   ├── users/
│   │   ├── UserTable.tsx
│   │   ├── UserForm.tsx
│   │   └── UserCard.tsx
│   ├── notifications/
│   │   ├── NotificationDropdown.tsx
│   │   ├── NotificationItem.tsx
│   │   └── NotificationBell.tsx
│   └── landing/
│       ├── Hero.tsx             # NEW: Landing page hero
│       ├── Features.tsx         # NEW: Features section
│       └── Footer.tsx           # NEW: Landing page footer
├── contexts/
│   ├── AuthContext.tsx          # Authentication state
│   ├── ThemeContext.tsx         # Dark/light mode
│   └── NotificationContext.tsx  # Real-time notifications
├── hooks/
│   ├── useAuth.ts               # Auth hook
│   ├── useIncidents.ts          # Incidents data hook
│   ├── useDashboard.ts          # Dashboard data hook
│   ├── useUsers.ts              # Users data hook
│   ├── useNotifications.ts      # Notifications hook
│   ├── usePagination.ts         # NEW: Pagination hook
│   ├── useExport.ts             # NEW: Export hook
│   ├── useDebounce.ts           # Debounce utility hook
│   └── useLocalStorage.ts       # Local storage hook
├── pages/
│   ├── LandingPage.tsx          # NEW: Public landing page
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── ForgotPasswordPage.tsx
│   │   ├── ResetPasswordPage.tsx
│   │   ├── ChangePasswordPage.tsx
│   │   └── FirstLoginPage.tsx   # NEW: First login password change
│   ├── dashboard/
│   │   └── DashboardPage.tsx    # ENHANCED: With extended features
│   ├── incidents/
│   │   ├── IncidentListPage.tsx
│   │   ├── IncidentDetailPage.tsx
│   │   └── CreateIncidentPage.tsx
│   ├── users/
│   │   ├── UserListPage.tsx
│   │   └── UserDetailPage.tsx
│   └── profile/
│       └── ProfilePage.tsx
├── routes/
│   ├── index.tsx                # Route definitions
│   ├── ProtectedRoute.tsx       # Auth guard
│   ├── RoleRoute.tsx            # Role-based guard
│   └── FirstLoginGuard.tsx      # NEW: Redirect to password change if first login
├── services/
│   ├── auth.service.ts          # Auth business logic
│   ├── storage.service.ts       # Token storage
│   ├── notification.service.ts  # Toast notifications
│   └── export.service.ts        # NEW: Handle CSV downloads
├── types/
│   ├── auth.types.ts
│   ├── incident.types.ts
│   ├── user.types.ts
│   ├── dashboard.types.ts
│   ├── pagination.types.ts      # NEW: Pagination types
│   └── api.types.ts
├── utils/
│   ├── constants.ts             # App constants
│   ├── helpers.ts               # Utility functions
│   ├── validators.ts            # Zod schemas
│   └── formatters.ts            # Date/text formatters
├── styles/
│   └── globals.css              # Tailwind imports + custom styles
├── App.tsx
└── main.tsx
```

---

## Page Specifications

### 0. Landing Page (`/`) - NEW PUBLIC PAGE
**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ Logo          Incident & Operations Log System    [Login]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│           ┌─────────────────────────────────┐               │
│           │                                 │               │
│           │     Incident Management         │               │
│           │     Made Simple                 │               │
│           │                                 │               │
│           │  Track, manage, and resolve     │               │
│           │  incidents efficiently          │               │
│           │                                 │               │
│           │        [Login to System]        │               │
│           │                                 │               │
│           └─────────────────────────────────┘               │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Features                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Track    │  │ Assign   │  │ Real-time│  │ Reports  │    │
│  │ Incidents│  │ & Manage │  │ Updates  │  │ & Export │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
├─────────────────────────────────────────────────────────────┤
│  Footer: © 2024 Your Company                                │
└─────────────────────────────────────────────────────────────┘
```

**Components:**
- Navigation bar with logo and login button
- Hero section with system description
- Feature highlights
- Call-to-action button linking to login
- Footer

---

### 1. Login Page (`/login`)
**Components:**
- Logo/Brand
- Email input
- Password input
- "Remember me" checkbox
- "Forgot password?" link
- Login button
- Error messages
- Link back to landing page

**Features:**
- Form validation
- Loading state
- Error handling
- Redirect after login (to dashboard or first-login page)

---

### 2. First Login Password Change Page (`/first-login`) - NEW
**Components:**
- Welcome message
- Explanation text ("Please change your password to continue")
- New password input
- Confirm password input
- Password strength indicator
- Submit button

**Features:**
- Cannot be skipped
- Validates password strength
- On success, updates is_first_login and redirects to dashboard

---

### 3. Forgot Password Page (`/forgot-password`)
**Components:**
- Email input
- Submit button
- Back to login link
- Success/error messages

---

### 4. Reset Password Page (`/reset-password`)
**Components:**
- New password input
- Confirm password input
- Submit button
- Password strength indicator

---

### 5. Change Password Page (`/change-password`)
**Components:**
- Current password input
- New password input
- Confirm password input
- Submit button

---

### 6. Dashboard Page (`/dashboard`) - ENHANCED WITH EXTENDED FEATURES
**Layout (No Sidebar - Top Navigation):**
```
┌─────────────────────────────────────────────────────────────┐
│ Logo    [Dashboard] [Incidents] [Users*]    🔔  👤 John ▼   │
├─────────────────────────────────────────────────────────────┤
│  Welcome back, [User Name]                                  │
├──────────┬──────────┬──────────┬──────────┬────────────────┤
│  OPEN    │INVESTIGAT│ RESOLVED │  CLOSED  │  MTTR (Admin)  │
│  Count   │  Count   │  Count   │  Count   │  2.5 hours     │
├──────────┴──────────┴──────────┴──────────┴────────────────┤
│                                                             │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  │
│  │ Status Distribution     │  │ Severity Breakdown      │  │
│  │ [Pie/Donut Chart]       │  │ [Bar Chart]             │  │
│  └─────────────────────────┘  └─────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  │
│  │ Incident Trends         │  │ Category Breakdown      │  │
│  │ [Line Chart - Weekly]   │  │ [Horizontal Bar]        │  │
│  └─────────────────────────┘  └─────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Escalation Alerts (SLA Warnings)                    │   │
│  │ ⚠️ INC-001 - Critical incident pending > 4 hours    │   │
│  │ ⚠️ INC-005 - High priority unassigned > 2 hours     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Recent Incidents                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Incident table (last 5)                    [View All]│   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Operator Performance (Admin Only)                    │   │
│  │ ┌────────┬──────────┬──────────┬──────────┐         │   │
│  │ │Operator│Assigned  │Resolved  │Avg Time  │         │   │
│  │ │John    │12        │10        │2.1 hrs   │         │   │
│  │ │Jane    │8         │7         │1.8 hrs   │         │   │
│  │ └────────┴──────────┴──────────┴──────────┘         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Stats Cards:**
- Open incidents count
- Investigating count
- Resolved count
- Closed count
- MTTR (Admin only)
- Unassigned count (Admin only)

**Charts (Extended Features):**
- Status distribution (Pie/Donut)
- Severity breakdown (Bar)
- Weekly/Monthly trend (Line)
- Category breakdown (Horizontal Bar)

**Additional Widgets (Extended Features):**
- Escalation Alerts (SLA warnings)
- Operator Performance Table (Admin only)
- Recent Incidents with "View All" link

---

### 7. Incident List Page (`/incidents`) - WITH PAGINATION & EXPORT
**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ Incidents                    [Export CSV] [+ Create Incident│
├─────────────────────────────────────────────────────────────┤
│ Filters:                                                    │
│ [Status ▼] [Severity ▼] [Priority ▼] [Search...] [Clear]   │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ID    │ Title │ Severity │ Status │ Assigned │ Created │ │
│ │──────────────────────────────────────────────────────────│ │
│ │ INC-001│ ...  │ Critical │ Open   │ John     │ 2 hrs   │ │
│ │ INC-002│ ...  │ High     │ Invest │ Jane     │ 1 day   │ │
│ │ ...                                                      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Showing 1-15 of 150 items                                   │
│ [< Prev] [1] [2] [3] ... [10] [Next >]                     │
└─────────────────────────────────────────────────────────────┘
```

**Export Button:**
- Exports currently filtered/visible data
- Downloads CSV file with same filters applied
- Shows loading state during export

**Pagination Component:**
- Shows "Showing X-Y of Z items"
- Previous button (disabled on first page)
- Page numbers with ellipsis for many pages
- Next button (disabled on last page)
- Total items count

---

### 8. Incident Detail Page (`/incidents/:id`)
**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ ← Back to List          INC-20240115-0001                   │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────┐ ┌─────────────────────┐ │
│ │ Incident Details                │ │ Status & Assignment │ │
│ │                                 │ │                     │ │
│ │ Title: Server Down              │ │ Status: [Open ▼]    │ │
│ │ Description: ...                │ │ [Update Status]     │ │
│ │                                 │ │                     │ │
│ │ Severity: ● Critical            │ │ Assigned: [Select]  │ │
│ │ Priority: ● Urgent              │ │ [Assign]            │ │
│ │ Category: Infrastructure        │ │                     │ │
│ │                                 │ │ Due Date: Jan 20    │ │
│ │ Reporter: John Doe              │ └─────────────────────┘ │
│ │ Created: Jan 15, 2024 10:30 AM  │                         │
│ │                                 │ ┌─────────────────────┐ │
│ │ Affected Systems:               │ │ Attachments         │ │
│ │ • Web Server                    │ │ 📎 screenshot.png   │ │
│ │ • Database                      │ │ 📎 logs.txt         │ │
│ │                                 │ │ [+ Add Attachment]  │ │
│ └─────────────────────────────────┘ └─────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Activity Timeline                                           │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ○ Jan 15, 10:45 - Status changed: Open → Investigating  │ │
│ │   by Jane Smith                                         │ │
│ │                                                         │ │
│ │ ○ Jan 15, 10:35 - Comment added by John Doe             │ │
│ │   "Investigating the root cause..."                     │ │
│ │                                                         │ │
│ │ ○ Jan 15, 10:30 - Incident created by John Doe          │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Add Comment                                                 │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Textarea for comment...]                               │ │
│ │                                    ☐ Internal  [Post]   │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

### 9. Create Incident Page (`/incidents/new`)
**Form Fields:**
- Title* (text)
- Description* (textarea, rich text optional)
- Severity* (select: low, medium, high, critical)
- Priority* (select: low, normal, high, urgent)
- Category* (select: predefined categories)
- Affected Systems (multi-select/tags)
- Due Date (date picker, optional)
- Impact Description (textarea, optional)
- Attachments (file upload, optional)

---

### 10. User Management Page (`/users`) - WITH PAGINATION & EXPORT
**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ User Management                   [Export CSV] [+ Add User] │
├─────────────────────────────────────────────────────────────┤
│ [Search users...]                     [Role ▼] [Status ▼]  │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Avatar │ Name    │ Email │ Role   │ Status │ Actions   │ │
│ │────────────────────────────────────────────────────────│ │
│ │ 👤     │ John    │ ...   │ Admin  │ Active │ Edit Del  │ │
│ │ 👤     │ Jane    │ ...   │ Oper.  │ Active │ Edit Del  │ │
│ │ ...                                                      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Showing 1-15 of 45 users                                    │
│ [< Prev] [1] [2] [3] [Next >]                              │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- List all users with pagination
- Create new user (triggers welcome email)
- Edit user details
- Activate/Deactivate user
- Role assignment
- Export filtered users to CSV

---

### 11. Profile Page (`/profile`)
**Sections:**
- Profile Information (name, email, phone)
- Avatar upload
- Change Password section
- Notification preferences (extended)

---

## Navigation Structure (No Sidebar)

### Header Navigation
```
┌─────────────────────────────────────────────────────────────┐
│ [Logo]  Dashboard  Incidents  Users*   |  🔔 (3)  👤 John ▼ │
└─────────────────────────────────────────────────────────────┘

* Users link only visible to Admin
```

### User Dropdown Menu
```
┌──────────────┐
│ 👤 John Doe  │
│ john@email   │
├──────────────┤
│ Profile      │
│ Settings     │
├──────────────┤
│ Logout       │
└──────────────┘
```

### Mobile Navigation
```
┌─────────────────────────┐
│ [Logo]     [☰ Menu]     │
└─────────────────────────┘

Menu Dropdown:
┌─────────────────────────┐
│ Dashboard               │
│ Incidents               │
│ Users (Admin)           │
├─────────────────────────┤
│ Profile                 │
│ Logout                  │
└─────────────────────────┘
```

---

## Pagination Component Specification

### Props
```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
  from: number;
  to: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
}
```

### Visual Design
```
Showing 16-30 of 150 items

[< Prev]  [1] [2] [3] ... [8] [9] [10]  [Next >]
           ^current page highlighted
```

### Behavior
- Previous button disabled when `hasPreviousPage = false`
- Next button disabled when `hasNextPage = false`
- Show ellipsis (...) when there are many pages
- Always show first page, last page, and pages around current
- Clicking page number calls `onPageChange(pageNumber)`

### Implementation
```tsx
const Pagination = ({ 
  currentPage, totalPages, totalItems, perPage, 
  from, to, hasNextPage, hasPreviousPage, onPageChange 
}: PaginationProps) => {
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Always show first page
    pages.push(1);
    
    if (currentPage > 3) pages.push('ellipsis');
    
    // Pages around current
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    
    if (currentPage < totalPages - 2) pages.push('ellipsis');
    
    // Always show last page
    if (totalPages > 1) pages.push(totalPages);
    
    return pages;
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">
        Showing {from}-{to} of {totalItems} items
      </span>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPreviousPage}
          className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {getPageNumbers().map((page, idx) => 
          page === 'ellipsis' ? (
            <span key={`ellipsis-${idx}`}>...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 border rounded ${
                currentPage === page ? 'bg-primary text-white' : ''
              }`}
            >
              {page}
            </button>
          )
        )}
        <button 
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};
```

---

## Export Button Component

### Props
```typescript
interface ExportButtonProps {
  onExport: () => Promise<void>;
  isLoading: boolean;
  label?: string;
}
```

### Implementation
```tsx
const ExportButton = ({ onExport, isLoading, label = "Export CSV" }: ExportButtonProps) => {
  return (
    <button
      onClick={onExport}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
    >
      {isLoading ? (
        <Spinner size="sm" />
      ) : (
        <Download size={16} />
      )}
      {label}
    </button>
  );
};
```

### Export Hook
```typescript
const useExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportData = async (
    endpoint: string, 
    filters: Record<string, any>,
    filename: string
  ) => {
    setIsExporting(true);
    try {
      const response = await api.get(endpoint, {
        params: filters,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  return { exportData, isExporting };
};
```

---

## Routing Structure

```typescript
const routes = [
  // Public routes
  { path: '/', element: <LandingPage /> },  // NEW: Landing page
  { path: '/login', element: <LoginPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  
  // First login route (authenticated but requires password change)
  { 
    path: '/first-login', 
    element: <ProtectedRoute><FirstLoginPage /></ProtectedRoute> 
  },
  
  // Protected routes (authenticated + password changed)
  {
    path: '/app',
    element: <ProtectedRoute><FirstLoginGuard><AppLayout /></FirstLoginGuard></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="dashboard" /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'incidents', element: <IncidentListPage /> },
      { path: 'incidents/new', element: <CreateIncidentPage />, roles: ['reporter', 'admin'] },
      { path: 'incidents/:id', element: <IncidentDetailPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'change-password', element: <ChangePasswordPage /> },
      
      // Admin only routes
      { path: 'users', element: <UserListPage />, roles: ['admin'] },
      { path: 'users/:id', element: <UserDetailPage />, roles: ['admin'] },
    ]
  },
  
  // 404
  { path: '*', element: <NotFoundPage /> }
];
```

### FirstLoginGuard Component
```tsx
const FirstLoginGuard = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  if (user?.is_first_login) {
    return <Navigate to="/first-login" replace />;
  }
  
  return <>{children}</>;
};
```

---

## State Management

### Auth Context (Updated)
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requiresPasswordChange: boolean;  // NEW
}

interface User {
  id: number;
  name: string;
  email: string;
  role: 'reporter' | 'operator' | 'admin';
  is_first_login: boolean;  // NEW
  // ...
}

// Actions
- login(email, password) // Returns requiresPasswordChange flag
- logout()
- refreshUser()
- updateProfile(data)
- completeFirstLogin(newPassword) // NEW
```

### Pagination State
```typescript
interface PaginationState {
  currentPage: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  from: number;
  to: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
```

---

## API Integration

### Login Response Handling
```typescript
const login = async (email: string, password: string) => {
  const response = await authApi.login({ email, password });
  
  setToken(response.data.token);
  setUser(response.data.user);
  
  // Check if first login
  if (response.data.requires_password_change) {
    navigate('/first-login');
  } else {
    navigate('/app/dashboard');
  }
};
```

### Pagination Hook
```typescript
const usePagination = (fetchFn: (page: number, filters: any) => Promise<PaginatedResponse>) => {
  const [pagination, setPagination] = useState<PaginationState | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPage = async (page: number, filters: any = {}) => {
    setIsLoading(true);
    try {
      const response = await fetchFn(page, filters);
      setData(response.data);
      setPagination(response.meta);
    } finally {
      setIsLoading(false);
    }
  };

  return { data, pagination, isLoading, fetchPage };
};
```

---

## Form Validation Schemas (Zod)

```typescript
// Login Schema
const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Minimum 8 characters'),
});

// First Login Password Schema
const firstLoginSchema = z.object({
  password: z.string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain number'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Create Incident Schema
const incidentSchema = z.object({
  title: z.string().min(5).max(255),
  description: z.string().min(20),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  category: z.string().min(1),
  dueDate: z.date().optional(),
  affectedSystems: z.array(z.string()).optional(),
  impactDescription: z.string().optional(),
});

// Create User Schema
const createUserSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email('Invalid email'),
  role: z.enum(['reporter', 'operator', 'admin']),
  phone: z.string().optional(),
});
```

---

## Responsive Design Breakpoints

```css
/* Tailwind defaults */
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

**Mobile Considerations:**
- Hamburger menu for navigation
- Stack cards vertically
- Full-width tables with horizontal scroll
- Touch-friendly buttons (min 44px)
- Simplified dashboard layout

---

## Extended Features (Best-of-Best) - All in Dashboard

### Feature 1: Real-Time Updates
- WebSocket/Polling for live incident updates
- Live notification bell in header
- Auto-refresh dashboard data
- Optimistic UI updates

### Feature 2: Advanced Analytics Dashboard
- Interactive charts (Recharts)
- Date range selector for trends
- MTTR metrics
- Operator performance table
- Escalation alerts widget
- Category breakdown

### Feature 3: Dark Mode
- System preference detection
- Manual toggle in user menu
- Persistent preference
- Smooth transitions

---

## Component Specifications

### StatusBadge Component
```tsx
const statusColors = {
  open: 'bg-red-100 text-red-800',
  investigating: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-blue-100 text-blue-800',
  closed: 'bg-green-100 text-green-800',
}
```

### SeverityBadge Component
```tsx
const severityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
}
```

---

## Accessibility (A11y) Requirements

- ARIA labels on interactive elements
- Keyboard navigation support
- Focus management
- Color contrast compliance (WCAG 2.1)
- Screen reader friendly
- Skip navigation links
- Error announcements
- Disabled state announcements for pagination

---

## Performance Optimizations

1. **Code Splitting**
   - Lazy load pages
   - Dynamic imports for modals and charts

2. **Caching**
   - SWR for API caching
   - Memoization (useMemo, useCallback)

3. **Bundle Optimization**
   - Tree shaking
   - Minimize dependencies
   - Image optimization

4. **UX Optimizations**
   - Skeleton loaders
   - Optimistic updates
   - Debounced search

---

## Testing Strategy

1. **Unit Tests** (Jest + React Testing Library)
   - Component rendering
   - Pagination logic
   - Export functionality
   - First login flow

2. **Integration Tests**
   - Page flows
   - Form submissions
   - API interactions
   - Export downloads

3. **E2E Tests** (Cypress/Playwright)
   - Landing page to login flow
   - First login password change
   - Incident creation
   - CSV export
   - Pagination navigation
