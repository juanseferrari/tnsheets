# Shopify Session Tokens - Debugging Guide

This guide will help you debug and test your Shopify session token implementation.

## Updated Implementation (Based on Official Docs)

### Key Changes Made:

1. **Frontend** - Improved error handling and logging
2. **Backend** - Enhanced validation with detailed logging
3. **Both** - Added comprehensive debug output

## Testing Checklist

### 1. Prerequisites

- [ ] App is installed in a Shopify development store
- [ ] `.env` file has correct values:
  ```
  SH_CLIENT_ID=75abca07b3318a56f4073ec4ccb16e90
  SH_CLIENT_SECRET=85cf4f19f554f3971b2f6ac3b7c3123d
  SH_APP_HANDLE=sheets-central
  ```
- [ ] App is accessed through Shopify admin (not directly)

### 2. Frontend Checks

Open browser console when accessing your app from Shopify admin:

**Expected Console Output:**
```
App Bridge initialized successfully
Shop: your-store.myshopify.com
Host: YWRtaW4uc2hvcGlmeS5jb20vc3RvcmUveW91ci1zdG9yZQ==
App is running in embedded context
```

**If you see these errors:**

❌ **"Shop parameter is missing from URL"**
- You're not accessing the app through Shopify admin
- Access it via: `https://admin.shopify.com/store/YOUR_STORE/apps/sheets-central`

❌ **"Host parameter is missing from URL"**
- Same as above - must be accessed from Shopify admin

❌ **"App Bridge is not initialized"**
- Check that the App Bridge scripts are loaded in the correct order
- Verify in your EJS template:
  ```html
  <script src="https://unpkg.com/@shopify/app-bridge@3"></script>
  <script src="https://unpkg.com/@shopify/app-bridge-utils@3"></script>
  <script src="/js/shopify-app-bridge.js"></script>
  ```

### 3. Backend Checks

**Server logs should show:**

✅ **Successful token verification:**
```
[Session Token] Attempting to decode token...
[Session Token] Token length: 500+ (approximately)
[Session Token] Token verified successfully
[Session Token] Payload: {
  dest: 'https://your-store.myshopify.com',
  iss: 'https://your-store.myshopify.com/admin',
  sub: '12345',
  sid: 'abc-123-def',
  exp: '2025-...'
}
```

❌ **Common backend errors:**

**"No authorization header found"**
- Frontend is not sending the token
- Check that `authenticatedFetch()` is being used
- Verify the fetch request includes the Authorization header

**"Invalid authorization format"**
- Token is not in "Bearer <token>" format
- Check frontend is sending: `Authorization: Bearer ${token}`

**"Invalid or expired session token"**
- Token has expired (1-minute lifetime)
- Get a fresh token for each request
- Check server and client clocks are synchronized

**ShopifyError about apiVersion**
- Already fixed - we're using `ApiVersion.October24`

### 4. Testing Session Tokens

#### Test 1: Manual API Call from Browser Console

While in your embedded app, run this in the browser console:

```javascript
// Test getting a session token
const token = await window.shopifyAppBridge.getSessionToken();
console.log('Token:', token);

// Test authenticated fetch
const data = await window.shopifyAppBridge.authenticatedFetch('/api/shopify/shop-data');
console.log('Response:', data);
```

**Expected Response:**
```json
{
  "success": true,
  "shop": "your-store.myshopify.com",
  "message": "Session token verified successfully"
}
```

#### Test 2: Check Token Payload (Debugging Only)

To inspect the token payload (for debugging), you can decode it:

```javascript
const token = await window.shopifyAppBridge.getSessionToken();
const base64Url = token.split('.')[1];
const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
const payload = JSON.parse(window.atob(base64));
console.log('Token Payload:', payload);
```

**Expected Payload:**
```json
{
  "iss": "https://your-store.myshopify.com/admin",
  "dest": "https://your-store.myshopify.com",
  "aud": "75abca07b3318a56f4073ec4ccb16e90",
  "sub": "12345",
  "exp": 1234567890,
  "nbf": 1234567830,
  "iat": 1234567830,
  "jti": "...",
  "sid": "..."
}
```

Verify:
- `aud` matches your `SH_CLIENT_ID`
- `exp` is in the future (Unix timestamp)
- `dest` matches your shop domain

## Common Issues and Solutions

### Issue 1: "Third-party cookies are blocked"

**Solution:** Session tokens are designed to work without third-party cookies, but you must:
1. Access the app through Shopify admin (embedded)
2. Use App Bridge to get tokens
3. Use HTTPS in production

### Issue 2: Token works in console but not in app code

**Solution:**
- Make sure you're waiting for App Bridge to initialize
- Use the `DOMContentLoaded` event or similar
- Check that `appBridgeInstance` is not null before using it

### Issue 3: Backend says "Invalid token" but frontend gets token successfully

**Possible causes:**
1. **API key mismatch** - Check `SH_CLIENT_ID` in `.env` matches Shopify Partner Dashboard
2. **API secret mismatch** - Check `SH_CLIENT_SECRET` is correct
3. **Token format issue** - Ensure `Bearer ` prefix is included
4. **Clock skew** - Server time might be off, check with `date` command

### Issue 4: OAuth works but session tokens don't

This is expected! They serve different purposes:
- **OAuth** = Used once during installation to get access token
- **Session tokens** = Used for every API call after installation

Make sure you're:
1. Accessing the app through Shopify admin after installation
2. Using the session token endpoints, not OAuth endpoints

## Network Debugging

### Check Request Headers

In your browser DevTools Network tab, find the API request and check:

**Request Headers should include:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**If Authorization header is missing:**
- You're not using `authenticatedFetch()`
- App Bridge is not initialized
- Check console for errors

## Environment-Specific Issues

### Development (localhost)

- Shopify allows localhost for testing
- Make sure you're still accessing through: `https://admin.shopify.com/...`
- The app iframe points to your localhost URL

### Production

- Must use HTTPS
- Certificate must be valid
- Update App URLs in Shopify Partner Dashboard

## Advanced Debugging

### Enable Detailed Logging

Add to your server startup (e.g., in `app.js`):

```javascript
if (process.env.NODE_ENV === 'development') {
  process.env.DEBUG = 'shopify:*';
}
```

### Test Backend Directly (Development Only)

You can test the backend validation with a real token:

1. Get a token from browser console (while in embedded app)
2. Use curl or Postman to test:

```bash
curl -X GET http://localhost:5001/api/shopify/shop-data \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Note:** Tokens expire in 1 minute!

## Final Verification

Your implementation is working correctly if:

✅ App loads in Shopify admin without errors
✅ Browser console shows "App Bridge initialized successfully"
✅ API calls return 200 responses (not 401)
✅ Server logs show "[Session Token] Token verified successfully"
✅ You can call `window.shopifyAppBridge.loadShopData()` without errors

## Need More Help?

1. Check server logs for detailed error messages
2. Check browser console for frontend errors
3. Verify all environment variables are set correctly
4. Make sure you're using the latest code from this implementation
5. Test with a fresh Shopify development store

## What's Different from Before

### Previous Issues:
- ❌ Used `LATEST_API_VERSION` (doesn't exist in v12)
- ❌ OAuth callback rendered a page instead of redirecting
- ❌ Limited error logging

### Now Fixed:
- ✅ Uses explicit `ApiVersion.October24`
- ✅ OAuth redirects to Shopify admin
- ✅ Comprehensive logging with `[Session Token]` prefix
- ✅ Better error messages
- ✅ Validation matches official Shopify docs
