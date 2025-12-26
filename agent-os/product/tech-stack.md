# Technical Stack: Cash Collection & Reconciliation System (MVP)

## Overview

This document defines the complete technical stack for the Cash Collection & Reconciliation System MVP. All technology choices are documented here to maintain consistency across the project.

**Core Philosophy:** Simplicity over complexity. The tech stack is chosen to support quick development, excellent mobile experience, and real-time data synchronization without unnecessary complexity.

---

## Application Framework & Runtime

### Framework
- **Name**: TanStack Start
- **Version**: ^1.135.2
- **Purpose**: Full-stack React framework with SSR, file-based routing, and server functions
- **Rationale**: 
  - Modern React framework with excellent developer experience
  - Built-in SSR and server functions reduce complexity
  - File-based routing simplifies route management
  - Excellent TypeScript support

### Runtime
- **Name**: Bun
- **Version**: Latest stable (v1.3.3+)
- **Purpose**: JavaScript runtime, package manager, and bundler
- **Rationale**:
  - Fast runtime performance
  - Built-in package manager (no npm/yarn needed)
  - Native TypeScript support
  - Excellent developer experience

### Package Manager
- **Name**: Bun (built-in)
- **Purpose**: Dependency management and script execution
- **Rationale**: Integrated with Bun runtime, faster than npm/yarn

---

## Frontend

### Design Philosophy
- **Approach**: Mobile-First Progressive Web App (PWA)
- **Rationale**: 
  - Field employees primarily use mobile devices for cash collection
  - Mobile-first ensures optimal experience on primary devices
  - Easier to scale up than scale down
  - Better performance on mobile networks
  - Aligns with modern web best practices
  - PWA enables app-like experience with offline capabilities
- **Implementation**:
  - All components designed for mobile screens first (< 640px)
  - Progressive enhancement for tablet (640px - 1024px) and desktop (> 1024px)
  - Touch-optimized interactions (minimum 44x44px touch targets)
  - Mobile-optimized forms and inputs
  - Simplified navigation for small screens
  - PWA manifest for installability
  - Service worker for offline functionality
  - App icons and splash screens

### JavaScript Framework
- **Name**: React
- **Version**: ^19.2.0
- **Purpose**: UI component library
- **Rationale**: Industry standard, excellent ecosystem, strong TypeScript support

### Router
- **Name**: TanStack Router
- **Version**: ^1.135.2
- **Purpose**: Client-side and server-side routing
- **Rationale**: Type-safe routing, file-based routes, integrated with TanStack Start

### CSS Framework
- **Name**: Tailwind CSS
- **Version**: ^4.1.17
- **Purpose**: Utility-first CSS framework
- **Rationale**: 
  - Rapid UI development
  - Consistent design system
  - Small bundle size
  - Excellent responsive design utilities
  - Mobile-first responsive breakpoints

### CSS Integration
- **Name**: @tailwindcss/vite
- **Version**: ^4.1.17
- **Purpose**: Vite plugin for Tailwind CSS
- **Rationale**: Seamless integration with Vite build system

### UI Components
- **Name**: shadcn/ui
- **Website**: https://ui.shadcn.com/
- **Purpose**: Beautiful, accessible, customizable React components
- **Rationale**: 
  - Copy-paste component model (not a dependency)
  - Built on Radix UI primitives for accessibility
  - Fully customizable with Tailwind CSS
  - Excellent TypeScript support
  - Mobile-first component design
  - Active community and extensive component library
  - Touch-friendly components out of the box

### Progressive Web App (PWA)
- **Name**: PWA Support
- **Purpose**: App-like experience with offline capabilities and installability
- **Features**:
  - **Installable**: Users can install the app on their mobile devices
  - **Offline Support**: Service worker enables offline functionality
  - **App Icons**: Custom icons for home screen installation
  - **Splash Screens**: Native app-like launch experience
  - **Push Notifications**: (Future) Real-time notifications for entry closures
  - **Background Sync**: (Future) Sync data when connection is restored
- **Implementation**:
  - Web App Manifest (`manifest.json`)
  - Service Worker for caching and offline support
  - Vite PWA plugin for automatic service worker generation
  - Offline-first strategy for critical data
  - Cache API for static assets and API responses
