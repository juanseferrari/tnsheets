// Requires
const path = require("path");
const fs = require("fs");
const fetch = require('node-fetch');
const url = require('url');
const crypto = require('crypto');


//SHOPIFY CREDENTIALS PROD
const sh_client_id = "9acb8be0a8e01c48a864ee381db4f45f"
const sh_client_secret = "f2d9372555156ca420c991d68a2335b8"
const sh_test_redirect_url = "http://localhost:5001/shopify/oauth"
const sh_prod_redirect_url = "https://www.sheetscentral.com/shopify/oauth"
const scopes = 'read_products,write_products,read_customers,read_orders'
var state = '1234'

//SERVICES
const mainService = require("../services/main-service");


const shController = {
  shHome: (req,res) => {
    res.render( "menus/shopify", { title: "Shopify" });
  },
  configuration: async (req,res) => {
   
    console.log("Cookies:", req.cookies)
    connection_id = ""
    google_user_id = ""
    if (req.cookies.connection_id) {
      connection_id = req.cookies.connection_id
    }
    if (req.cookies.google_user_id) {
      google_user_id = req.cookies.google_user_id
    }
    let user_connected = await mainService.searchUser(connection_id)
    console.log("user_connected")
    console.log(user_connected)
    console.log("user_connected")

    //res.redirect("/tiendanube/config")
    res.render("instructions/sh-instructions", { title: "Instrucciones", connection_id, user_connected, google_user_id})
  },
  verifyRequest: async (req,res) => {
    console.log("req.query")
    console.log(req.query)
    console.log("req.query")

    const originalHMAC = req.query.hmac
    let shop = req.query.shop
    const queryParameters = req.query;

    // Remove the 'hmac' parameter if it exists
    if (queryParameters.hmac) {
      delete queryParameters.hmac;
    }
    // Sort the remaining parameters alphabetically
    const sortedParameters = Object.keys(queryParameters).sort();
    // Create a new query string from the sorted parameters
    const newQueryString = sortedParameters.map(key => `${key}=${queryParameters[key]}`).join('&');
  
    console.log("newQueryString: " + newQueryString)
    const newHMAC = crypto.createHmac('sha256', sh_client_secret);
    newHMAC.update(newQueryString);
    const digest = newHMAC.digest('hex');

    console.log("digest: " + digest)

    const areEqual = crypto.timingSafeEqual(
      Buffer.from(digest, 'hex'),
      Buffer.from(originalHMAC, 'hex')
    );

    if(areEqual) {
      console.log('Digests match. Redirecting user.');
      //res.json({"ok": true})
      res.redirect(301,`https://${shop}/admin/oauth/authorize?client_id=${sh_client_id}&scope=${scopes}&redirect_uri=${sh_prod_redirect_url}&state=${state}`)
    } else {
      console.log('Digests do not match.');
      //render error page because there was an error
      let message = "Unable to access this page"
      res.render("menus/error-page", { message })
    }
  },  
  shOauth: async (req,res) => {
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
    if(response.status !== 200){
      //error trying to get client credentials. 
      console.log("NO access token")
      let message = "Unable to retrieve access token. Error: 19716"
      res.render("menus/error-page", { message })
    } else {
      //access token obtained correctly
      let data = await response.json();
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
        let sh_shop_data = await sh_request_data.json();
       

      //Save token in Airtable
      var fields_to_db = {
        //  Futuro: Agregar el state para identificar al usuario
        "nickname": "[SH] " + sh_shop_data["shop"]['name'],
        "access_token": sh_access_token,
        "user_id": sh_shop_data["shop"]['id'].toString(),
        "conection": "shopify",
        //"google_user_id": google_user_id,
        "active": "true",
        "user_name": sh_shop_data["shop"]['name'],
        "user_email": sh_shop_data["shop"]['email'],
        //"user_logo": user_logo,
        "country": sh_shop_data["shop"]['country'],
        "user_url": shop.toString(),
        "conection_date": new Date().toISOString(),
        "tag": { "id": "usrOsqwIYk4a2tZsg" }
      }
      console.log("fields_to_db")
      console.log(fields_to_db)
      console.log("fields_to_db")

      try {
        let response = await mainService.createAirtableUpsert(true, ['user_id','conection'], fields_to_db, "prod_users")
        if (response['error']) {
          //console.log(airtable_response['error'])
          let message = "Ha ocurrido un error, intentelo más tarde. Error: 90189282997"
          res.render("menus/error-page", { message })
        } else {
          //OK with connection. 

          //save connection_id cookie
          res.cookie("connection_id", response['id'])
          //redirect user to instructions page
          res.redirect('/shopify/config')
      
        }

      } catch (error) {
        let message = "Ha ocurrido un error, intentelo más tarde. Error: 90189282997 " + error
        res.render("menus/error-page", { message })
      }

    }

  }  
  
};

module.exports = shController;