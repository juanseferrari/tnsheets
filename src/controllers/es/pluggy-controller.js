//a futuro renombrar a tn-controller y tener un controller por app.

// Requires
const path = require("path");
const fs = require("fs");
const fetch = require('node-fetch');
const url = require('url');

//Services
const mainService = require("../../services/main-service");
const paymentService = require("../../services/payment-service");

//Sheets Central tokens. 
const tn_client_id = "5434"
const tn_client_secret = process.env.TN_CLIENT_SECRET



const plController = {
  cloneSheet: async (req, res) => {
    let connection_id = req.query.connection_id    
    // Validate user exists first
    if (connection_id) {
      let user_connected = await mainService.searchUser(connection_id)
      if (user_connected) {
        var fields_to_db = {
          "clicked_cloned": "clicked",
          "clicked_cloned_date": new Date().toISOString(),
          connection_id,
        }
        try {
          let result = await mainService.createAirtableUpsert(true, ["connection_id"], fields_to_db, "prod_users")
        } catch (error) {
        }
      }
    }
    //v2.4
    res.redirect("https://docs.google.com/spreadsheets/d/1fAjXyysxHFVx_2zv70kY3FM9emwi0m1kYHve_XT2JMg/copy")
  },
  plHome: async (req, res) => {
    let google_user = res.locals.google_user
    let connection_id = res.locals.connection_id
    let navbar_data = res.locals.navbar_data
    let lang_object = res.locals.lang_object

    let user_connected = await mainService.searchUser(connection_id)
    let apiKey = await mainService.getPluggyApiKey()
    
    //Path for documentation link
    var pathSegments = req.url.split('/');
    var firstPath = pathSegments[1];

    res.render("menus/pluggy", { connection_id, user_connected, google_user, navbar_data, firstPath, lang_object, apiKey });
  },
  plConnect: async (req, res) => {
    let google_user = res.locals.google_user
    let connection_id = res.locals.connection_id
    let navbar_data = res.locals.navbar_data
    let lang_object = res.locals.lang_object

    let user_connected = await mainService.searchUser(connection_id)

    //Path for documentation link
    var pathSegments = req.url.split('/');
    var firstPath = pathSegments[1];

    res.render("menus/pluggy-connect", { connection_id, user_connected, google_user, navbar_data, firstPath, lang_object });
  },
  plSaveDB: async (req, res) => {
    let response_object
    const data = req.body;
    const google_user_id = req.query.state ? req.query.state.toString() : null
    //let user_connected = await mainService.searchUser(connection_id)
    var data_to_airtable_db = {
      "nickname": "[PL] " + data["item"]["connector"]["name"],
      "access_token": data["item"]["id"],
      "user_id": null,
      "connection": "pluggy",
      "google_user_id": google_user_id,
      "active": "true",
      "plan": "free",
      "uninstalled_date": null,
      "user_email": data["item"]["clientUserId"],
      "country": data["item"]["connector"]["country"],
      "connection_date": new Date().toISOString(),
      "tag": { "id": "usrOsqwIYk4a2tZsg" }
    } //end data_to_airtable_db
    try {
      let airtable_response = await mainService.createAirtableUpsert(true, ["user_id", "connection"], data_to_airtable_db, "prod_users")
      
      let id_conexion = airtable_response['id']
      if(id_conexion){
        response_object = airtable_response
      }
    } catch (error) {
      response_object = {
        "error": {
          "type": "GENERIC_ERROR",
          "message": error
        }
      }
    }
    console.log(response_object)
    res.json(response_object)
  },
  
  configuration: async (req, res) => {

    let google_user = res.locals.google_user
    let connection_id = res.locals.pl_connection_id
    let navbar_data = res.locals.navbar_data
    let lang_object = res.locals.lang_object

    let user_connected = await mainService.searchUser(connection_id)

    //Path for documentation link
    var pathSegments = req.url.split('/');
    var firstPath = pathSegments[1];
    console.log("firstPath: " + firstPath)

    res.render("instructions/pl-instructions", { connection_id, user_connected, google_user, navbar_data, firstPath, lang_object })
  },
  documentation: (req, res) => {
    res.redirect("https://sheetscentral.notion.site/Sheets-Central-Tiendanube-01ee5d985cff4c759afa414a2cdf1c8d")
  }

};

module.exports = plController;