// src/routes/__root.tsx
/// <reference types="vite/client" />
import { createRootRoute, HeadContent, Link, Outlet, Scripts, useRouter, useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { AppShell, type NavigationItem } from "../components/shell";
import { NavigationWithRole } from "../components/shell/NavigationWithRole";
import { ConvexProviderWithClerk, convex, isConvexConfigured } from "../lib/convex";
import { ClerkProvider, clerkPublishableKey, isClerkConfigured } from "../lib/clerk";
import { useUser, useClerk, useAuth, SignInButton } from "@clerk/clerk-react";
import { Authenticated, Unauthenticated, AuthLoading, useConvexAuth } from "convex/react";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";

import appCss from "../../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "PSBook",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function NotFoundComponent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 antialiased">
      <div className="w-full max-w-md">
        <div className="relative bg-card/80 backdrop-blur-xl text-card-foreground rounded-2xl border border-border/50 shadow-2xl overflow-hidden h-[400px] max-h-4/5 grid grid-rows-[auto_1fr_auto]">
          <div className="px-8 py-6">
            <div className="space-y-2 text-center py-2">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">404</h1>
              <p className="text-lg text-muted-foreground font-medium -mt-2">Page Not Found</p>
            </div>
          </div>

          <div className="px-8 overflow-y-auto">
            <div className="flex flex-col items-center justify-center py-6 min-h-full">
              <p className="text-sm text-muted-foreground text-center">
                The page you're looking for doesn't exist or has been moved.
              </p>
            </div>
          </div>

          <div className="px-8 pb-10">
            <div className="pt-6 border-t border-border/30">
              <Link
                to="/"
                className="block w-full px-4 py-2 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity text-center text-sm"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Component that uses Clerk hooks (only rendered inside ClerkProvider)
function AuthenticatedContent() {
  const router = useRouter();
  const location = useLocation();
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const clerkAuth = useAuth(); // Required for ConvexProviderWithClerk
  
  // Sync role from Clerk to Convex when it changes
  // This is handled by useCurrentUser hook, but we can add explicit sync here if needed
  
  // All navigation items with role requirements
  const allNavigationItems: NavigationItem[] = [
    { label: 'Setup & Configuration', href: '/setup', isActive: location.pathname === '/setup', requireRole: 'admin' },
    { label: 'Daily Operations', href: '/operations', isActive: location.pathname === '/operations', requireRole: 'field_staff' },
    { label: 'Admin Dashboard', href: '/dashboard', isActive: location.pathname === '/dashboard', requireRole: 'admin' },
    { label: 'End-of-Day Reconciliation', href: '/reconciliation', isActive: location.pathname === '/reconciliation', requireRole: 'admin' },
    { label: 'Reports & History', href: '/reports', isActive: location.pathname === '/reports', requireRole: 'admin_or_field_staff' },
  ];

  const handleNavigate = (href: string) => {
    router.navigate({ to: href });
  };

  const handleLogout = async () => {
    await signOut();
    router.navigate({ to: "/" });
  };

  // Get user info from Clerk
  const user = clerkUser
    ? {
        name: clerkUser.fullName || clerkUser.firstName || clerkUser.emailAddresses[0]?.emailAddress || "User",
        avatarUrl: clerkUser.imageUrl,
      }
    : {
        name: "Guest",
        avatarUrl: undefined,
      };

  // Render content based on Convex authentication state
  return (
    <>
      {isConvexConfigured() ? (
        <ConvexProviderWithClerk client={convex} useAuth={() => clerkAuth}>
          <Authenticated>
            <AppContent
              navigationItems={allNavigationItems}
              user={user}
              onNavigate={handleNavigate}
              onLogout={handleLogout}
            />
          </Authenticated>
          <Unauthenticated>
            <SignInPrompt />
          </Unauthenticated>
          <AuthLoading>
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-slate-600 dark:text-slate-400">Loading...</div>
            </div>
          </AuthLoading>
        </ConvexProviderWithClerk>
      ) : (
        <AppContent
          navigationItems={allNavigationItems}
          user={user}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}

// App content component (rendered when authenticated)
function AppContent({
  navigationItems,
  user,
  onNavigate,
  onLogout,
}: {
  navigationItems: NavigationItem[];
  user: { name: string; avatarUrl?: string };
  onNavigate: (href: string) => void;
  onLogout: () => void;
}) {
  return (
    <AppShell
      navigationItems={navigationItems}
      user={user}
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <Outlet />
    </AppShell>
  );
}

// Sign-in prompt for unauthenticated users
function SignInPrompt() {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const { isAuthenticated: isConvexAuthenticated, isLoading: isConvexLoading } = useConvexAuth();
  
  // If Clerk user is signed in but Convex isn't authenticated, show a helpful message
  // This usually means CLERK_JWT_ISSUER_DOMAIN isn't configured in Convex
  if (isClerkLoaded && clerkUser && !isConvexAuthenticated && !isConvexLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Authentication Setup Required
          </h2>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
              <strong>You're signed in with Clerk, but Convex authentication isn't configured.</strong>
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mb-3">
              <strong>Quick Fix (2 steps):</strong>
            </p>
            <ol className="text-xs text-amber-700 dark:text-amber-300 list-decimal list-inside space-y-2 mb-4">
              <li>
                <strong>In Convex Dashboard:</strong>
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>Go to <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">Settings → Environment Variables</code></li>
                  <li>Add: <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">CLERK_JWT_ISSUER_DOMAIN</code> = <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">https://modest-pheasant-12.clerk.accounts.dev</code></li>
                </ul>
              </li>
              <li>
                <strong>In Terminal:</strong> Run <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">npx convex dev</code> (wait for "Deployed")
              </li>
              <li>
                <strong>Refresh browser</strong> and sign in again
              </li>
            </ol>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3 mt-4">
              <p className="text-xs text-blue-800 dark:text-blue-200 font-medium mb-1">
                💡 Also check Clerk Dashboard:
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Make sure you have a <strong>"Convex"</strong> JWT template created in Clerk Dashboard → Configure → JWT Templates. The token name must be exactly <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">convex</code>.
              </p>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-4">
              <strong>Note:</strong> Employee records are created automatically. No manual linking needed!
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Welcome to PSBook
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Please sign in to access the application.
        </p>
        <SignInButton mode="modal">
          <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors cursor-pointer">
            Sign In
          </button>
        </SignInButton>
      </div>
    </div>
  );
}

// Component that doesn't use Clerk hooks (for when Clerk is not configured)
function UnauthenticatedContent() {
  const router = useRouter();
  const location = useLocation();
  
  const navigationItems: NavigationItem[] = [
    { label: 'Setup & Configuration', href: '/setup', isActive: location.pathname === '/setup' },
    { label: 'Daily Operations', href: '/operations', isActive: location.pathname === '/operations' },
    { label: 'Admin Dashboard', href: '/dashboard', isActive: location.pathname === '/dashboard' },
    { label: 'End-of-Day Reconciliation', href: '/reconciliation', isActive: location.pathname === '/reconciliation' },
    { label: 'Reports & History', href: '/reports', isActive: location.pathname === '/reports' },
  ];

  const handleNavigate = (href: string) => {
    router.navigate({ to: href });
  };

  const handleLogout = () => {
    console.log('Logout clicked (Clerk not configured)');
  };

  const user = {
    name: "Guest",
    avatarUrl: undefined,
  };

  const content = (
    <AppShell
      navigationItems={navigationItems}
      user={user}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      <Outlet />
    </AppShell>
  );

  return (
    <>
      {isConvexConfigured() ? (
        <ConvexProviderWithClerk client={convex} useAuth={() => ({ getToken: async () => null })}>
          {content}
        </ConvexProviderWithClerk>
      ) : (
        content
      )}
    </>
  );
}

function RootComponent() {
  return (
    <RootDocument>
      {isClerkConfigured() ? (
        <ClerkProvider publishableKey={clerkPublishableKey}>
          <AuthenticatedContent />
        </ClerkProvider>
      ) : (
        <UnauthenticatedContent />
      )}
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
