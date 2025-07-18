

// Requires
const path = require("path");
const fs = require("fs");
const fetch = require('node-fetch');
const url = require('url');
const crypto = require('crypto');


//SHOPIFY CREDENTIALS PROD
const sh_client_id = process.env.SH_CLIENT_ID
const sh_client_secret = process.env.SH_CLIENT_SECRET
const sh_test_redirect_url = "http://localhost:5001/shopify/oauth"
const sh_prod_redirect_url = "https://www.sheetscentral.com/shopify/oauth"
const scopes = 'read_products,write_products,read_customers,read_orders,read_inventory,write_inventory'
var state = '1234'

//SERVICES
const mainService = require("../../services/main-service");


const shController = {
  cloneSheet: async (req,res) => {
    let connection_id = req.query.connection_id       
    // Validate user exists first
    if (connection_id) {
      let user_connected = await mainService.searchUser(connection_id)
      console.log("user_connected: " + JSON.stringify(user_connected))
      if (user_connected) {
        var fields_to_db = {
          "clicked_cloned": "clicked",
          "clicked_cloned_date": new Date().toISOString(),
          connection_id,
          "connection": "shopify",
          "user_id": user_connected.user_id
        }
        console.log("fields_to_db: " + JSON.stringify(fields_to_db))
        try {
          let result = await mainService.createAirtableUpsert(true, ["user_id", "connection"], fields_to_db, "prod_users")
          console.log("result: " + JSON.stringify(result))
        } catch (error) {
        }
      }
    }
    //v1.1
    res.redirect("https://docs.google.com/spreadsheets/d/1Kt57VfUWG4kLYCN8M22t-8SIQ8ksikkwTngq9nSojB4/copy")
  },
  shHome: async (req, res) => {
    let google_user = res.locals.google_user
    let navbar_data = res.locals.navbar_data
    let lang_object = res.locals.lang_object

    let sh_connection_id = res.locals.sh_connection_id
    let user_connected
    if(req.query.shop){
      user_connected = await mainService.getAirtableData("prod_users",req.query.shop,"user_url" )
    } else {
      user_connected = await mainService.searchUser(sh_connection_id)
    }
    

    //Path for documentation link
    var pathSegments = req.url.split('/');
    console.log(pathSegments)
    var firstPath = pathSegments[1];
    console.log("firstPath: " + firstPath)


    res.render("menus/shopify", { title: "Shopify", sh_connection_id, user_connected, google_user, navbar_data, firstPath,lang_object});
  },
  configuration: async (req, res) => {
    let google_user = res.locals.google_user
    let navbar_data = res.locals.navbar_data
    let lang_object = res.locals.lang_object

    let sh_connection_id = res.locals.sh_connection_id

    let user_connected
    console.log("req.query.shop")
    console.log(req.query.shop)
    console.log("req.query.shop")
    if(req.query.shop){
      user_connected = await mainService.getAirtableData("prod_users",req.query.shop,"user_url" )
    } else {
      user_connected = await mainService.searchUser(sh_connection_id)
    }
    //Path for documentation link
    var pathSegments = req.url.split('/');
    var firstPath = pathSegments[1];
    console.log("firstPath: " + firstPath)

    console.log("user_connected")
    console.log(user_connected)
    console.log("user_connected")
    
    //res.redirect("/tiendanube/config")
    res.render("instructions/sh-instructions", { title: "Instrucciones", sh_connection_id, user_connected, google_user,navbar_data, firstPath,lang_object })
  },
  configuration2: async (req, res) => {
    let google_user = res.locals.google_user
    let navbar_data = res.locals.navbar_data
    let lang_object = res.locals.lang_object

    let sh_connection_id = req.params.connId

    let user_connected


    if(req.query.shop){
      user_connected = await mainService.getAirtableData("prod_users",req.query.shop,"user_url" )
    } else {
      user_connected = await mainService.searchUser(sh_connection_id)
    }
    console.log("user_connected")
    console.log(user_connected)
    console.log("user_connected")

    //Path for documentation link
    var pathSegments = req.url.split('/');
    var firstPath = pathSegments[1];
    console.log("firstPath: " + firstPath)

    //res.redirect("/tiendanube/config")
    res.render("instructions/sh-instructions", { title: "Instrucciones", sh_connection_id, user_connected, google_user,navbar_data, firstPath,lang_object })
  },
  documentation: (req, res) => {
    res.redirect("https://sheetscentral.notion.site/Sheets-Central-Shopify-09d66dbea06746a7937c4f409585d6fc")
  },

  storeRedact: async (req,res) => {

    const data = req.body;
    const shopify_hmac = req.headers['x-shopify-hmac-sha256']

    if(!shopify_hmac){
      res.status(401).send('Shopify header not found');
      return;
    }
    const verified = mainService.verifyWebhook(JSON.stringify(data), shopify_hmac);
    
    console.log("verified")
    console.log(verified)
    console.log("verified")

    if (!verified) {
        res.status(401).send('Unauthorized');
        return;
    }

    // Process webhook payload
    // ...


    const responseObject = {
      headers: req.headers,
      status: res.statusCode,
      body: req.body,
      method: req.method
  };
    console.log("responseObject")
    console.log(responseObject)
    console.log("responseObject")

    res.status(200).send('Webhook verified successfully');
  },
  verifyRequest: async (req, res) => {

    let navbar_data = res.locals.navbar_data
    let lang_object = res.locals.lang_object

    function safeCompare(a, b) {
      //checks that the lenghts are the same, if not returns false
      const aBuffer = Buffer.from(a, 'hex');
      const bBuffer = Buffer.from(b, 'hex');
      if (aBuffer.length !== bBuffer.length) {
          return false;
      }
        return crypto.timingSafeEqual(aBuffer, bBuffer);
    }    

    //example url: 
    var example_url = `https://quickstart-1893efc4.myshopify.com/admin/oauth/authorize?client_id=${sh_client_id}&scope=${scopes}&redirect_uri=${sh_test_redirect_url}`

    //Shopify variables
    const queryParameters = req.query;
    const originalHMAC = req.query.hmac2
    let shop = req.query.shop
    
    if (queryParameters.embedded === "1") {
      //renderizar /shopify/config
      console.log("redirecting to config")
      res.redirect(`/shopify/config?store_url=${shop}&embedded=1`)
    }

    // Remove the 'hmac' parameter if it exists
    if (queryParameters.hmac2) {
      delete queryParameters.hmac2;
    }
    // Sort the remaining parameters alphabetically
    const sortedParameters = Object.keys(queryParameters).sort();

    // Create a new query string from the sorted parameters
    const newQueryString = sortedParameters.map(key => `${key}=${queryParameters[key]}`).join('&');
    const newHMAC = crypto.createHmac('sha256', sh_client_secret);
    newHMAC.update(newQueryString);
    const digest = newHMAC.digest('hex');

    console.log("digest: " + digest)

    const areEqual = safeCompare(digest,originalHMAC)
    
    if (areEqual) {
      console.log('Digests match. Redirecting user to Shopify...');
      let google_user_id = ""
      if (req.cookies.google_user_id) {
        google_user_id = req.cookies.google_user_id
      }

      //res.json({"ok": true})
      res.redirect(301, `https://${shop}/admin/oauth/authorize?client_id=${sh_client_id}&scope=${scopes}&redirect_uri=${sh_prod_redirect_url}&state=1234`)
    } else {
      console.log('Digests do not match.');
      //render error page because there was an error
      let message = "Unable to access Sheets Central at this moment. Check your Shopify url or try again with a new url."
      res.render("menus/error-page", { message, navbar_data, lang_object })
    }
  },
  shOauth: async (req, res) => {
    console.log("--- Shopify OAuth Handler Start ---");
  
    let lang_object = res.locals.lang_object;
    let navbar_data = res.locals.navbar_data;
  
    function isSuccessfulStatus(status) {
      return status >= 200 && status < 300;
    }
  
    console.log("Request query:", req.query);
    let shop = req.query.shop;
  
    // POST request to get Access token
    try {
      console.log("Fetching access token from Shopify...");
      let response = await fetch(
        `https://${shop}/admin/oauth/access_token?client_id=${sh_client_id}&client_secret=${sh_client_secret}&code=${req.query.code}`,
        { method: 'POST', redirect: 'follow' }
      );
  
      console.log("Access token fetch response status:", response.status);
  
      if (response.status !== 200) {
        console.log("NO access token");
        let message = "Unable to retrieve access token. Error: 19716";
        return res.render("menus/error-page", { message, navbar_data, lang_object });
      }
  
      let data = await response.json();
      console.log("Shopify access token data:", data);
      let sh_access_token = data['access_token'];
  
      // GET SHOP DATA //TODO MIGRAR A SERVICE
      let sh_request_data;
      try {
        console.log("Fetching shop data from Shopify...");
        let shopResponse = await fetch(
          `https://${shop}/admin/api/2023-07/shop.json`,
          {
            method: 'GET',
            headers: { "X-Shopify-Access-Token": sh_access_token },
            redirect: 'follow'
          }
        );
  
        console.log("Shop data fetch response status:", shopResponse.status);
  
        if (!isSuccessfulStatus(shopResponse.status)) {
          let sh_data = await shopResponse.json();
          console.log("Request failed with status:", shopResponse.status);
          throw new Error(`Request failed with status: ${shopResponse.status} Response: ${JSON.stringify(sh_data.errors)}`);
        }
  
        sh_request_data = await shopResponse.json();
        console.log("Shopify shop data:", sh_request_data);
  
      } catch (error) {
        console.error('Error fetching shop data:', error);
        let message = `Ha ocurrido un error, intentelo más tarde. Error: 12997 (${error})`;
        return res.render("menus/error-page", { message, navbar_data, lang_object });
      }
      const google_user_id = req.query.state ? req.query.state.toString() : null
      // Prepare fields for Airtable
      let fields_to_db = {
        "nickname": "[SH] " + sh_request_data["shop"]['name'],
        "access_token": sh_access_token,
        "user_id": sh_request_data["shop"]['id'].toString(),
        "connection": "shopify",
        "google_user_id": google_user_id,
        "active": "true",
        "plan": "free",
        "uninstalled_date": null,
        "user_name": sh_request_data["shop"]['name'],
        "user_email": sh_request_data["shop"]['email'],
        "whatsapp": sh_request_data["shop"]['phone'],
        "user_logo": null,
        "country": sh_request_data["shop"]['country'],
        "main_language": sh_request_data["shop"]['primary_locale'], 
        "user_url": shop.toString(),
        "connection_date": new Date().toISOString(),
        "tag": { "id": "usrOsqwIYk4a2tZsg" }
      };
      console.log("Fields to save in Airtable:", fields_to_db);
  
      // Save to Airtable
      try {
        console.log("Saving data to Airtable...");
        let airtableResponse = await mainService.createAirtableUpsert(true, ['user_id', 'connection'], fields_to_db, "prod_users");
        console.log("Airtable response:", airtableResponse);
  
        if (airtableResponse['error']) {
          let message = "Ha ocurrido un error, intentelo más tarde. Error: 90189282997";
          return res.render("menus/error-page", { message, navbar_data, lang_object });
        }
  
        // Success: render Shopify page
        let sh_connection_id = airtableResponse['id'];
        let user_connected = await mainService.searchUser(sh_connection_id);
        let google_user = "1234";
        let pathSegments = req.url.split('/');
        let firstPath = pathSegments[1];
  
        console.log("Rendering Shopify page...");
        return res.render("menus/shopify", {
          title: "Shopify",
          sh_connection_id,
          user_connected,
          google_user,
          navbar_data,
          firstPath,
          lang_object
        });
  
      } catch (error) {
        console.error("Error saving to Airtable:", error);
        let message = "Ha ocurrido un error, intentelo más tarde. Error: 90189282997 " + error;
        return res.render("menus/error-page", { message, navbar_data, lang_object });
      }
  
    } catch (error) {
      console.error('Unexpected error:', error);
      let message = `Ha ocurrido un error inesperado. Error: ${error}`;
      return res.render("menus/error-page", { message, navbar_data, lang_object });
    }
  },
  
  
  stHome: async (req, res) => {
    let google_user = res.locals.google_user
    let navbar_data = res.locals.navbar_data
    let lang_object = res.locals.lang_object

    let sh_connection_id = res.locals.sh_connection_id

    let user_connected = await mainService.searchUser(sh_connection_id)
    
    //Path for documentation link
    var pathSegments = req.url.split('/');
    var firstPath = pathSegments[1];
    console.log("firstPath: " + firstPath)

    res.render("menus/shopify-to-tiendanube", { title: "Shopify to Tiendanube", sh_connection_id, user_connected, google_user, navbar_data, firstPath,lang_object});
  },
  session: async (req,res) => {
    // Middleware to validate session tokens
    const verifyRequest = mainService.shopify();
    console.log("verifyRequest")
    console.log(verifyRequest)
    console.log("verifyRequest")

    res.status(200).send('Session is valid!');
  }

};

module.exports = shController;