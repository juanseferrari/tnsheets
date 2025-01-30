const { shopifyApi, LATEST_API_VERSION } = require('@shopify/shopify-api');
const { default: shopifyApiNodeAdapter } = require('@shopify/shopify-api/adapters/node');

//SHOPIFY CREDENTIALS PROD
const sh_client_id = process.env.SH_CLIENT_ID
const sh_client_secret = process.env.SH_CLIENT_SECRET
const scopes = 'read_products,write_products,read_customers,read_orders,read_inventory,write_inventory'
const host = process.env.HOST || 'http://localhost:5001';

const shMiddleware = async (req, res, next) => {
    const shopify = shopifyApi({
        apiKey: sh_client_id,
        apiSecretKey: sh_client_secret,
        scopes: scopes.split(','),
        hostName: host.replace(/https?:\/\//, ''),
        apiVersion: LATEST_API_VERSION,
        isEmbeddedApp: true, // Ensures the app is embedded
        adapter: shopifyApiNodeAdapter, // Add the Node.js adapter here
      
      });
      console.log(JSON.stringify(shopify))
    next();
    
};


module.exports = shMiddleware;
