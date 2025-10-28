# How to Find Your Shopify App Handle

Your app handle is required for the OAuth redirect to work properly. Here's how to find it:

## Method 1: From Shopify Partner Dashboard

1. Go to [Shopify Partner Dashboard](https://partners.shopify.com/)
2. Click on **Apps** in the left sidebar
3. Click on your app name (e.g., "Sheets Central")
4. Look at the URL in your browser - it will be something like:
   ```
   https://partners.shopify.com/[partner_id]/apps/[app_id]/edit
   ```
5. Your app handle is NOT in the URL. Continue to Method 2.

## Method 2: From App Distribution Settings

1. In your Shopify Partner Dashboard, open your app
2. Go to **Configuration** → **App setup**
3. Scroll to **App URL** section
4. The app handle is the last part of your app's URL path

For example, if your app URL is:
```
https://admin.shopify.com/apps/sheets-central
```

Your app handle is: **sheets-central**

## Method 3: From Test Store Installation

1. Install your app in a test store
2. After installation, look at the URL in the Shopify admin
3. It will be: `https://admin.shopify.com/store/[store-name]/apps/[app-handle]`
4. The `[app-handle]` is what you need

## Common App Handles

Based on your setup, your app handle is likely:
- `sheets-central` (most common format)
- `sheetscentral` (no dash)
- Check your Shopify Partner Dashboard to confirm

## Setting the App Handle

Once you find your app handle, add it to your `.env` file:

```bash
SH_APP_HANDLE=sheets-central
```

Replace `sheets-central` with your actual app handle.

## Why is This Needed?

When a merchant installs your app via OAuth, Shopify requires you to redirect them to:
```
https://admin.shopify.com/apps/[app-handle]
```

This ensures the app loads in the embedded context within Shopify admin, which is a requirement for listing on the Shopify App Store.
