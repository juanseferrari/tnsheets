# Dashboard Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Add dashboard.localhost to your hosts file

**macOS/Linux:**
```bash
sudo nano /etc/hosts
```

Add this line:
```
127.0.0.1   dashboard.localhost
```

Save (Ctrl+X, Y, Enter) and flush DNS:
```bash
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

**Windows:**
1. Run Notepad as Administrator
2. Open: `C:\Windows\System32\drivers\etc\hosts`
3. Add: `127.0.0.1   dashboard.localhost`
4. Save
5. Run: `ipconfig /flushdns`

### Step 2: Start your server

```bash
npm start
```

Look for this log:
```
Server is running on port 5001
```

### Step 3: Access the dashboard

Open your browser and go to:
```
http://dashboard.localhost:5001
```

## ✅ What You Should See

### Not Logged In:
- Clean dashboard layout
- "Welcome to Sheets Central Dashboard" message
- Google login button

### Logged In:
- Welcome message with your name
- 4 stat cards (Connections, Sheets, Last Sync, Status)
- Quick action buttons
- Your connections table (if any exist)

## 🧪 Quick Tests

### Test 1: Check Routing
```bash
# Main site
curl http://localhost:5001

# Dashboard (should be different)
curl http://dashboard.localhost:5001
```

### Test 2: Health Check
```bash
curl http://dashboard.localhost:5001/health
```

Expected response:
```json
{"status":"ok","service":"dashboard","timestamp":"..."}
```

### Test 3: Dashboard API (requires login)

1. Log in to the dashboard
2. Open browser console (F12)
3. Run:
```javascript
fetch('/api/data').then(r => r.json()).then(console.log)
```

## 📊 Available Pages

- **Home:** `http://dashboard.localhost:5001/`
- **Analytics:** `http://dashboard.localhost:5001/analytics` (requires login)
- **Settings:** `http://dashboard.localhost:5001/settings` (requires login)
- **Health:** `http://dashboard.localhost:5001/health` (public)
- **API Data:** `http://dashboard.localhost:5001/api/data` (requires login)

## 🐛 Common Issues

### "Site can't be reached"
- Check `/etc/hosts` file has the entry
- Flush DNS cache
- Restart browser

### Shows main site instead of dashboard
- Check server logs for `[App] Routing to dashboard:`
- Verify you're accessing `dashboard.localhost` not just `localhost`

### Static files (CSS/JS) not loading
- Files should load automatically from the shared `/public` folder
- Check browser console for errors

## 🎯 Next Steps

After verifying it works:

1. **Customize the dashboard** - Edit [src/controllers/dashboard-controller.js](src/controllers/dashboard-controller.js)
2. **Add your own metrics** - Modify `getUserDashboardData()`
3. **Create new pages** - Add routes and views
4. **Style it** - Edit [src/views/dashboard/home.ejs](src/views/dashboard/home.ejs)

## 📚 Full Documentation

For complete setup, production deployment, and customization guide, see:
- [DASHBOARD_SETUP_GUIDE.md](DASHBOARD_SETUP_GUIDE.md)

## 🆘 Need Help?

Check the logs:
```bash
npm start
# Server logs will show which subdomain is being accessed
```

Verify hostname in browser console:
```javascript
console.log(window.location.hostname); // Should be "dashboard.localhost"
```

---

**Happy coding! 🎉**
