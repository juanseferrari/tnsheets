# Dashboard Setup Guide - dashboard.sheetscentral.com

## Overview

You now have a dedicated dashboard subdomain at `dashboard.sheetscentral.com` that serves a separate application from your main site. This guide shows you how to test it locally and deploy it to production.

## What Was Created

### 1. **Controller** ([src/controllers/dashboard-controller.js](src/controllers/dashboard-controller.js))
   - `home()` - Main dashboard page
   - `analytics()` - Analytics page (placeholder)
   - `settings()` - Settings page (placeholder)
   - `getDashboardDataAPI()` - JSON API endpoint
   - `getUserDashboardData()` - Helper function to fetch user stats

### 2. **Routes** ([src/routes/dashboard-routes.js](src/routes/dashboard-routes.js))
   - `GET /` - Dashboard home
   - `GET /analytics` - Analytics (requires auth)
   - `GET /settings` - Settings (requires auth)
   - `GET /api/data` - Dashboard data API (requires auth)
   - `GET /health` - Health check endpoint

### 3. **Views** ([src/views/dashboard/](src/views/dashboard/))
   - `home.ejs` - Main dashboard page with stats cards and quick actions
   - `analytics.ejs` - Analytics page (placeholder)
   - `settings.ejs` - Settings page (placeholder)

### 4. **App Configuration** ([app.js](app.js#L27-38))
   - Hostname-based routing for `dashboard.sheetscentral.com`
   - Also works with `dashboard.localhost` for local testing

## Local Testing (Localhost)

### Method 1: Using /etc/hosts (Recommended)

This is the easiest method and works on all platforms.

#### macOS/Linux:

1. **Edit your hosts file:**
   ```bash
   sudo nano /etc/hosts
   ```

2. **Add this line:**
   ```
   127.0.0.1   dashboard.localhost
   ```

3. **Save and exit:**
   - Press `Ctrl+X`, then `Y`, then `Enter`

4. **Flush DNS cache (macOS):**
   ```bash
   sudo dscacheutil -flushcache
   sudo killall -HUP mDNSResponder
   ```

5. **Start your server:**
   ```bash
   npm start
   ```

6. **Access the dashboard:**
   ```
   http://dashboard.localhost:5001
   ```

#### Windows:

1. **Open Notepad as Administrator**

2. **Open file:** `C:\Windows\System32\drivers\etc\hosts`

3. **Add this line:**
   ```
   127.0.0.1   dashboard.localhost
   ```

4. **Save the file**

5. **Flush DNS cache:**
   ```bash
   ipconfig /flushdns
   ```

6. **Start your server:**
   ```bash
   npm start
   ```

7. **Access the dashboard:**
   ```
   http://dashboard.localhost:5001
   ```

### Method 2: Using a Proxy Tool

If you prefer not to edit the hosts file, you can use tools like:
- **nginx** - Set up a reverse proxy
- **Caddy** - Simple proxy server
- **localhost.run** - Tunnel service

## Testing the Dashboard

### 1. **Test Without Login**

Visit: `http://dashboard.localhost:5001`

**Expected Result:**
- You'll see a login prompt
- Google login button is displayed
- Clean dashboard layout

**Console Logs:**
```
[App] Routing to dashboard: /
```

### 2. **Test With Login**

1. Click "Login with Google"
2. Complete Google OAuth
3. You'll be redirected back to the dashboard

**Expected Result:**
- Welcome message with your name
- Stats cards showing your connections
- Quick action buttons
- Connections table (if you have any)

### 3. **Test Dashboard API**

Once logged in, open browser console (F12) and run:

```javascript
// Test the dashboard data API
fetch('/api/data')
  .then(r => r.json())
  .then(data => console.log('Dashboard data:', data));
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "totalConnections": 0,
    "activeSheets": 0,
    "lastSyncDate": null,
    "recentActivity": [],
    "stats": {
      "shopify": { "connected": false, "count": 0 },
      "tiendanube": { "connected": false, "count": 0 },
      ...
    }
  }
}
```

### 4. **Test Subdomain Routing**

Test that main domain and dashboard are separate:

```bash
# Main site (should show main homepage)
curl http://localhost:5001

# Dashboard site (should show dashboard)
curl http://dashboard.localhost:5001
```

### 5. **Test Analytics & Settings**

Visit these URLs (requires login):
- `http://dashboard.localhost:5001/analytics`
- `http://dashboard.localhost:5001/settings`

**Expected Result:**
- Placeholder pages with "Coming Soon" message
- Back to Dashboard button works

### 6. **Test Health Check**

```bash
curl http://dashboard.localhost:5001/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "service": "dashboard",
  "timestamp": "2025-11-15T..."
}
```

## Production Deployment

### DNS Configuration

You need to set up a DNS A record or CNAME record for the subdomain:

**Option A: A Record (Recommended)**
```
Type: A
Name: dashboard
Value: [Your server IP]
TTL: 3600
```

**Option B: CNAME Record**
```
Type: CNAME
Name: dashboard
Value: www.sheetscentral.com
TTL: 3600
```

### SSL Certificate

Make sure your SSL certificate covers the subdomain:

**Using Let's Encrypt:**
```bash
sudo certbot certonly --nginx -d dashboard.sheetscentral.com
```

