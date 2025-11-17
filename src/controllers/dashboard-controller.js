/**
 * Dashboard Controller
 * Handles all routes for dashboard.sheetscentral.com
 */

const path = require("path");
const mainService = require("../services/main-service");

const dashboardController = {
  /**
   * Dashboard Home Page
   * Main entry point for dashboard.sheetscentral.com
   */
  home: async (req, res) => {
    console.log("IN DASHBOARD HOME")
    try {
      const google_user = res.locals.google_user;
      const navbar_data = res.locals.navbar_data || { active: false, name: '', logo_url: '' };
      const lang_object = res.locals.lang_object || {};
      const connections = res.locals.connections || [];

      console.log("google_user")
      console.log(google_user)
      console.log("google_user")

      console.log("connections")
      console.log(connections)
      console.log("connections")

      console.log("cookies")
      console.log(req.cookies)
      console.log("cookies")
      // Get user data if logged in
      let userData = null;
      if (google_user && google_user.google_user_id) {
        // Fetch user's stats and data from database
        userData = await dashboardController.getUserDashboardData(google_user.google_user_id);
      }

      // Render the dashboard view
      res.render("dashboard/home", {
        title: "Dashboard | Sheets Central",
        google_user,
        navbar_data,
        lang_object,
        connections,
        userData
      });
    } catch (error) {
      console.error('[Dashboard] Error rendering home:', error);
      res.status(500).render("menus/error-page", {
        message: "Error loading dashboard",
        navbar_data: { active: false, name: '', logo_url: '' },
        lang_object: {},
        google_user: res.locals.google_user || "",
        google_user_id: ""
      });
    }
  },

  /**
   * Get user dashboard data
   * Fetches aggregated stats and information for the dashboard
   */
  getUserDashboardData: async (userId) => {
    try {
      // TODO: Implement your specific data fetching logic
      // This is a placeholder that you can customize based on your needs

      const userData = {
        totalConnections: 0,
        activeSheets: 0,
        lastSyncDate: null,
        recentActivity: [],
        stats: {
          shopify: { connected: false, count: 0 },
          tiendanube: { connected: false, count: 0 },
          woocommerce: { connected: false, count: 0 },
          mercadolibre: { connected: false, count: 0 },
          mercadopago: { connected: false, count: 0 }
        }
      };

      // Example: Fetch user's connections from database
      // const connections = await mainService.getUserConnections(userId);
      // userData.totalConnections = connections.length;

      return userData;
    } catch (error) {
      console.error('[Dashboard] Error fetching user data:', error);
      return null;
    }
  },

  /**
   * Dashboard Analytics Page
   */
  analytics: async (req, res) => {
    try {
      const google_user = res.locals.google_user;
      const navbar_data = res.locals.navbar_data || { active: false, name: '', logo_url: '' };
      const lang_object = res.locals.lang_object || {};

      res.render("dashboard/analytics", {
        title: "Analytics | Dashboard",
        google_user,
        navbar_data,
        lang_object
      });
    } catch (error) {
      console.error('[Dashboard] Error rendering analytics:', error);
      res.status(500).send("Error loading analytics");
    }
  },

  /**
   * Dashboard Settings Page
   */
  settings: async (req, res) => {
    try {
      const google_user = res.locals.google_user;
      const navbar_data = res.locals.navbar_data || { active: false, name: '', logo_url: '' };
      const lang_object = res.locals.lang_object || {};

      res.render("dashboard/settings", {
        title: "Settings | Dashboard",
        google_user,
        navbar_data,
        lang_object
      });
    } catch (error) {
      console.error('[Dashboard] Error rendering settings:', error);
      res.status(500).send("Error loading settings");
    }
  },

  /**
   * API endpoint to get dashboard data
   * Returns JSON data for frontend consumption
   */
  getDashboardDataAPI: async (req, res) => {
    try {
      const google_user = res.locals.google_user;

      if (!google_user || !google_user.google_user_id) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Please log in to access dashboard data'
        });
      }

      const userData = await dashboardController.getUserDashboardData(google_user.google_user_id);

      res.json({
        success: true,
        data: userData
      });
    } catch (error) {
      console.error('[Dashboard API] Error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch dashboard data'
      });
    }
  }
};

module.exports = dashboardController;