- **Rationale**: 
  - **Better UX**: App-like experience without app store distribution
  - **Offline Capability**: Field employees can work in areas with poor connectivity
  - **Installability**: Users can add to home screen for quick access
  - **Performance**: Cached assets load faster
  - **Reduced Data Usage**: Cached resources reduce mobile data consumption
  - **Native Feel**: Splash screens and app icons provide native app experience

---

## Backend

### Backend Platform
- **Name**: Convex
- **Website**: https://www.convex.dev/
- **Purpose**: Complete backend platform with database, real-time sync, and authentication
- **Rationale**: 
  - **Type-safe backend**: Everything is TypeScript - schemas, queries, mutations, auth
  - **Real-time by default**: Automatic real-time updates without websockets or state management
  - **Built-in database**: Document database with relational capabilities
  - **Built-in authentication**: Over 80+ OAuth integrations including Google
  - **Excellent DX**: Backend code lives next to frontend, full type safety
  - **No infrastructure management**: Fully managed platform
  - **AI-friendly**: LLMs generate high-quality Convex code
  - **TanStack Start integration**: Official quickstart guide available

### Server Framework
- **Name**: TanStack Start Server Functions (for non-Convex operations)
- **Purpose**: Server-side rendering and additional server functions if needed
- **Rationale**: Integrated with TanStack Start, complements Convex backend

### API Architecture
- **Pattern**: Convex Queries & Mutations + Server Functions (hybrid)
- **Purpose**: 
  - Convex handles all data operations (queries, mutations, real-time subscriptions)
  - Server Functions for SSR and additional server-side logic
- **Rationale**: 
  - Convex provides type-safe, real-time data layer
  - Server Functions handle SSR and edge cases
  - End-to-end type safety from database to UI

### Convex Integration with TanStack Start
- **Official Support**: Convex has official TanStack Start quickstart guide
- **Integration Pattern**:
  - Convex client initialized in TanStack Start app
  - Convex queries/mutations used in React components
  - Real-time subscriptions via `useQuery` hook
  - Server Functions can call Convex if needed
- **Type Safety**: Full end-to-end type safety from Convex schema to React components
- **Real-time**: Automatic UI updates when Convex data changes
- **Rationale**: Seamless integration between TanStack Start and Convex backend

---

## Database & Storage

### Database
- **Name**: Convex Database
- **Purpose**: Managed document database with relational capabilities
- **Features**:
  - Schema defined in TypeScript (`convex/schema.ts`)
  - Type-safe queries and mutations
  - Automatic indexing
  - Real-time subscriptions
  - ACID transactions
  - Decimal precision for financial data
- **Rationale**: 
  - Fully managed, no database administration needed
  - Type-safe from schema to queries
  - Real-time updates built-in
  - Excellent for complex relationships (routes, shops, employees, entries, transactions)
  - Decimal type support for financial amounts

### Data Access
- **Pattern**: Convex Queries & Mutations
- **Purpose**: Type-safe database operations
- **Rationale**: 
  - Queries automatically update UI when data changes
  - Mutations are type-safe and validated
  - No ORM needed - Convex handles it
  - Automatic caching and optimization

### Database Migrations
- **Tool**: Convex Schema Evolution
- **Purpose**: Version-controlled schema changes
- **Rationale**: Convex handles schema migrations automatically with version control

### Caching
- **Name**: Convex Built-in Caching
- **Purpose**: Automatic caching and optimization
- **Rationale**: Convex handles caching automatically, no Redis needed

---

## Authentication & Authorization

### Authentication Platform
- **Name**: Clerk
- **Website**: https://clerk.com/
- **Purpose**: Complete authentication and user management platform
- **Features**:
  - Multiple authentication methods (Email, OAuth, Magic Links, etc.)
  - Pre-built UI components
  - User management dashboard
  - Session management
  - Multi-factor authentication support
  - Social OAuth providers (Google, GitHub, etc.)
  - Type-safe authentication
  - Automatic user profile management
- **Rationale**: 
  - **Complete solution**: Full-featured authentication platform
  - **Pre-built components**: Fast development with ready-made UI
  - **Excellent DX**: Great developer experience and documentation
  - **Flexible**: Multiple auth methods and providers
  - **Secure by default**: Industry-standard security practices
  - **User management**: Built-in user management dashboard
  - **Convex integration**: Works seamlessly with Convex backend

