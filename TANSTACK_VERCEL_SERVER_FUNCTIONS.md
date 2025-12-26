# How TanStack Start Server Functions Work in Vercel

## Overview

TanStack Start server functions work seamlessly with Vercel's serverless infrastructure **without requiring any custom changes**. This document explains how this integration works under the hood.

## Architecture

### 1. Server Function Definition

TanStack Start uses `createServerFn` to define server-side functions:

```typescript
import { createServerFn } from "@tanstack/react-start";

const getBunInfo = createServerFn({
  method: "GET",
}).handler(async () => {
  return {
    version: Bun.version,
    revision: Bun.revision,
  };
});
```

### 2. Build Process

When you run `bun run build`, TanStack Start:

1. **Bundles the application** into `.output` directory
2. **Creates a server entry point** at `.output/server/index.mjs`
3. **Includes all server functions** in the server bundle
4. **Generates client bundle** in `.output/client`

The server entry point (`index.mjs`) contains:
- All server functions defined with `createServerFn`
- Route loaders that use server functions
- SSR rendering logic
- Request/response handling

### 3. Vercel Detection

Vercel automatically detects TanStack Start applications by:

1. **Checking `vercel.json`** configuration:
   ```json
   {
     "outputDirectory": ".output",
     "functions": {
       ".output/server/index.mjs": {
         "maxDuration": 30
       }
     }
   }
   ```

2. **Recognizing the server entry point** (`.output/server/index.mjs`)

3. **Treating it as a serverless function** that handles all server-side logic

### 4. Request Flow

Here's how requests are handled:

```
Client Request
    ↓
Vercel Edge Network
    ↓
Vercel Serverless Function (.output/server/index.mjs)
    ↓
TanStack Start Router
    ↓
Route Loader (if needed)
    ↓
Server Function (if called)
    ↓
Response (HTML/JSON)
```

## How It Works Without Custom Changes

### Automatic Serverless Function Creation

Vercel automatically:

1. **Wraps the server entry** as a serverless function
2. **Handles routing** - All routes go through the single server function
3. **Manages cold starts** - Functions are invoked on-demand
4. **Scales automatically** - Based on traffic

### Server Function Invocation

When a client calls a server function:

```typescript
// Client-side code
const bunInfo = await getBunInfo();
```

**What happens:**

1. **Client makes HTTP request** to the server function endpoint
2. **Vercel routes to serverless function** (`.output/server/index.mjs`)
3. **TanStack Start handles the request** and executes the server function
4. **Response is sent back** to the client

### Route Loaders with Server Functions

Route loaders can call server functions:

```typescript
export const Route = createFileRoute("/")({
  loader: async () => {
    const bunInfo = await getBunInfo(); // Server function call
    return { bunInfo };
  },
});
```

**During SSR:**
- Loader runs on the server (in Vercel's serverless function)
- Server function executes on the server
- Data is serialized and sent to client

**During client navigation:**
- Loader runs on the client
- Server function is called via HTTP to the serverless function
- Response is received and used to render

## Vercel Configuration

### vercel.json

The `vercel.json` configuration tells Vercel:

```json
{
  "outputDirectory": ".output",
  "functions": {
    ".output/server/index.mjs": {
      "maxDuration": 30
    }
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ]
}
```

**Key points:**

- **`outputDirectory`**: Where Vercel looks for the built application
- **`functions`**: Configures the server entry as a serverless function
- **`maxDuration`**: Maximum execution time (30 seconds for Pro, 10 seconds for Hobby)
- **`rewrites`**: All routes rewrite to `/` for client-side routing

### Why No Custom Changes Needed?

1. **Standard Output Format**: TanStack Start outputs a standard Node.js-compatible server entry
2. **Vercel Auto-Detection**: Vercel recognizes the server entry and treats it as a serverless function
3. **Built-in Routing**: TanStack Start's router handles all routing internally
4. **Standard HTTP**: Server functions use standard HTTP requests/responses

## Example: Your Current Setup

### Server Function in `src/routes/index.tsx`

```typescript
const getBunInfo = createServerFn({
  method: "GET",
}).handler(async () => {
  return {
    version: Bun.version,
    revision: Bun.revision,
  };
});
```

### How It Works on Vercel

1. **Build time**: Function is bundled into `.output/server/index.mjs`
2. **Deploy time**: Vercel creates a serverless function from `index.mjs`
3. **Runtime**: When `getBunInfo()` is called:
   - Client makes request to Vercel
   - Vercel invokes the serverless function
   - Function executes and returns data
   - Response sent back to client

## Benefits

### 1. Automatic Scaling
- Vercel automatically scales serverless functions based on traffic
- No need to manage servers or containers

### 2. Global Distribution
- Functions are deployed to Vercel's edge network
- Low latency worldwide

### 3. Cost Efficiency
- Pay only for execution time
- No idle server costs

### 4. Zero Configuration
- No need to configure serverless function handlers
- No need to set up API routes manually
- TanStack Start handles everything

## Limitations & Considerations

### 1. Cold Starts
- First request after inactivity may have a cold start delay
- Subsequent requests are fast (warm functions)

### 2. Execution Time Limits
- **Hobby plan**: 10 seconds max
- **Pro plan**: 30 seconds max (configurable in `vercel.json`)
- **Enterprise**: Up to 900 seconds

### 3. Memory Limits
- **Hobby plan**: 1024 MB
- **Pro plan**: 3008 MB
- **Enterprise**: Configurable

### 4. Node.js APIs
- Most Node.js APIs work, but some may not be available
- Use standard Web APIs when possible

## Comparison: TanStack Start vs Traditional Serverless

### Traditional Approach (Manual)
```typescript
// api/hello.ts (Vercel serverless function)
export default function handler(req, res) {
  res.json({ message: 'Hello' });
}
```

### TanStack Start Approach (Automatic)
```typescript
// src/routes/index.tsx
const getBunInfo = createServerFn({
  method: "GET",
}).handler(async () => {
  return { version: Bun.version };
});
```

**Key difference:**
- Traditional: Manual function creation, separate files
- TanStack Start: Automatic bundling, single server entry handles everything

## Debugging

### View Function Logs

1. **Vercel Dashboard**: Go to your deployment → Functions → View logs
2. **Vercel CLI**: `vercel logs`

### Local Testing

```bash
# Build locally
bun run build

# Test the server entry
bun .output/server/index.mjs
```

### Common Issues

**Issue**: Server function not working
- **Check**: Ensure function is exported and called correctly
- **Check**: Verify `vercel.json` configuration

**Issue**: Timeout errors
- **Solution**: Increase `maxDuration` in `vercel.json`
- **Check**: Optimize server function performance

**Issue**: Cold start delays
- **Solution**: Use Vercel Pro plan (better cold start performance)
- **Consider**: Keep functions warm with scheduled pings

## Summary

TanStack Start server functions work on Vercel **without custom changes** because:

1. ✅ **Standard output format** - TanStack Start builds a standard Node.js server
2. ✅ **Automatic detection** - Vercel recognizes and wraps the server entry
3. ✅ **Built-in routing** - TanStack Start's router handles all routing
4. ✅ **Standard HTTP** - Server functions use standard HTTP protocol
5. ✅ **Zero configuration** - Just set `outputDirectory` in `vercel.json`

The magic is in TanStack Start's build process, which creates a server entry that Vercel can automatically treat as a serverless function. No manual API route creation needed!

