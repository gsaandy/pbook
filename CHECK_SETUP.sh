#!/bin/bash
# Quick script to check your setup

echo "🔍 Checking Setup..."
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
  echo "✅ .env.local exists"
  
  # Check for Clerk key
  if grep -q "VITE_CLERK_PUBLISHABLE_KEY" .env.local; then
    echo "✅ VITE_CLERK_PUBLISHABLE_KEY is set"
  else
    echo "❌ VITE_CLERK_PUBLISHABLE_KEY is missing"
  fi
  
  # Check for Convex URL
  if grep -q "VITE_CONVEX_URL" .env.local; then
    echo "✅ VITE_CONVEX_URL is set"
    grep "VITE_CONVEX_URL" .env.local | sed 's/^/   /'
  else
    echo "❌ VITE_CONVEX_URL is missing"
  fi
else
  echo "❌ .env.local file not found"
fi

echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Clerk Dashboard:"
echo "   → Go to https://dashboard.clerk.com"
echo "   → Configure → JWT Templates"
echo "   → Make sure 'Convex' template exists (token name must be 'convex')"
echo ""
echo "2. Convex Dashboard:"
echo "   → Go to https://dashboard.convex.dev"
echo "   → Settings → Environment Variables"
echo "   → Add: CLERK_JWT_ISSUER_DOMAIN = https://modest-pheasant-12.clerk.accounts.dev"
echo ""
echo "3. Deploy:"
echo "   → Run: npx convex dev"
echo "   → Wait for 'Deployed successfully'"
echo ""
echo "4. Test:"
echo "   → Refresh browser"
echo "   → Sign in again"