### Authentication Flow
- **Pattern**: Clerk for authentication, Convex for data
- **Implementation**: 
  - Clerk handles all authentication flows
  - User profile stored in Clerk
  - Clerk user ID stored in Convex database (employees table)
  - Session managed by Clerk
  - Type-safe auth state via Clerk React hooks
  - Convex queries/mutations use Clerk user ID for authorization
- **Rationale**: 
  - Clerk provides excellent auth UX and management
  - Convex handles data operations
  - Clear separation of concerns

### Authorization
- **Pattern**: Role-Based Access Control (RBAC)
- **Roles**: Admin, Employee
- **Implementation**: 
  - Roles stored in Clerk (user metadata) and Convex database (employees table)
  - Clerk provides user authentication
  - Convex queries/mutations check user roles from employees table
  - TanStack Router guards for route protection using Clerk
- **Rationale**: 
  - Clerk manages authentication
  - Convex manages business data and role associations
  - Clear separation of permissions, type-safe role checking

---

## Build Tools & Development

### Build Tool
- **Name**: Vite
- **Version**: ^7.2.2
- **Purpose**: Build tool and dev server
- **Rationale**: 
  - Fast HMR (Hot Module Replacement)
  - Optimized production builds
  - Excellent plugin ecosystem

### PWA Plugin
- **Name**: vite-plugin-pwa
- **Purpose**: Automatic PWA manifest and service worker generation
- **Features**:
  - Generates web app manifest
  - Creates service worker automatically
  - Handles asset caching strategies
  - Workbox integration for advanced caching
  - Offline fallback pages
- **Rationale**: 
  - Simplifies PWA setup
  - Automatic service worker updates
  - Configurable caching strategies
  - Production-ready PWA features out of the box

### TypeScript
- **Version**: ^5.9.3
- **Purpose**: Type safety and developer experience
- **Rationale**: 
  - Catch errors at compile time
  - Better IDE support
  - Self-documenting code

### Type Definitions
- **@types/react**: ^19.2.3
- **@types/react-dom**: ^19.2.3
- **@types/bun**: ^1.3.2
- **Purpose**: TypeScript definitions for libraries

### Path Resolution
- **Name**: vite-tsconfig-paths
- **Version**: ^5.1.4
- **Purpose**: TypeScript path alias resolution in Vite
- **Rationale**: Clean import paths

---

## Testing & Quality Assurance

### Test Framework
- **Name**: To be determined
- **Options**:
  - **Bun Test** (recommended)
    - Built into Bun runtime
    - Fast execution
    - Good TypeScript support
  - **Vitest**
    - Vite-native test runner
    - Excellent Vite integration
    - Jest-compatible API
- **Rationale**: Fast, modern test runner

### E2E Testing
- **Name**: To be determined
- **Options**:
  - **Playwright** (recommended)
    - Cross-browser testing
    - Excellent debugging tools
    - Good documentation
  - **Puppeteer**
    - Chrome/Chromium focused
    - Good performance
- **Rationale**: End-to-end testing for critical workflows

### Linting & Formatting
- **Name**: Biome
- **Website**: https://biomejs.dev/
- **Purpose**: Unified toolchain for linting and formatting
- **Features**:
  - Fast linter (10-100x faster than ESLint)
  - Built-in formatter (faster than Prettier)
  - TypeScript/JavaScript support
  - React support
  - Single tool for both linting and formatting
  - Zero configuration needed
- **Rationale**: 
  - **Performance**: Significantly faster than ESLint + Prettier
  - **Unified**: One tool instead of two
  - **Zero config**: Works out of the box
  - **TypeScript native**: Excellent TypeScript support
  - **Modern**: Built for modern JavaScript/TypeScript projects

---

## Reporting & Export

### PDF Generation
- **Name**: To be determined
- **Options**:
  - **PDFKit** (Node.js)
  - **jsPDF** (client-side)
  - **Puppeteer** (HTML to PDF)
- **Rationale**: Generate PDF reports for cash collection and route reports

### Excel Export
- **Name**: To be determined
- **Options**:
  - **ExcelJS** (recommended)
    - Full Excel file support
    - Good formatting options
  - **xlsx** (SheetJS)
    - Lightweight
    - Good performance
- **Rationale**: Export reports to Excel format

