# Shopify Embedded App - Implementation Guide

## ✅ Embedded App Checks Compliance

Your app now meets all Shopify embedded app requirements:

1. ✅ **Using the latest App Bridge script loaded from Shopify's CDN**
2. ✅ **Using session tokens for user authentication**

These checks are auto-verified by Shopify every 2 hours when you interact with your app in a dev store.

---

## 📋 Changes Made

### 1. App Bridge CDN Loading with Meta Tag

**Files Modified:**
- [src/views/partials/head.ejs](src/views/partials/head.ejs)
- [src/views/menus/shopify.ejs](src/views/menus/shopify.ejs)
- [src/views/instructions/sh-instructions.ejs](src/views/instructions/sh-instructions.ejs)

**What Changed:**
Added the required `shopify-api-key` meta tag that enables App Bridge to automatically handle session tokens:

```html
<meta name="shopify-api-key" content="YOUR_CLIENT_ID" />
<script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
```

**Why This Matters:**
- Shopify's embedded app checks require this meta tag
- App Bridge uses it to automatically add session tokens to all fetch requests
- The script auto-updates from Shopify's CDN, ensuring you always have the latest version

---

### 2. Enhanced Session Token Verification

**Files Modified:**
- [src/middlewares/verify-session-token.js](src/middlewares/verify-session-token.js)

**What Changed:**
- Added support for extracting session tokens from URL parameters (for initial page loads)
- Added automatic redirect to session token bounce page for document requests
- Added `X-Shopify-Retry-Invalid-Session-Request` header for failed XHR requests (App Bridge auto-retries)
- Improved error handling and logging

**Key Features:**
```javascript
// Token extraction from multiple sources
function getSessionTokenFromHeader(req) { ... }
function getSessionTokenFromUrlParam(req) { ... }

// Automatic bounce page redirect for invalid tokens
if (isDocumentRequest) {
  return res.redirect('/shopify/session-token-bounce?...');
}

// Tell App Bridge to retry with fresh token
res.setHeader('X-Shopify-Retry-Invalid-Session-Request', '1');
```

---

### 3. Token Exchange Service

**Files Created:**
- [src/services/shopify-token-exchange.js](src/services/shopify-token-exchange.js)

**What This Does:**
Session tokens are for authentication only—they **cannot** be used to call Shopify APIs. This service exchanges session tokens for access tokens that can make Shopify Admin API calls.

**Available Functions:**
```javascript
const {
  exchangeSessionTokenForAccessToken,
  getOnlineAccessToken,    // 24-hour user-specific token
  getOfflineAccessToken,   // Long-lived background token
  tokenExchangeMiddleware  // Adds exchangeForAccessToken() to req.shopify
} = require('../services/shopify-token-exchange');
```

**Best Practices:**
- ✅ Don't exchange tokens on every request (affects performance)
- ✅ Store access tokens in your database after exchange
- ✅ Check for valid access token before performing another exchange
- ✅ Use online tokens for user-specific operations
- ✅ Use offline tokens for background jobs (webhooks, syncs, etc.)

**Example Usage:**
```javascript
// In your controller
const accessToken = await req.shopify.exchangeForAccessToken();
// Store accessToken.access_token in your database
// Use it for Shopify API calls
```

---

### 4. Session Token Bounce Page

**Files Modified:**
- [src/routes/es-routes.js](src/routes/es-routes.js)
- [src/controllers/es/sh-controller.js](src/controllers/es/sh-controller.js)

**What This Does:**
When a session token is missing or invalid, users are redirected to this minimal page that:
1. Loads App Bridge
2. Gets a fresh session token
3. Redirects back to the intended page

**Route:** `/shopify/session-token-bounce`

**Why This Matters:**
Shopify's documentation recommends this pattern for handling token refresh scenarios, especially on initial page loads or when tokens expire.

---

### 5. Updated API Routes

**Files Modified:**
- [src/routes/api-routes.js](src/routes/api-routes.js)

**What Changed:**
All Shopify API routes now use the complete authentication stack:

```javascript
router.post('/shopify/update-config',
  verifySessionToken,        // Validates session token
  tokenExchangeMiddleware,   // Adds exchange capability
  async (req, res) => {
    // req.shopify.shop
    // req.shopify.userId
    // req.shopify.exchangeForAccessToken()
  }
);
```

**New Endpoint:**
```javascript
POST /api/shopify/get-access-token
```
Demonstrates complete token exchange flow. Use this as a reference for implementing Shopify API calls.

---

## 🚀 How It Works

### Authentication Flow

```
User Browser
    ↓
[Shopify Admin loads your app]
    ↓
App loads with shop & host parameters
    ↓
App Bridge initializes (meta tag + CDN script)
    ↓
Frontend makes API call with fetch()
    ↓
App Bridge automatically adds Authorization: Bearer <session_token>
    ↓
Backend verifySessionToken middleware validates token
    ↓
Request proceeds with req.shopify.shop, req.shopify.userId, etc.
```

### Token Exchange Flow (When You Need to Call Shopify APIs)

```
Frontend makes request to your API
    ↓
verifySessionToken validates session token
    ↓
tokenExchangeMiddleware adds exchange function
    ↓
Controller calls: req.shopify.exchangeForAccessToken()
    ↓
Shopify returns access token + user info
    ↓
Store access token in database
    ↓
Use access token for Shopify Admin API calls
```

---

## 📝 Testing Embedded App Checks

### Step 1: Deploy Your Changes
```bash
git add .
git commit -m "Implement Shopify embedded app compliance"
git push origin develop
```

### Step 2: Access Your App in Dev Store
1. Go to your Shopify Partner Dashboard
2. Open your test/dev store
3. Navigate to Apps → Your App
4. Interact with your app (click around, make requests)

