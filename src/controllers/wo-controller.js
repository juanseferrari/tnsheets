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


const woController = {
  woHome: async (req,res) => {
    let wo_connection_id = ""
    let google_user_id = ""
    if (req.cookies.wo_connection_id) {
      wo_connection_id = req.cookies.wo_connection_id
    }
    if (req.cookies.google_user_id) {
      google_user_id = req.cookies.google_user_id
    }
    let user_connected = await mainService.searchUser(wo_connection_id)
    let google_user = await mainService.searchGoogleUser(google_user_id)

    //Agregar el google_user

      //Path for documentation link
      var pathSegments = req.url.split('/');
      var firstPath = pathSegments[1];  
      console.log("firstPath: "+ firstPath)    
  

    res.render( "menus/woocommerce", { title: "Woocommerce", google_user_id, wo_connection_id, user_connected,google_user, firstPath });
  },
  configuration: async (req,res) => {
   
    console.log("Cookies:", req.cookies)
    let wo_connection_id = ""
    let google_user_id = ""
    if (req.cookies.wo_connection_id) {
      wo_connection_id = req.cookies.wo_connection_id
    }
    if (req.cookies.google_user_id) {
      google_user_id = req.cookies.google_user_id
    }
    let user_connected = await mainService.searchUser(wo_connection_id)
    let google_user = await mainService.searchGoogleUser(google_user_id)

      //Path for documentation link
      var pathSegments = req.url.split('/');
      var firstPath = pathSegments[1];  
      console.log("firstPath: "+ firstPath)    
  

    res.render("instructions/wo-instructions", { title: "Instrucciones", wo_connection_id, user_connected,google_user, google_user_id, firstPath})
  },
  documentation: (req,res) => {
    res.redirect("https://sheetscentral.notion.site/Woocommerce-6eafd7faecc44b9c94e0732d48e18a63")
  },
  woOauth: async (req,res) => {
    //URL 
    //"https://woo-generously-furry-wombat.wpcomstaging.com/wc-auth/v1/authorize?app_name=Sheets Central&scope=read_write&user_id=1234&return_url=https://www.sheetscentral.com/woocommerce/oauth&callback_url=https://www.sheetscentral.com/woocommerce/oauth"

    //GET TOKENS
    console.log(req.body)
    var user_id = req.body.user_id
    var consumer_key = req.body.consumer_key
    var consumer_secret = req.body.consumer_secret
    var key_permissions = req.body.key_permissions

    //ENCRIPT TOKENS TO GET PUBLISHABLE ACCESS TOKEN

    //GET STORE INFO

    //wp/v2/users
    //normal url we have the data of logo. 

    //SAVE DATA INTO AIRTABLE

        //Save token in Airtable
        var fields_to_db = {
          //  Futuro: Agregar el state para identificar al usuario
          "nickname": "[WO] Testing",
          "access_token": consumer_key + ":" + consumer_secret,
          "user_id": user_id.toString(),
          "connection": "woocommerce",
          //"google_user_id": google_user_id,
          "active": "true",
          //"user_name": sh_shop_data["shop"]['name'],
          //"user_email": sh_shop_data["shop"]['email'],
          //"user_logo": user_logo,
          //"country": sh_shop_data["shop"]['country'],
          //"user_url": shop.toString(),
          "connection_date": new Date().toISOString(),
          "tag": { "id": "usrOsqwIYk4a2tZsg" }
        }
        console.log("fields_to_db")
        console.log(fields_to_db)
        console.log("fields_to_db")
  
        try {
          let response = await mainService.createAirtableUpsert(true, ['access_token','connection'], fields_to_db, "prod_users")
          if (response['error']) {
            //console.log(airtable_response['error'])
            let message = "Ha ocurrido un error, intentelo más tarde. Error: 9018921"
            res.render("menus/error-page", { message })
          } else {
            //OK with connection. 
  
            //save connection_id cookie
            res.cookie("wo_connection_id", response['id'])
            //redirect user to instructions page
            res.redirect('/woocommerce/config')
          }
  
        } catch (error) {
          let message = "Ha ocurrido un error, intentelo más tarde. Error: 9018921 " + error
          res.render("menus/error-page", { message })
        }

  },
  woRedirect: async (req,res) => {
    res.redirect('/woocommerce/config')
  }  
  
};

module.exports = woController;