// Requires
const path = require("path");
const fs = require("fs");
const fetch = require('node-fetch');
const url = require('url');

//MP CREDENTIALS PROD
const mp_access_token = process.env.MP_PROD_AT
const mp_client_id = process.env.MP_CLIENT_ID
const mp_client_secret = process.env.MP_CLIENT_SECRET

//MP CREDENTIALS TEST
//USER: TESTGUTFSIRT
//PASS: qatest5942

//USER: TESTUSER1060967405
//PASS: i0nRgXG0YP
const mp_test_access_token = process.env.MP_TEST_AT
const mp_test_client_id = process.env.MP_TEST_CLIENT_ID
const mp_test_client_secret = process.env.MP_TEST_CLIENT_SECRET


//SERVICES
const mainService = require("../../services/main-service");


var mp_redirect_url = "https://www.sheetscentral.com/mp-oauth"


const mpController = {
  mpHome: async (req,res) => {
    let mp_connection_id = ""
    let google_user_id = ""
    if (req.cookies.mp_connection_id) {
      mp_connection_id = req.cookies.mp_connection_id
    }
    if (req.cookies.google_user_id) {
      google_user_id = req.cookies.google_user_id
    }
    let user_connected = await mainService.searchUser(mp_connection_id)
    let google_user = await mainService.searchGoogleUser(google_user_id)

      //Path for documentation link
      var pathSegments = req.url.split('/');
      var firstPath = pathSegments[1];  
      console.log("firstPath: "+ firstPath)    
  

    res.render( "menus/mercadopago", { title: "Mercado Pago", google_user_id, mp_connection_id, user_connected, google_user, firstPath });
  },
  configuration: async (req,res) => {
    console.log("Cookies:", req.cookies)
    
    let mp_connection_id = ""
    let google_user_id = ""
    if (req.cookies.mp_connection_id) {
      mp_connection_id = req.cookies.mp_connection_id
    }
    if (req.cookies.google_user_id) {
      google_user_id = req.cookies.google_user_id
    }
    let user_connected = await mainService.searchUser(mp_connection_id)
    let google_user = await mainService.searchGoogleUser(google_user_id)

      //Path for documentation link
      var pathSegments = req.url.split('/');
      var firstPath = pathSegments[1];  
      console.log("firstPath: "+ firstPath)    

      
    res.render("instructions/mp-instructions", {title: "Instrucciones",mp_connection_id,user_connected, google_user, google_user_id, firstPath})
  },
  documentation: (req,res) => {
    res.redirect("https://sheetscentral.notion.site/Mercado-Pago-b65c0b5feb5545c795f277bfe6c5ef04")
  } 
  
};

module.exports = mpController;