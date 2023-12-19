// Requires
const path = require("path");
const fs = require("fs");
const fetch = require('node-fetch');
const url = require('url');
const crypto = require('crypto');


//SHOPIFY CREDENTIALS PROD
const sh_client_id = "75abca07b3318a56f4073ec4ccb16e90"
const sh_client_secret = "85cf4f19f554f3971b2f6ac3b7c3123d"
const sh_test_redirect_url = "http://localhost:5001/shopify/oauth"
const sh_prod_redirect_url = "https://www.sheetscentral.com/shopify/oauth"
const scopes = 'read_products,write_products,read_customers,read_orders,read_inventory,write_inventory'
var state = '1234'

//SERVICES
//const mainService = require("../services/main-service");
const mainService = require("../../services/main-service");


const shController = {
  shHome: async (req, res) => {
    let sh_connection_id = ""
    if (req.cookies.sh_connection_id) {
      sh_connection_id = req.cookies.sh_connection_id
    }

    let google_user_id = ""
    if (req.cookies.google_user_id) {
      google_user_id = req.cookies.google_user_id
    }
    let user_connected = await mainService.searchUser(sh_connection_id)
    let google_user = await mainService.searchGoogleUser(google_user_id)

    //Agregar el google_user

    //Path for documentation link
    var pathSegments = req.url.split('/');
    var firstPath = pathSegments[1];
    console.log("firstPath: " + firstPath)


    res.render("menus/en/shopify", { title: "Shopify", google_user_id, sh_connection_id, user_connected, google_user, firstPath });
  },
  configuration: async (req, res) => {

    let sh_connection_id = ""
    if (req.cookies.sh_connection_id) {
      sh_connection_id = req.cookies.sh_connection_id
    }

    let google_user_id = ""
    if (req.cookies.google_user_id) {
      google_user_id = req.cookies.google_user_id
    }
    let user_connected = await mainService.searchUser(sh_connection_id)
    let google_user = await mainService.searchGoogleUser(google_user_id)

    //Path for documentation link
    var pathSegments = req.url.split('/');
    var firstPath = pathSegments[1];
    console.log("firstPath: " + firstPath)


    //res.redirect("/tiendanube/config")
    res.render("instructions/en/sh-instructions", { title: "Instructions", sh_connection_id, user_connected, google_user, google_user_id, firstPath })
  },
  documentation: (req, res) => {
    res.redirect("https://sheetscentral.notion.site/Shopify-b36aaefaf3f040b6ac8fccb9d8912a0e")
  }

};

module.exports = shController;