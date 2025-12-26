---
name: Custom Domain Setup Guide
overview: Configure GoDaddy DNS and Vercel settings to serve the application at app.parvathi.store instead of the default Vercel URL.
todos:
  - id: dns-godaddy
    content: "Configure CNAME record in GoDaddy DNS: Name=app, Value=cname.vercel-dns.com"
    status: pending
  - id: vercel-domain
    content: Add app.parvathi.store as custom domain in Vercel project settings
    status: pending
  - id: verify-dns
    content: Wait for DNS propagation and verify domain status in Vercel dashboard
    status: pending
  - id: test-domain
    content: Test app.parvathi.store in browser to confirm it loads correctly
    status: pending
---

# Custom Domain Setup for Vercel Deployment

This guide will help you configure `app.parvathi.store` to serve your Vercel deployment at `https://pbook-murex.vercel.app/`.

## Overview

The setup involves two main steps:

1. **DNS Configuration** in GoDaddy - Point the subdomain to Vercel
2. **Domain Configuration** in Vercel - Add and verify the custom domain

## Step-by-Step Instructions

### Step 1: Configure DNS in GoDaddy

1. **Log in to GoDaddy**

- Go to [godaddy.com](https://www.godaddy.com) and sign in
- Navigate to "My Products" → "Domains" → Select `parvathi.store`

2. **Access DNS Management**

- Click on "DNS" or "Manage DNS"
- You'll see the DNS records table

3. **Add CNAME Record**

- Click "Add" or "+" to create a new record
- Select record type: **CNAME**
- **Name/Host**: `app` (this creates the `app.parvathi.store` subdomain)
- **Value/Points to**: `cname.vercel-dns.com` (Vercel's CNAME target)
- **TTL**: Keep default (usually 600 seconds or 1 hour)
- Click "Save"

**Important**: Do NOT use an A record. Vercel requires a CNAME record pointing to `cname.vercel-dns.com`.

### Step 2: Add Domain in Vercel

1. **Log in to Vercel**

- Go to [vercel.com](https://vercel.com) and sign in
- Navigate to your project dashboard

2. **Open Project Settings**

- Select your project: `pbook-murex` (or the project name)
- Go to **Settings** → **Domains**

3. **Add Custom Domain**

- In the "Domains" section, enter: `app.parvathi.store`
- Click "Add" or "Add Domain"
- Vercel will attempt to verify the domain

4. **Wait for DNS Propagation**

- DNS changes can take 24-48 hours, but usually propagate within a few minutes to a few hours
- Vercel will show the domain status:
    - **Valid Configuration**: DNS is correctly configured
    - **Invalid Configuration**: DNS needs to be updated (check GoDaddy settings)
    - **Pending**: Waiting for DNS propagation

### Step 3: SSL Certificate (Automatic)

- Vercel automatically provisions SSL certificates via Let's Encrypt
- Once DNS is verified, HTTPS will be enabled automatically
- This typically takes 5-10 minutes after DNS verification

### Step 4: Verify Setup

1. **Check Domain Status in Vercel**

- In Vercel dashboard → Settings → Domains
- Status should show "Valid Configuration" with a green checkmark

2. **Test the Domain**

- Visit `https://app.parvathi.store` in your browser
- The site should load (may take a few minutes after DNS propagation)

3. **Verify HTTPS**

- Ensure the site loads with `https://` (not `http://`)
- Check for the padlock icon in the browser

## Troubleshooting

### Domain Not Resolving

- **Wait longer**: DNS propagation can take up to 48 hours
- **Check DNS records**: Verify the CNAME record in GoDaddy points to `cname.vercel-dns.com`
- **Clear DNS cache**: Try `nslookup app.parvathi.store` in terminal or use online DNS checker

### SSL Certificate Issues

- Wait 10-15 minutes after DNS verification
- Ensure you're accessing via `https://` not `http://`
- Check Vercel dashboard for SSL certificate status

### Vercel Shows "Invalid Configuration"

- Verify the CNAME record in GoDaddy:
- Name: `app`
- Value: `cname.vercel-dns.com`
- Ensure there are no conflicting A records for the subdomain
- Wait a few minutes and refresh the Vercel dashboard

## Optional: Redirect Apex Domain

If you want `parvathi.store` (without `app.`) to also work:

1. **In GoDaddy**: Add an A record:

- Type: **A**
- Name: `@` (or leave blank for root domain)
- Value: `76.76.21.21` (Vercel's IP for apex domains)

2. **In Vercel**: Add `parvathi.store` as an additional domain

**Note**: Vercel recommends using a subdomain (like `app.parvathi.store`) for better flexibility.

## No Code Changes Required

Your application doesn't require any code changes. The domain configuration is handled entirely through DNS and Vercel settings. The app will automatically work with the new domain once DNS is configured correctly.

## Expected Timeline

- **DNS Propagation**: 5 minutes to 48 hours (usually 1-2 hours)
- **Vercel Verification**: Immediate once DNS propagates
- **SSL Certificate**: 5-10 minutes after verification