### CSV Export
- **Implementation**: Native JavaScript/TypeScript
- **Purpose**: Simple CSV file generation
- **Rationale**: Lightweight, no dependencies needed

---

## Deployment & Infrastructure

### Hosting Platform
- **Backend**: Convex (fully managed)
  - No infrastructure management needed
  - Automatic scaling
  - Global edge deployment
  - Built-in database and auth
- **Frontend**: To be determined
  - **Vercel** (recommended)
    - Excellent TanStack Start support
    - Simple deployment
    - Edge functions support
    - Great performance
  - **Railway**
    - Good Bun support
    - Simple deployment
  - **Fly.io**
    - Global edge deployment
    - Good performance
- **Rationale**: 
  - Convex handles all backend hosting automatically
  - Frontend can be deployed to any platform supporting Node.js/Bun
  - Vercel recommended for best TanStack Start integration

### CI/CD
- **Name**: To be determined
- **Options**:
  - **GitHub Actions** (recommended)
    - Integrated with GitHub
    - Free for public repos
    - Extensive plugin ecosystem
  - **GitLab CI/CD**
    - If using GitLab
  - **CircleCI**
    - Alternative option
- **Rationale**: Automated testing and deployment

### Environment Management
- **Tool**: `.env` files with validation
- **Purpose**: Manage environment variables
- **Rationale**: Secure configuration management

---

## Monitoring & Observability

### Error Tracking
- **Name**: To be determined
- **Options**:
  - **Sentry** (recommended)
    - Excellent error tracking
    - Good React support
    - Performance monitoring
  - **LogRocket**
    - Session replay
    - Error tracking
- **Rationale**: Track and debug production errors

### Logging
- **Implementation**: Structured logging
- **Purpose**: Application and audit logging
- **Rationale**: Debugging and compliance requirements

### Analytics
- **Name**: To be determined (optional)
- **Options**:
  - **Google Analytics**
  - **Plausible** (privacy-focused)
- **Rationale**: User behavior insights (if needed)

---

## Security

