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
  shHome: async (req, res) => {
    let google_user = res.locals.google_user
    let navbar_data = res.locals.navbar_data
    let lang_object = res.locals.lang_object

    let sh_connection_id = res.locals.sh_connection_id

    let user_connected = await mainService.searchUser(sh_connection_id)


    //Path for documentation link
    var pathSegments = req.url.split('/');
    var firstPath = pathSegments[1];
    console.log("firstPath: " + firstPath)


    res.render("menus/shopify", { title: "Shopify", sh_connection_id, user_connected, google_user, navbar_data, firstPath,lang_object});
  },
  configuration: async (req, res) => {
    let google_user = res.locals.google_user
    let navbar_data = res.locals.navbar_data
    let lang_object = res.locals.lang_object

    let sh_connection_id = res.locals.sh_connection_id

    let user_connected = await mainService.searchUser(sh_connection_id)

    //Path for documentation link
    var pathSegments = req.url.split('/');
    var firstPath = pathSegments[1];
    console.log("firstPath: " + firstPath)

    //res.redirect("/tiendanube/config")
    res.render("instructions/sh-instructions", { title: "Instrucciones", sh_connection_id, user_connected, google_user,navbar_data, firstPath,lang_object })
  },
  configuration2: async (req, res) => {
    let google_user = res.locals.google_user
    let navbar_data = res.locals.navbar_data
    let lang_object = res.locals.lang_object

    let sh_connection_id = req.params.connId

    let user_connected = await mainService.searchUser(sh_connection_id)

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
  cloneSheet: async (req,res) => {
    res.redirect("https://docs.google.com/spreadsheets/d/1Kt57VfUWG4kLYCN8M22t-8SIQ8ksikkwTngq9nSojB4/copy")
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
    console.log(example_url)

    //Shopify variables
    const queryParameters = req.query;
    const originalHMAC = req.query.hmac2
    let shop = req.query.shop


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
      res.redirect(301, `https://${shop}/admin/oauth/authorize?client_id=${sh_client_id}&scope=${scopes}&redirect_uri=${sh_prod_redirect_url}&state=${google_user_id}`)
    } else {
      console.log('Digests do not match.');
      //render error page because there was an error
      let message = "Unable to access Sheets Central at this moment. Check your Shopify url or try again with a new url."
      res.render("menus/error-page", { message, navbar_data, lang_object })
    }
  },
  shOauth: async (req, res) => {
    let lang_object = res.locals.lang_object

    let navbar_data = res.locals.navbar_data


    function isSuccessfulStatus(status) {
      return status >= 200 && status < 300;
    }

    console.log(req.query)
    let shop = req.query.shop
    //WIP check that the state is the same as the one sent in the previous step

    //WIP validate hmac.


    //POST request to get Access token
    var requestOptions = {
      method: 'POST',
      redirect: 'follow'
    };

    let response = await fetch(`https://${shop}/admin/oauth/access_token?client_id=${sh_client_id}&client_secret=${sh_client_secret}&code=${req.query.code}`, requestOptions)
    if (response.status !== 200) {
      //error trying to get client credentials. 
      console.log("NO access token")
      let message = "Unable to retrieve access token. Error: 19716"
      res.render("menus/error-page", { message, navbar_data, lang_object })
    } else {
      //access token obtained correctly
      let data = await response.json();
      console.log("shopify data")
      console.log(data)
      console.log("shopify data")

      let sh_access_token = data['access_token']


      //GET SHOP DATA
      var GETrequestOptions = {
        method: 'GET',
        headers: {
          "X-Shopify-Access-Token": sh_access_token
        },
        redirect: 'follow'
      };

      let sh_request_data = await fetch(`https://${shop}/admin/api/2023-07/shop.json`, GETrequestOptions)
        .then(async response => {
          if (isSuccessfulStatus(response.status)) {
            // The status is a successful 2XX response
            console.log("RESPONSE OK")
            return response.json();
          } else {
            // Handle other statuses
            console.log('Request failed with status:', response.status);
            let sh_data = await response.json()
            console.log("error response")
            console.log(sh_data)
            console.log(sh_data.errors)
            console.log("error response")

            //aca hacer una pagina con error
            throw new Error('Request failed with status: ' + response.status + ' Response: ' + sh_data.errors);
          }
        })
        .then(async data => {
          // Handle the successful response data here
          console.log('Response data:', data);
          //Save token in Airtable
          var fields_to_db = {
            //  Futuro: Agregar el state para identificar al usuario
            "nickname": "[SH] " + data["shop"]['name'],
            "access_token": sh_access_token,
            "user_id": data["shop"]['id'].toString(),
            "connection": "shopify",
            //"google_user_id": google_user_id,
            "active": "true",
            "uninstalled_date": null,
            "user_name": data["shop"]['name'],
            "user_email": data["shop"]['email'],
            //"user_logo": user_logo,
            "country": data["shop"]['country'],
            "user_url": shop.toString(),
            "connection_date": new Date().toISOString(),
            "tag": { "id": "usrOsqwIYk4a2tZsg" }
          }
          console.log("fields_to_db")
          console.log(fields_to_db)
          console.log("fields_to_db")

          try {
            let response = await mainService.createAirtableUpsert(true, ['user_id', 'connection'], fields_to_db, "prod_users")
            if (response['error']) {
              //console.log(airtable_response['error'])
              let message = "Ha ocurrido un error, intentelo más tarde. Error: 90189282997"
              res.render("menus/error-page", { message, navbar_data })
            } else {
              //OK with connection. 

              //save sh_connection_id cookie
              res.cookie("sh_connection_id", response['id'])
              //redirect user to instructions page
              res.redirect('/shopify/config')

            }

          } catch (error) {
            let message = "Ha ocurrido un error, intentelo más tarde. Error: 90189282997 " + error
            res.render("menus/error-page", { message,navbar_data, lang_object})
          }



        })
        .catch(error => {
          // Handle network errors or other exceptions
          console.error('Error:', error);
          //aca hacer una pagina con error
          let message = "Ha ocurrido un error, intentelo más tarde. Error: 12997 (" + error + ")"
          res.render("menus/error-page", { message, navbar_data, lang_object })
        });


      // https://quickstart-1893efc4.myshopify.com/admin/oauth/authorize?client_id=75abca07b3318a56f4073ec4ccb16e90&scope=read_products,write_products,read_customers,read_orders,read_inventory,write_inventory&redirect_uri=http://localhost:5001/shopify/oauth





    }

  },
  stHome: async (req, res) => {
    let google_user = res.locals.google_user
    let navbar_data = res.locals.navbar_data
    let lang_object = res.locals.lang_object

    let sh_connection_id = res.locals.sh_connection_id

    let user_connected = await mainService.searchUser(sh_connection_id)


    res.render("menus/shopify-to-tiendanube", { title: "Shopify to Tiendanube", sh_connection_id, user_connected, google_user, navbar_data, firstPath,lang_object});
  },

};

module.exports = shController;