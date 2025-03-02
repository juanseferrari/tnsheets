const { shopifyApi, LATEST_API_VERSION } = require('@shopify/shopify-api');
const { default: shopifyApiNodeAdapter } = require('@shopify/shopify-api/adapters/node');

//SHOPIFY CREDENTIALS PROD
const sh_client_id = process.env.SH_CLIENT_ID
const sh_client_secret = process.env.SH_CLIENT_SECRET
const scopes = 'read_products,write_products,read_customers,read_orders,read_inventory,write_inventory'
const host = process.env.HOST || 'http://localhost:5001';

const shMiddleware = async (req, res, next) => {

      //Shopify validation

      const queryParams = req.query;
      let embedded = queryParams.embedded ? queryParams.embedded : 0
      console.log("embedded: " + embedded)
  
      if (queryParams.hmac && embedded == 0) {
          console.log("inside hmac-embedded flow")
          const sh_hmac = queryParams.hmac
          // Construct the base URL you want to redirect to
          const baseRedirectUrl = '/shopify/verify';
          const filteredQueryParams = { ...queryParams };
          filteredQueryParams.hmac2 = queryParams.hmac
          delete filteredQueryParams.hmac;
  
          const newUrl = url.format({
              pathname: baseRedirectUrl,
              query: filteredQueryParams,
          });
          // Redirect to the new URL
          return res.redirect(newUrl);
      }
      

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