### Security Practices
- HTTPS/TLS for all communications (Convex enforced)
- Input validation and sanitization (Convex schema validation)
- Injection prevention (Convex handles database security)
- XSS prevention (React's built-in escaping)
- CSRF protection (Convex built-in)
- Secure session management (Clerk)
- Rate limiting (Convex built-in)
- SOC 2 Type II compliant (Convex)
- HIPAA compliant (Convex)
- GDPR verified (Convex)

### Security Tools
- **Dependency Scanning**: Built into Bun package manager
- **Security Audits**: Regular dependency audits
- **Code Scanning**: Biome security rules
- **Platform Security**: Convex handles infrastructure security

---

## Development Tools

### Version Control
- **Name**: Git
- **Hosting**: GitHub/GitLab (to be determined)

### Code Editor
- **Recommended**: VS Code / Cursor
- **Extensions**: 
  - Biome (official extension)
  - TypeScript
  - Tailwind CSS IntelliSense
  - Convex (official extension)

---

## Third-Party Services

### Email Service
- **Name**: To be determined (if needed)
- **Options**:
  - **SendGrid**
  - **Postmark**
  - **Resend**
- **Purpose**: Email notifications (entry closure, etc.)
- **Rationale**: Reliable email delivery

### SMS Service (Optional)
- **Name**: To be determined
- **Purpose**: SMS notifications
- **Rationale**: Optional feature for future phases

---

## Architecture Decisions

### Monolithic vs Microservices
- **Decision**: Monolithic (initially)
- **Rationale**: 
  - Simpler to develop and deploy
  - Easier to maintain for MVP
  - Can refactor to microservices later if needed

### Server-Side Rendering
- **Decision**: Yes (via TanStack Start)
- **Rationale**: 
  - Better SEO (if needed)
  - Faster initial page loads
  - Better user experience

### API Style
- **Decision**: Server Functions (RPC-style)
- **Rationale**: 
  - Type safety
  - Simplified API design
  - Integrated with TanStack Start

### Progressive Web App
- **Decision**: Yes, PWA-enabled
- **Rationale**: 
  - App-like experience without app store distribution
  - Offline capability critical for field employees
  - Installable on mobile devices
  - Faster load times with caching
  - Reduced mobile data usage
  - Better user engagement

### Database Design
- **Decision**: Convex Database (document database with relational capabilities)
- **Rationale**: 
  - Complex relationships supported via references
  - ACID compliance for financial data
  - Decimal precision for amounts
  - Type-safe schema definition
  - Real-time updates built-in
  - No database administration needed

---

## UX Design Philosophy

### Mobile-First Approach
- **Primary Target**: Mobile devices (phones)
- **Design Strategy**: 
  - All components and layouts designed for mobile screens first
  - Progressive enhancement for larger screens
  - Touch-optimized interactions
  - Simplified navigation for small screens
  - Optimized form inputs for mobile keyboards
- **Rationale**: 
  - Field employees primarily use mobile devices
  - Mobile-first ensures best experience on primary devices
  - Easier to scale up than scale down
  - Better performance on mobile devices
  - Aligns with modern web best practices

### Responsive Breakpoints
- **Mobile**: < 640px (primary focus)
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Design Principles
- **Touch-friendly**: Minimum 44x44px touch targets
- **Readable**: Large, clear typography
- **Fast**: Optimized for mobile network speeds
- **Accessible**: WCAG 2.1 AA compliance
- **Intuitive**: Minimal learning curve for field employees
- **Installable**: PWA can be installed on home screen
- **Offline-capable**: Works offline with service worker caching

---

## Technology Stack Summary

| Category | Technology | Status |
|----------|-----------|--------|
| Runtime | Bun | ✅ Selected |
| Framework | TanStack Start | ✅ Selected |
| Frontend | React 19 | ✅ Selected |
| Router | TanStack Router | ✅ Selected |
| CSS | Tailwind CSS 4 | ✅ Selected |
| UI Components | shadcn/ui | ✅ Selected |
| PWA | vite-plugin-pwa | ✅ Selected |
| Build Tool | Vite | ✅ Selected |
| TypeScript | 5.9.3 | ✅ Selected |
| Backend Platform | Convex | ✅ Selected |
| Database | Convex Database | ✅ Selected |
| Auth | Clerk | ✅ Selected |
| Linting/Formatting | Biome | ✅ Selected |
| Testing | Bun Test/Vitest | 🔄 To be selected |
| Hosting | Convex (backend) + Vercel/Railway (frontend) | 🔄 To be selected |
| CI/CD | GitHub Actions | 🔄 To be selected |
| UX Approach | Mobile-First PWA | ✅ Selected |

---

## Migration & Upgrade Path

### Framework Updates
- TanStack Start: Follow semantic versioning, test before upgrading
- React: Follow React upgrade guidelines
- Bun: Regular updates recommended for security

### Database Migrations
- Use Convex schema evolution system
- Schema changes are version-controlled automatically
- Test migrations in development environment first
- Convex handles backups automatically

---

## Performance Considerations

### Frontend
- Code splitting via TanStack Router
- Lazy loading for large lists
- Image optimization
- CSS purging (Tailwind)
- PWA caching for faster subsequent loads
- Service worker for offline functionality
- Asset preloading for critical resources

### Backend
- Convex automatic query optimization
- Built-in caching (no Redis needed)
- Automatic connection management
- Index optimization via Convex schema

### Build
- Vite optimizations
- Tree shaking
- Minification
- Compression

---

## Browser Support

### Supported Browsers
- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

### Mobile Support
- **Mobile-First Design**: All UI components and layouts designed mobile-first
- **Responsive design**: Optimized for mobile, enhanced for tablet and desktop
- **Touch-optimized**: All interactions optimized for touch devices
- **Full functionality on mobile**: Complete feature parity across all devices
- **Progressive enhancement**: Core features work on mobile, enhanced on larger screens
- **PWA Installation**: Users can install the app on their mobile devices
- **Offline Capability**: Service worker enables offline functionality for field work
- **App-like Experience**: Native app feel with splash screens and app icons

---

## Documentation

### API Documentation
- **Tool**: To be determined
- **Options**: 
  - OpenAPI/Swagger
  - TypeDoc (for TypeScript)
- **Purpose**: Document server functions and APIs

### Code Documentation
- **Tool**: JSDoc/TSDoc
- **Purpose**: Inline code documentation
- **Rationale**: Self-documenting code

---

**Last Updated**: [Current Date]  
**Status**: Active Development  
**Next Review**: End of Phase 1

