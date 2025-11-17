/**
 * Dashboard Routes
 * Routes for dashboard.sheetscentral.com
 *
 * This router handles all requests coming to the dashboard subdomain.
 * It's mounted in app.js using hostname-based routing.
 */

var express = require('express');
var router = express.Router();

const dashboardController = require('../controllers/dashboard-controller');
const generalMid = require('../middlewares/general-mid');

/**
 * Simple authentication middleware for dashboard
 * Checks if user is logged in via Google
 */
const requireAuth = (req, res, next) => {
  const google_user = res.locals.google_user;

  if (!google_user || !google_user.google_user_id) {
    return res.redirect('https://www.sheetscentral.com/');
  }

  next();
};

/**
 * Dashboard Home Page
 * GET /
 * Main landing page for dashboard.sheetscentral.com
 */

router.get('/', generalMid, dashboardController.home);

/**
 * Dashboard Analytics Page
 * GET /analytics
 * Shows user analytics and stats
 */
router.get('/analytics', generalMid, requireAuth, dashboardController.analytics);

/**
 * Dashboard Settings Page
 * GET /settings
 * User settings and preferences
 */
router.get('/settings', generalMid, requireAuth, dashboardController.settings);

/**
 * Dashboard API Endpoint
 * GET /api/data
 * Returns JSON data for the dashboard
 */
router.get('/api/data', generalMid, requireAuth, dashboardController.getDashboardDataAPI);

/**
 * Health check endpoint
 * GET /health
 * Simple health check for monitoring
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'dashboard',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