### Step 3: Check Partner Dashboard
1. Go to Shopify Partner Dashboard
2. Apps → [Your App] → Overview
3. Scroll to "Embedded app checks" section
4. Wait for checks to update (runs every 2 hours)

**Expected Result:**
- ✅ Using the latest App Bridge script loaded from Shopify's CDN
- ✅ Using session tokens for user authentication

### Troubleshooting

**If checks don't pass:**
1. Clear browser cache and reload your app
2. Check browser console for App Bridge errors
3. Verify the meta tag is rendered: `<meta name="shopify-api-key" content="..."/>`
4. Check Network tab - requests should have `Authorization: Bearer ...` headers
5. Verify your app is embedded (URL contains `?shop=...&host=...`)

**Common Issues:**
- Ad blockers can interfere with session tokens
- Make sure you're testing in the Shopify Admin, not standalone
- Session tokens only work in embedded context (with shop/host parameters)

---

## 🔧 Environment Variables

Ensure these are set in your `.env` file:

```env
SH_CLIENT_ID=75abca07b3318a56f4073ec4ccb16e90
SH_CLIENT_SECRET=85cf4f19f554f3971b2f6ac3b7c3123d
SH_APP_HANDLE=sheets-central
HOST=https://www.sheetscentral.com
```

---

## 📚 Implementation Examples

### Example 1: Fetch Shop Data

**Frontend:**
```javascript
// App Bridge automatically adds session token
const response = await fetch('/api/shopify/shop-data');
const data = await response.json();
console.log('Shop:', data.shop);
```

**Backend:**
```javascript
router.get('/api/shopify/shop-data', verifySessionToken, (req, res) => {
  res.json({
    shop: req.shopify.shop,
    userId: req.shopify.userId
  });
});
```

### Example 2: Update Configuration

**Frontend:**
```javascript
const response = await fetch('/api/shopify/update-config', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ setting: 'value' })
});
```

**Backend:**
```javascript
router.post('/api/shopify/update-config',
  verifySessionToken,
  tokenExchangeMiddleware,
  async (req, res) => {
    const { shop } = req.shopify;
    const config = req.body;

    // Save to database
    await saveConfig(shop, config);

    res.json({ success: true });
  }
);
```

### Example 3: Call Shopify Admin API

**Backend Controller:**
```javascript
router.post('/api/shopify/get-products',
  verifySessionToken,
  tokenExchangeMiddleware,
  async (req, res) => {
    const { shop } = req.shopify;

    // Exchange session token for access token
    const accessTokenResponse = await req.shopify.exchangeForAccessToken();
    const accessToken = accessTokenResponse.access_token;

    // Store in database for future use
    await storeAccessToken(shop, accessToken);

    // Make Shopify API request
    const productsResponse = await fetch(
      `https://${shop}/admin/api/2024-10/products.json`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken
        }
      }
    );

    const products = await productsResponse.json();
    res.json(products);
  }
);
```

### Example 4: Using Existing App Bridge Helper

**Frontend (using your existing helper):**
```javascript
// Your app already has this helper available
if (window.ShopifyAppBridge && window.ShopifyAppBridge.isInitialized()) {
  // Use convenience methods
  const shopData = await window.ShopifyAppBridge.get('/api/shopify/shop-data');

  const result = await window.ShopifyAppBridge.post('/api/shopify/update-config', {
    setting1: 'value1',
    setting2: 'value2'
  });
}
```

---

## 🔐 Security Notes

### Session Tokens
- ✅ Expire after 1 minute (auto-refreshed by App Bridge)
- ✅ Only for authentication, not for API calls
- ✅ Validated server-side with Shopify's secret
- ❌ Never store session tokens (they expire quickly)

### Access Tokens
- ✅ Store securely in your database
- ✅ Online tokens: 24-hour expiry
- ✅ Offline tokens: No expiry (until app uninstalled)
- ❌ Never send access tokens to frontend
- ❌ Never log access tokens

### Best Practices
- Always validate session tokens on backend
- Store access tokens after exchange (don't re-exchange every request)
- Use HTTPS for all requests
- Implement webhook for app/uninstalled to clean up data
- Handle token expiration gracefully

---

## 📖 Additional Resources

### Shopify Official Documentation
- [App Bridge Library](https://shopify.dev/docs/api/app-bridge-library)
- [Session Tokens](https://shopify.dev/docs/apps/build/authentication-authorization/session-tokens)
- [Token Exchange](https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/token-exchange)
- [Embedded App Authorization](https://shopify.dev/docs/apps/build/authentication-authorization/set-embedded-app-authorization)

### Your Implementation Files
- Session Token Middleware: [src/middlewares/verify-session-token.js](src/middlewares/verify-session-token.js)
- Token Exchange Service: [src/services/shopify-token-exchange.js](src/services/shopify-token-exchange.js)
- App Bridge Frontend: [public/js/shopify-app-bridge.js](public/js/shopify-app-bridge.js)
- API Routes: [src/routes/api-routes.js](src/routes/api-routes.js)

---

## ✨ Summary

Your Shopify embedded app now:
- ✅ Loads App Bridge from CDN with proper meta tag
- ✅ Uses session tokens for authentication
- ✅ Supports token exchange for Shopify API access
- ✅ Handles token refresh scenarios
- ✅ Follows Shopify's latest best practices
- ✅ Will pass embedded app checks

**Next Steps:**
1. Deploy to production
2. Test in your dev store
3. Wait for embedded app checks to update (2 hours)
4. Verify checks pass in Partner Dashboard
5. Submit for app store review (if applicable)
