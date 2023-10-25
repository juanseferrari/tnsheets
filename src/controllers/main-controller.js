//a futuro renombrar a tn-controller y tener un controller por app.

// Requires
const path = require("path");
const fs = require("fs");
const fetch = require('node-fetch');
const url = require('url');

//Services
const mainService = require("../services/main-service");
const { google } = require("googleapis");

const tn_client_id = "5434"
const tn_client_secret = process.env.TN_CLIENT_SECRET

//TEST ENVIRONMENTS
const test_client_id = "6107"
const test_client_secret = "d05ab78cfd8ec215ffe08d235cbf079a6c224c9b066b641e"


//AIRTABLE VALUES
const airtable_base_id = process.env.AIRTABLE_BASE_ID
const airtable_test_table_id = "tbl3tdymJSf7Rhiv0"
const airtable_prod_table_id = process.env.AIRTABLE_PROD_USERS
const airtable_access_token = process.env.AIRTABLE_ACCESS_TOKEN
const AIRTABLE_SUBSCRIPTIONS = process.env.AIRTABLE_SUBSCRIPTIONS

const airtable_GETrequestOptions = {
  method: 'GET',
  headers: {
    "Authorization": "Bearer " + airtable_access_token,
    "Content-Type": "application/json"
  },
  redirect: 'follow'
}

const mainController = {
  home: async (req, res) => {
    const projectos = await mainService.projectos()

    let connection_id = ""
    let google_user_id = ""
    if (req.cookies.connection_id) {
      connection_id = req.cookies.connection_id
    }
    if (req.cookies.google_user_id) {
      google_user_id = req.cookies.google_user_id
    }
    let user_connected = await mainService.searchUser(connection_id)
    let google_user = await mainService.searchGoogleUser(google)
    console.log("google_user")
    console.log(google_user)
    console.log("google_user")

    res.render("menus/home", { projectos, google_user_id, connection_id, user_connected, google_user });
  },
  pong: async (req, res) => {
    res.json({
      "pong": true
    });
  },
  contacto: (req, res) => {
    res.render("menus/contacto");
  },
  login: (req, res) => {
    res.render("menus/login", { title: "Login" })
  },
  pricing: (req, res) => {
    res.render("menus/pricing", { title: "Pricing" })
  },
  privacy: (req, res) => {
    res.render("menus/privacy-policy", {})
  },
  terms: (req, res) => {
    res.render("menus/terms-and-conditions", {})
  },
  errorPage: (req, res) => {
    let message = "No hemos podido validar la conexión con Tienda Nube. Por favor intente nuevamente."
    res.render("menus/error-page", { message })
  },
  webhookConnection: async (req, res) => {
    //receive webhooks url and connection id and save into DB to keep tracking
    //in the case users cancels subscription, send webhook to url and cancel connection.

    let token = req.body.token
    var connection_id = req.body.connection_id
    var webhook_url = req.body.webhook_url

    var fields_to_db = {
      "webhook_url": webhook_url,
      "webhook_connection_date": new Date().toISOString(),
      "connection_id": connection_id
    }
    if (token == "sheetapi5678") {
      let user_exists = await mainService.validateUserExists(connection_id)
      if (user_exists) {
        try {
          let response = await mainService.createAirtableUpsert(true, ["connection_id"], fields_to_db, "prod_users")
          response_object = response
        } catch (error) {
          response_object = error
        }
      } else {
        response_object = {
          "error": {
            "type": "CONNECTION_ID_NOT_FOUND",
            "message": "connection_id was not found or incorrect."
          }
        }
      }

    } else {
      response_object = {
        "error": {
          "type": "INVALID_TOKEN",
          "message": "Token provided is incorrect."
        }
      }
    }
  res.json(response_object)
  },
  appUninstalled: async (req,res) => {
    //funcion usada cuando se desinstala una conexion. Se guarda en la DB
    let au_store_id = req.body.store_id
    let au_event =  req.body.event
    let response_object
    if(au_event == "app/uninstalled"){
    var fields_to_db = {
        "active": "false",
        "uninstalled_date": new Date().toISOString(),
        "user_id": au_store_id.toString()
      }
    try {
      let response = await mainService.createAirtableUpsert(true, ["user_id"], fields_to_db, "prod_users")
      response_object = response
      console.log(response)
      } catch (error) {
        response_object = error
        console.log(response)
      }
    } else {
      response_object = {
        "error": {
          "type": "NOTIFICATION_NOT_SUPPORTED",
          "message": "This notification type is not supported."
        }
      }
    }
    res.json(response_object)
  },
  getTokenGeneric: async (req,res) => {
    // funcion usada para obtener el token desde Google App Script
    // Es una funcion generica para todas las conexiones
    var token = req.body.token
    var spreadsheet_id = req.body.spreadsheet_id
    var connection_id = req.body.connection_id
    var sheet_email = req.body.email


    //Paso 1: Validar el token generico (sheetapi5678)
    //Paso 2: Hacer un searchUser (tiene que existir si o si para configurar el sheet) con el connection_id. 
    //Paso 3: Validar que el google_email del usuario coincida con el sheet_email (cuando este la conexion entre google user y la base de datos)
    //Paso 4: Hacer upsert y agregar el spreadsheet_id, spreadsheet_connection_date y connection_id. 
    //Paso 5: Devolver en la API el connection_id, access_token y user_id. 

    //migrate to upsert data
    var data_to_airtable = {
      "fields": {
        "spreadsheet_id": spreadsheet_id,
        "spreadsheet_connection_date": new Date().toISOString(),
        "connection_id": connection_id
      }
    } //end data_to_airtable

    var airtable_update_record = {
      method: 'PATCH',
      headers: {
        "Authorization": "Bearer " + airtable_access_token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data_to_airtable),
      redirect: 'follow'
    }
    if (token === "sheetapi5678") {
      //agregar un token mas seguro o algo dinamico por usuario
      try {
        // A FUTURO: pasar esta funcion de get token a un service reusable.
        let airtabe_request = await fetch("https://api.airtable.com/v0/" + airtable_base_id + "/" + airtable_prod_table_id + "/" + connection_id, airtable_update_record)
        let airtable_response = await airtabe_request.json();
        res.json({
          "id": airtable_response.id,
          "access_token": airtable_response.fields.access_token,
          "store_id": airtable_response.fields.user_id
        })
      } catch (error) {
        res.json({
          "error": {
            "type": "CONNECTION_NOT_FOUND",
            "message": "The connection_id provided is incorrect or not found."
          }
        })
      }
    } else {
      res.json({
        "error": {
          "type": "INVALID_TOKEN",
          "message": "Token provided is incorrect."
        }
      })
    }

  }
};

module.exports = mainController;