**Or include in your main certificate:**
```bash
sudo certbot certonly --nginx -d sheetscentral.com -d www.sheetscentral.com -d dashboard.sheetscentral.com
```

### Nginx Configuration

If you're using nginx, add this to your configuration:

```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name dashboard.sheetscentral.com;

    ssl_certificate /etc/letsencrypt/live/dashboard.sheetscentral.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dashboard.sheetscentral.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Verify Production

1. **Test DNS:**
   ```bash
   nslookup dashboard.sheetscentral.com
   ```

2. **Test HTTPS:**
   ```bash
   curl https://dashboard.sheetscentral.com/health
   ```

3. **Test in Browser:**
   - Visit: `https://dashboard.sheetscentral.com`
   - Should load the dashboard

## Adding Custom Features

### 1. Customize Dashboard Data

Edit [src/controllers/dashboard-controller.js](src/controllers/dashboard-controller.js#L35-75):

```javascript
getUserDashboardData: async (userId) => {
  // Add your custom logic here
  const userData = {
    totalConnections: 0,
    activeSheets: 0,
    // ... add more fields
  };

  // Example: Fetch from your database
  const connections = await mainService.getUserConnections(userId);
  userData.totalConnections = connections.length;

  return userData;
}
```

### 2. Add New Dashboard Routes

Edit [src/routes/dashboard-routes.js](src/routes/dashboard-routes.js):

```javascript
// Add a new page
router.get('/reports', generalMid, checkAuth.checkAuth, (req, res) => {
  res.render("dashboard/reports", {
    title: "Reports | Dashboard",
    google_user: res.locals.google_user,
    navbar_data: res.locals.navbar_data,
    lang_object: res.locals.lang_object
  });
});
```

### 3. Add Real-time Updates

Add to [src/views/dashboard/home.ejs](src/views/dashboard/home.ejs):

```javascript
<script>
// Fetch fresh data every 30 seconds
setInterval(async () => {
  const response = await fetch('/api/data');
  const data = await response.json();
  console.log('Updated data:', data);
  // Update your UI here
}, 30000);
</script>
```

### 4. Add Charts and Visualizations

Install a charting library:

```bash
npm install chart.js
```

Add to your view:

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<canvas id="myChart"></canvas>
<script>
const ctx = document.getElementById('myChart');
new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Sales',
      data: [12, 19, 3, 5, 2, 3]
    }]
  }
});
</script>
```

## Troubleshooting

### Issue 1: "Cannot access dashboard.localhost"

**Solution:**
- Verify `/etc/hosts` file has the entry
- Flush DNS cache
- Restart your browser
- Try incognito mode

### Issue 2: Dashboard shows main site

**Solution:**
- Check server logs for `[App] Routing to dashboard:`
- Verify hostname is correct: `console.log(req.hostname)`
- Clear browser cache

### Issue 3: "404 Not Found" on dashboard routes

**Solution:**
- Check that `dashboardRouter` is imported in `app.js`
- Verify routes in `dashboard-routes.js`
- Check server logs for errors

### Issue 4: Static files (CSS/JS) not loading

**Solution:**
- Static files are served from the same Express app
- Make sure paths are correct: `/css/styles.css` not `../css/styles.css`
- Check browser console for 404 errors

### Issue 5: Login not working on subdomain

**Solution:**
- Google OAuth needs to allow the subdomain
- Add `dashboard.sheetscentral.com` to authorized origins in Google Console
- Update redirect URIs if needed

## Quick Testing Checklist

- [ ] `/etc/hosts` configured correctly
- [ ] Server starts without errors
- [ ] `http://dashboard.localhost:5001` loads
- [ ] Dashboard shows login prompt (not logged in)
- [ ] Can log in with Google
- [ ] Dashboard shows user data after login
- [ ] Stats cards display correctly
- [ ] Quick action buttons work
- [ ] `/health` endpoint returns JSON
- [ ] `/api/data` requires authentication
- [ ] Main site (`localhost:5001`) still works normally

## Next Steps

1. **Customize the dashboard** with your specific metrics
2. **Add more pages** (reports, integrations, etc.)
3. **Implement real-time updates** using WebSockets or polling
4. **Add charts and graphs** for data visualization
5. **Create dashboard-specific APIs** for your features
6. **Set up monitoring** for the dashboard subdomain
7. **Configure production DNS** and SSL

## File Structure

```
tnsheets/
├── src/
│   ├── controllers/
│   │   └── dashboard-controller.js       # Dashboard logic
│   ├── routes/
│   │   └── dashboard-routes.js           # Dashboard routes
│   └── views/
│       └── dashboard/                     # Dashboard templates
│           ├── home.ejs                   # Main dashboard
│           ├── analytics.ejs              # Analytics page
│           └── settings.ejs               # Settings page
├── app.js                                 # Express app with subdomain routing
└── DASHBOARD_SETUP_GUIDE.md              # This file
```

## Support

If you encounter issues:
1. Check server logs: `npm start`
2. Check browser console (F12)
3. Verify hostname: `console.log(window.location.hostname)`
4. Test health endpoint: `curl http://dashboard.localhost:5001/health`

---

**Dashboard setup complete! 🎉**

You can now access your dashboard at:
- **Local:** `http://dashboard.localhost:5001`
- **Production:** `https://dashboard.sheetscentral.com` (after DNS setup)
