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
  } 
  
};

module.exports = woController;