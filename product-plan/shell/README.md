# Application Shell

## Overview

The PSBook shell provides a mobile-first navigation experience that works seamlessly for both field staff and admins. The design prioritizes quick access to key workflows while maintaining a clean, professional interface.

## Components Provided

- **AppShell** — Main layout wrapper with sidebar navigation and user menu
- **MainNav** — Navigation component with active state handling
- **UserMenu** — User dropdown menu with avatar and logout

## Navigation Structure

- **Setup & Configuration** → Add shops, create routes, manage employees
- **Daily Operations** → Assign routes and log collections
- **Admin Dashboard** → Monitor real-time collections and cash status
- **End-of-Day Reconciliation** → Verify cash handover and close the day
- **Reports & History** → View transaction history and generate reports

## Layout Pattern

**Sidebar Navigation** - A persistent navigation panel that adapts to screen size:

- On **desktop/tablet**: Sidebar appears on the left (240px width) with all navigation items visible
- On **mobile**: Sidebar collapses behind a hamburger menu button; tapping opens it as a full-screen overlay

The PSBook logo sits at the top of the sidebar, reinforcing brand identity across all views.

## Responsive Behavior

- **Desktop (1024px+):** Full sidebar visible on left, content area fills remaining space
- **Tablet (768px-1023px):** Sidebar can be toggled, appears as overlay when open
- **Mobile (<768px):** Hamburger menu in header, sidebar opens as full-screen overlay, content takes full width

## Props

### AppShellProps

| Prop | Type | Description |
|------|------|-------------|
| `children` | ReactNode | Main content area |
| `navigationItems` | NavigationItem[] | Array of navigation links |
| `user` | User | Current user info (optional) |
| `onNavigate` | (href: string) => void | Navigation callback |
| `onLogout` | () => void | Logout callback |

### NavigationItem

```typescript
{
  label: string
  href: string
  isActive?: boolean
}
```

### User

```typescript
{
  name: string
  avatarUrl?: string
}
```

## Design Notes

- Uses indigo as primary color for active navigation items and key interactive elements
- Uses emerald for success states and positive actions
- Uses slate for backgrounds, borders, and neutral UI elements
- Typography uses Inter for all text, maintaining consistency and readability on mobile
- Light and dark mode support throughout
- Navigation items highlight when active to show current location
- Mobile overlay includes a close button for easy dismissal
