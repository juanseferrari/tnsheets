//a futuro renombrar a tn-controller y tener un controller por app.

// Requires
const path = require("path");
const fs = require("fs");
const fetch = require('node-fetch');
const url = require('url');

//Services
const mainService = require("../../services/main-service");

//Sheets Central tokens. 
const tn_client_id = "5434"
const tn_client_secret = process.env.TN_CLIENT_SECRET

//TEST ENVIRONMENTS
const test_client_id = "6107"
const test_client_secret = "d05ab78cfd8ec215ffe08d235cbf079a6c224c9b066b641e"


//AIRTABLE VALUES
//idealmente aca no deberia haber ninguna variable de airtable, tiene que estar todo en el service
const airtable_base_id = process.env.AIRTABLE_BASE_ID
const airtable_test_table_id = "tbl3tdymJSf7Rhiv0"
const airtable_prod_table_id = process.env.AIRTABLE_PROD_USERS
const airtable_access_token = process.env.AIRTABLE_ACCESS_TOKEN


const tnController = {
  tnHome: async (req, res) => {
    let connection_id = ""
    let google_user_id = ""
    if (req.cookies.connection_id) {
      connection_id = req.cookies.connection_id
    }
    if (req.cookies.google_user_id) {
      google_user_id = req.cookies.google_user_id
    }
    let user_connected = await mainService.searchUser(connection_id)
    let google_user = await mainService.searchGoogleUser(google_user_id)
    //Agregar el google_user
    console.log("user_connected")
    console.log(user_connected)
    console.log("user_connected")

    //Path for documentation link
    var pathSegments = req.url.split('/');
    var firstPath = pathSegments[1];  
    console.log("firstPath: "+ firstPath)

    res.render("menus/tiendanube", { title: "Inicio", google_user_id, connection_id, user_connected,google_user,firstPath });
  },
  configuration: async (req, res) => {
    let connection_id = ""
    let google_user_id = ""
    if (req.cookies.connection_id) {
      connection_id = req.cookies.connection_id
    }
    if (req.cookies.google_user_id) {
      google_user_id = req.cookies.google_user_id
    }
    let user_connected = await mainService.searchUser(connection_id)
    let google_user = await mainService.searchGoogleUser(google_user_id)
    
    //Path for documentation link
    var pathSegments = req.url.split('/');
    var firstPath = pathSegments[1];  
    console.log("firstPath: "+ firstPath)


    res.render("instructions/tn-instructions", { title: "Instrucciones", connection_id, user_connected,google_user, google_user_id, firstPath})
  },
  documentation: (req,res) => {
    res.redirect("https://sheetscentral.notion.site/Sheets-Central-Tiendanube-b5981995bad64dc19be57d4704a76fff?pvs=4")
  },
  getPremium: (req,res) => {
    connection_id = ""
    if (req.cookies.connection_id) {
      connection_id = req.cookies.connection_id
      let redirect_url = 'https://buy.stripe.com/3cscQkbqI8rRae4cMN?client_reference_id='+connection_id
      console.log(redirect_url)
      res.redirect(redirect_url)
    } else {
      res.redirect("/tiendanube/config")
    }
  }

};

module.exports = tnController;