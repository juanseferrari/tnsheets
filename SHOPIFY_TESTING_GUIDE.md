# Quick Testing Guide for Shopify Session Tokens

## Before You Start

Make sure your environment variables are set:
```bash
# Check if variables exist
echo $SH_CLIENT_ID
echo $SH_CLIENT_SECRET
```

## Testing Checklist

### ✅ Step 1: Test Standalone OAuth Flow (Non-embedded)

1. **Start your server:**
   ```bash
   npm start
   ```

2. **Visit your app:**
   ```
   http://localhost:5001/shopify
   ```

3. **Expected behavior:**
   - You see the login page with URL input
   - Console shows: `[Shopify App Bridge] Not in embedded context`
   - No session token errors (this is normal)

4. **Complete OAuth:**
   - Enter a valid Shopify store URL
   - Click "Login Shopify"
   - Complete OAuth authorization
   - Get redirected back to your app

### ✅ Step 2: Test Embedded Context (Inside Shopify Admin)

**Option A: Using ngrok (Recommended for local testing)**

1. **Install ngrok:**
   ```bash
   npm install -g ngrok
   ```

2. **Start ngrok tunnel:**
   ```bash
   ngrok http 5001
   ```

   You'll get a URL like: `https://abc123.ngrok.io`

3. **Update Shopify Partner Dashboard:**
   - Go to: https://partners.shopify.com
   - Select your app
   - Update **App URL**: `https://abc123.ngrok.io/shopify`
   - Update **Allowed redirection URL**: `https://abc123.ngrok.io/shopify/oauth`
   - Save changes

4. **Test in Shopify Admin:**
   - Go to your dev store
   - Navigate to: Apps > [Your App Name]
   - Your app should load embedded in Shopify Admin

5. **Open browser console (F12) and look for:**
   ```
   ✅ [Shopify App Bridge] Initializing...
   ✅ [Shopify App Bridge] Initialized successfully
   ✅ [Shopify App Bridge] Shop: your-store.myshopify.com
   ✅ [Shopify Session Token] Refreshing token...
   ✅ [Shopify Session Token] Token refreshed successfully
   ✅ [Session Token Test] Testing authenticated API calls...
   ✅ [Session Token Test] Session tokens are working correctly!
   ```

**Option B: Production Testing**

