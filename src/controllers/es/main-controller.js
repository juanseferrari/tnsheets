//a futuro renombrar a tn-controller y tener un controller por app.

// Requires
const path = require("path");
const fs = require("fs");
const fetch = require('node-fetch');
const url = require('url');
const crypto = require('crypto');

//Services
const mainService = require("../../services/main-service");


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
    let google_user = await mainService.searchGoogleUser(google_user_id)

    var pathSegments = req.url.split('/');
    var firstPath = pathSegments[1];
    console.log("firstPath: " + firstPath)


    res.render("index", { projectos, google_user_id, google_user });
  },
  pong: async (req, res) => {
    res.json({
      "pong": true
    });
  },
  contacto: async (req, res) => {
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


    res.render("menus/contacto", { google_user_id, connection_id, user_connected, google_user });
  },
  account: async (req, res) => {
    const projectos = await mainService.projectos()

    // ----- GOOGLE DATA ------ 
    let google_user_id = ""
    if (req.cookies.google_user_id) {
      google_user_id = req.cookies.google_user_id
    }
    let google_user = await mainService.searchGoogleUser(google_user_id)
    let google_connections = await mainService.getConnectionsByGoogleUser(google_user_id)

    // ----- COOKIE DATA ----- 
    let cookie_connections = []
    let amount_of_results = 0

    if(req.cookies.connection_id){
      cookie_connections.push({
        "id": req.cookies.connection_id,
        "connection": "tiendanube",
        "title": "Tiendanube"
      })
      amount_of_results++
    }
    if(req.cookies.dt_connection_id){
      cookie_connections.push({
        "id": req.cookies.dt_connection_id,
        "connection": "drive-to-tiendanube",
        "title": "Drive to Tiendanube"

      })
      amount_of_results++
    }
    if(req.cookies.mp_connection_id){
      cookie_connections.push({
        "id": req.cookies.mp_connection_id,
        "connection": "mercadopago",
        "title": "Mercado Pago"
      })
      amount_of_results++

    }
    if(req.cookies.wo_connection_id){
      cookie_connections.push({
        "id": req.cookies.wo_connection_id,
        "connection": "woocommerce",
        "title": "Woocommerce"
      })
      amount_of_results++
    }
    if(req.cookies.sh_connection_id){
      cookie_connections.push({
        "id": req.cookies.sh_connection_id,
        "connection": "shopify",
        "title": "Shopify"
      })
      amount_of_results++
    }
    //let user_connected = await mainService.searchUser(connection_id)



    let connections = {
      google_connections,
      "cookie_connections": {
        amount_of_results,
        records: cookie_connections
      }
    }

    var pathSegments = req.url.split('/');
    var firstPath = pathSegments[1];
    console.log("firstPath: " + firstPath)


    //IF google_connections.error -> Devolver que no se puede acceder o llevar a la home
    if (google_connections.error) {
      let message = "Primero debes iniciar sesión para loguearte"
      //TODO hacer el login page
      res.render("menus/error-page", { message })
    } else {
      //Para cada una de las conexiones que tenga el usuario, traer la data (ni si quiera, podria solo poner estas conectado, ir a config o conectar. )
      //Traer el array de projectos y mostrarlos en la pagina de
      res.render("menus/account", { projectos, google_user_id, google_user, connections });
    }

  },
  login: (req, res) => {
    res.render("menus/login", { title: "Login" })
  },
  documentation: (req, res) => {
    res.redirect("https://sheetscentral.notion.site/Documentaci-n-890e7b0a5d6c47f2a2b82d2061ca0ef8")
  },
  privacy: async (req, res) => {
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


    res.render("menus/privacy-policy", { google_user_id, connection_id, user_connected, google_user })
  },
  terms: async (req, res) => {
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


    res.render("menus/terms-and-conditions", { google_user_id, connection_id, user_connected, google_user })
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

  sheetConfiguration: async (req, res) => {
    // funcion usada para obtener el token desde Google App Script. Es una funcion generica para todas las conexiones
    var sheet_email = req.body.sheet_email
    var connection_id = req.body.connection_id
    var connection = req.body.connection
    var income_hash = req.body.hash
    var spreadsheet_id = req.body.spreadsheet_id
    var sheet_version = req.body.sheet_version
    var token_type = req.body.token_type


    let response_object
    //Pasos a seguir para devolver el token:
    //Paso 1: Validar que los hash coincidan
    //Paso 2: Validar con validateUserExists
    //TODO Validar que el google_email del usuario coincida con el sheet_email (cuando este la conexion entre google user y la base de datos)
    //TODO Validar que el connection coincida con lo recibido
    //Paso 4: Hacer upsert y agregar el spreadsheet_id, spreadsheet_connection_date, connection_id, sheetVerion. 
    //Paso 5: Devolver en la API el connection_id, access_token, user_id, user_url. 

    var fields_to_db = {
      spreadsheet_id,
      "spreadsheet_connection_date": new Date().toISOString(),
      connection_id,
      sheet_version,
      sheet_email
    }


    await mainService.hashValues(connection_id, connection, "sheetapi5678").then(async hash => {
      console.log('Hash:', hash);
      //validate that hash are equal and that are OK
      if (hash === income_hash) {
        //Paso 1 OK como para devolver la info
        console.log("hash equal")

        //validateUserExists
        let user_exists = await mainService.validateUserExists(connection_id)

        if (user_exists) {
          //Paso 2 OK usuario existe

          try {
            //Paso 4 Upsert para agregar la info
            let response = await mainService.editAirtableDataById(connection_id, "prod_users", fields_to_db)

            console.log("response editAirtableDataById")
            console.log(response)
            console.log("response editAirtableDataById")

            //Paso 5: Devolver toda la info necesaria del usuario
            response_object = {
              "connection_id": response.id,
              "access_token": response.fields.access_token,
              //"refresh_token": response.fields.refresh_token,
              "user_id": response.fields.user_id,
              "connection": response.fields.connection,
              "user_url": response.fields.user_url,
              "active": response.fields.active,
              "country": response.fields.country,
              "user_name": response.fields.user_name,
              "user_logo": response.fields.user_logo
            }

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
            "type": "INVALID_HASH",
            "message": "Hash provided is incorrect."
          }
        }
      }

    })
      .catch(error => {
        console.error('Error:', error);
        response_object = {
          "error": {
            "type": "GENERIC_ERROR",
            "message": "There was an error while trying to obtain the hash."
          }
        }
      });

    res.json(response_object)

  }
};

module.exports = mainController;