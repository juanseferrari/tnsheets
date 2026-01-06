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
const mainService = require("../../services/main-service");


const woController = {
  cloneSheet: async (req, res) => {
    let connection_id = req.query.connection_id    
    if (connection_id) {
      let user_connected = await mainService.searchUser(connection_id)

      if (user_connected) {
        var fields_to_db = {
          "clicked_cloned": "clicked",
          "clicked_cloned_date": new Date().toISOString(),
          connection_id,
          "connection": "woocommerce",
          "user_id": user_connected.user_id
        }
        try {
          let result = await mainService.createAirtableUpsert(true, ["user_id", "connection"], fields_to_db, "prod_users")
        } catch (error) {
        }
      }
    }
    //v1.3
    res.redirect("https://docs.google.com/spreadsheets/d/1tg1Ddd7ALviG_EeY_0ZIDyAJaxgntzlBbAFPahcryZ4/copy")
  },
  woHome: async (req,res) => {
    let google_user = res.locals.google_user
    let wo_connection_id = res.locals.wo_connection_id
    let navbar_data = res.locals.navbar_data
    let lang_object = res.locals.lang_object

    let user_connected = await mainService.searchUser(wo_connection_id)

    //Agregar el google_user

      //Path for documentation link
      var pathSegments = req.url.split('/');
      var firstPath = pathSegments[1];  
      console.log("firstPath: "+ firstPath)    
  

    res.render( "menus/woocommerce", { title: "Woocommerce", wo_connection_id, user_connected,google_user,navbar_data, firstPath, lang_object });
  },
  configuration: async (req,res) => {

    let google_user = res.locals.google_user
    let wo_connection_id = res.locals.wo_connection_id
    let navbar_data = res.locals.navbar_data
    let lang_object = res.locals.lang_object

    let user_connected = await mainService.searchUser(wo_connection_id)

      //Path for documentation link
      var pathSegments = req.url.split('/');
      var firstPath = pathSegments[1];  
      console.log("firstPath: "+ firstPath)    
  

    res.render("instructions/wo-instructions", { title: "Instrucciones", wo_connection_id, user_connected,google_user,navbar_data, firstPath, lang_object})
  },
  documentation: (req,res) => {
    res.redirect("https://sheetscentral.notion.site/Woocommerce-6eafd7faecc44b9c94e0732d48e18a63")
  },
  woOauth: async (req,res) => {
    //PENDING
    let navbar_data = res.locals.navbar_data

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
          "plan": "free",
          "uninstalled_date": null,
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
            res.render("menus/error-page", { message, navbar_data })
          } else {
            //OK with connection. 
  
            //save connection_id cookie
            res.cookie("wo_connection_id", response['id'])
            //redirect user to instructions page
            res.redirect('/woocommerce/config')
          }
  
        } catch (error) {
          let message = "Ha ocurrido un error, intentelo más tarde. Error: 9018921 " + error
          res.render("menus/error-page", { message, navbar_data })
        }

  },
  woRedirect: async (req,res) => {
    res.redirect('/woocommerce/config')
  },  
  woPremium: async (req,res) => {
 //https://woocommercecomsaasbillingapi.docs.apiary.io/#authentication/basicAuth

  }
};

module.exports = woController;