1. **Deploy to production** (you're already on https://www.sheetscentral.com)

2. **Verify Shopify Partner Dashboard settings:**
   - App URL: `https://www.sheetscentral.com/shopify`
   - Redirection URL: `https://www.sheetscentral.com/shopify/oauth`

3. **Test in Shopify Admin:**
   - Go to your dev store
   - Navigate to: Apps > [Your App Name]
   - Check console for session token logs

### ✅ Step 3: Test Backend Session Token Validation

1. **Watch server logs** while testing in embedded context:
   ```bash
   npm start
   ```

2. **Expected server logs:**
   ```
   [Session Token] Attempting to decode token...
   [Session Token] Token length: XXX
   [Session Token] Token verified successfully
   [Session Token] Payload: {
     dest: 'https://your-store.myshopify.com',
     iss: 'https://your-store.myshopify.com/admin',
     sub: 'user-id',
     sid: 'session-id',
     exp: '...'
   }
   ```

3. **If you see errors:**
   - Check that `SH_CLIENT_SECRET` is correct
   - Verify the token is being sent in Authorization header
   - Check middleware is applied to the route

### ✅ Step 4: Test API Endpoints

**Using Browser Console (when embedded):**

```javascript
// Test 1: Check if initialized
console.log('Initialized:', window.ShopifyAppBridge.isInitialized());

// Test 2: Get session info
console.log('Session:', window.ShopifyAppBridge.getSessionInfo());

// Test 3: Get shop data
const shopData = await window.ShopifyAppBridge.get('/api/shopify/shop-data');
console.log('Shop data:', shopData);

// Test 4: Update config
const result = await window.ShopifyAppBridge.post('/api/shopify/update-config', {
  testSetting: 'testValue'
});
console.log('Update result:', result);
```

**Expected responses:**

```javascript
// GET /api/shopify/shop-data
{
  "success": true,
  "shop": "your-store.myshopify.com",
  "message": "Session token verified successfully"
}

// POST /api/shopify/update-config
{
  "success": true,
  "message": "Configuration updated successfully",
  "shop": "your-store.myshopify.com"
}
```

## Common Issues & Solutions

### Issue 1: "App Bridge library not loaded"

**Symptoms:**
```
[Shopify App Bridge] App Bridge library not loaded. Make sure the CDN script is included.
```

**Solution:**
- Check that `<script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>` is in head.ejs
- Clear browser cache
- Verify script loads in Network tab (F12 > Network)

### Issue 2: "Shop parameter is missing from URL"

**Symptoms:**
```
[Shopify App Bridge] Not in embedded context (no shop/host parameters)
```

**Cause:** This is **NORMAL** for standalone OAuth flow

**When it's a problem:**
- If you see this when accessing app from Shopify Admin
- Check that you're accessing the correct URL
- Verify app is installed in the store

### Issue 3: "Invalid or expired session token"

**Symptoms:**
```
[Session Token] Error decoding session token
```

**Solutions:**
1. Check `SH_CLIENT_SECRET` matches your Shopify app secret
2. Ensure system time is correct (JWT validation is time-sensitive)
3. Try refreshing the token: `window.ShopifyAppBridge.clearToken()`
4. Check server logs for detailed error message

### Issue 4: 401 Unauthorized

**Symptoms:**
```
[Shopify Authenticated Fetch] Got 401
```

**Solutions:**
1. Verify middleware is applied to route:
   ```javascript
   router.get('/api/shopify/shop-data', verifySessionToken, handler);
   ```
2. Check Authorization header is being sent:
   ```javascript
   // In browser console
   const token = await window.ShopifyAppBridge.getSessionToken();
   console.log('Token:', token);
   ```
3. Verify backend can decode token:
   - Check server logs for error details

### Issue 5: CORS errors

**Symptoms:**
```
Access to fetch at '...' has been blocked by CORS policy
```

**Solutions:**
1. Make sure requests go to same domain (no cross-origin)
2. Verify your app URL matches the URL you're accessing
3. Check that you're not mixing http/https

## Testing with curl (Alternative)

If you want to test backend directly:

1. **Get a session token** from browser console:
   ```javascript
   const token = await window.ShopifyAppBridge.getSessionToken();
   console.log(token);
   ```

2. **Test with curl:**
   ```bash
   curl -X GET \
     https://www.sheetscentral.com/api/shopify/shop-data \
     -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -H "Content-Type: application/json"
   ```

**Note:** Tokens expire in 1 minute, so test quickly!

## Monitoring Session Tokens

**Add this to your page for continuous monitoring:**

```javascript
// Monitor session token status
setInterval(() => {
  if (window.ShopifyAppBridge && window.ShopifyAppBridge.isInitialized()) {
    const info = window.ShopifyAppBridge.getSessionInfo();
    console.log('[Monitor]', new Date().toLocaleTimeString(), info);
  }
}, 10000); // Check every 10 seconds
```

## Verification for Shopify App Review

When Shopify reviews your app, they check:

1. ✅ **App Bridge loaded from CDN** (not npm)
   - Verify: View page source, search for `cdn.shopify.com/shopifycloud/app-bridge.js`

2. ✅ **Session tokens used for authentication**
   - Verify: Check Network tab (F12), look for requests with `Authorization: Bearer` header

3. ✅ **Backend validates tokens**
   - Verify: Check server logs show token validation

4. ✅ **App works in embedded context**
   - Verify: Test app inside Shopify Admin

## Final Checklist

Before deploying to production:

- [ ] Environment variables set correctly
- [ ] App Bridge script loads from CDN
- [ ] Session tokens work in embedded context
- [ ] Backend validates tokens correctly
- [ ] API endpoints return expected data
- [ ] No console errors in browser
- [ ] No server errors in logs
- [ ] Shopify Partner Dashboard settings correct
- [ ] Tested on a dev store
- [ ] OAuth flow works
- [ ] Embedded app loads correctly

## Quick Debug Commands

```javascript
// In browser console:

// 1. Check initialization
window.ShopifyAppBridge.isInitialized()

// 2. Get token
await window.ShopifyAppBridge.getSessionToken()

// 3. Get session info
window.ShopifyAppBridge.getSessionInfo()

// 4. Test endpoint
await window.ShopifyAppBridge.get('/api/shopify/shop-data')

// 5. Clear token and force refresh
window.ShopifyAppBridge.clearToken()
await window.ShopifyAppBridge.getSessionToken()
```

## Need More Help?

Check these files:
- **Implementation details**: [SHOPIFY_SESSION_TOKENS_IMPLEMENTATION.md](SHOPIFY_SESSION_TOKENS_IMPLEMENTATION.md)
- **Frontend code**: [public/js/shopify-app-bridge.js](public/js/shopify-app-bridge.js)
- **Backend middleware**: [src/middlewares/verify-session-token.js](src/middlewares/verify-session-token.js)
- **API routes**: [src/routes/api-routes.js](src/routes/api-routes.js)

Good luck! 🚀
