//Strava controller

// Requires
const path = require("path");
const fs = require("fs");
const fetch = require('node-fetch');
const url = require('url');

//Services
const mainService = require("../../services/main-service");
const paymentService = require("../../services/payment-service");

//Sheets Central tokens. 
const st_client_id = process.env.ST_CLIENT_ID
const st_client_secret = process.env.ST_CLIENT_SECRET

//STRAVA PUBLISH DOCS: https://developers.strava.com/docs/rate-limits/
//STRAVA API DOCS: https://developers.strava.com/docs/

const stController = {
  cloneSheet: async (req, res) => {
    let connection_id = req.query.connection_id    
    if (connection_id) {
      let user_connected = await mainService.searchUser(connection_id)

      if (user_connected) {
        var fields_to_db = {
          "clicked_cloned": "clicked",
          "clicked_cloned_date": new Date().toISOString(),
          connection_id,
          "connection": "tiendanube",
          "user_id": user_connected.user_id
        }
        try {
          let result = await mainService.createAirtableUpsert(true, ["user_id", "connection"], fields_to_db, "prod_users")
        } catch (error) {
        }
      }
    }
    //TBD
    res.redirect("https://docs.google.com/spreadsheets/d/1RGU3ynKibFAx8MFc5aPaLOut8tNds9AbrDIsdCFpMec/copy")
  },
  stHome: async (req, res) => {
    let google_user = res.locals.google_user
    let st_connection_id = res.locals.st_connection_id
    let navbar_data = res.locals.navbar_data
    let lang_object = res.locals.lang_object

    let user_connected = await mainService.searchUser(st_connection_id)
    console.log(navbar_data)
    //Path for documentation link
    var pathSegments = req.url.split('/');
    var firstPath = pathSegments[1];

    res.render("menus/strava", { st_connection_id, user_connected, google_user, navbar_data, firstPath, lang_object });
  },
  connect: async (req, res) => {
    let google_user_id = ''
    if(req.query.google_user_id){
      google_user_id = req.query.google_user_id
    }

    let url = "https://www.strava.com/api/v3/oauth/authorize?response_type=code&client_id=" + st_client_id + "&redirect_uri=https://www.sheetscentral.com/strava/oauth&scope=read,read_all,profile:read_all,activity:read,activity:read_all&state=" + google_user_id
    res.redirect(url)
  },
  configuration: async (req, res) => {

    let google_user = res.locals.google_user
    let connection_id = res.locals.st_connection_id
    let navbar_data = res.locals.navbar_data
    let lang_object = res.locals.lang_object

    let user_connected = await mainService.searchUser(connection_id)

    //Path for documentation link
    var pathSegments = req.url.split('/');
    var firstPath = pathSegments[1];
    console.log("firstPath: " + firstPath)

    res.render("instructions/st-instructions", { connection_id, user_connected, google_user, navbar_data, firstPath, lang_object })
  },
  documentation: (req, res) => {
    let lang = req.query.lang
    if(lang == 'pt'){
      res.redirect("https://sheetscentral.notion.site/Sheets-Central-Tiendanube-PT-1d190c0cf28a803e8069d8c7efeb6513")
    } else {
      res.redirect("https://sheetscentral.notion.site/Sheets-Central-Tiendanube-ES-1c390c0cf28a8053ba74ce3a49fe8107")
    }
  },
  stOauth: async (req, res) => {
    console.log("in: /strava/oauth")
    let navbar_data = res.locals.navbar_data
    let lang_object = res.locals.lang_object

    let code = req.query.code
    let state = req.query.state //Este es el google_id

    var urlencoded = new URLSearchParams();
    urlencoded.append("client_id", st_client_id);
    urlencoded.append("client_secret", st_client_secret);
    urlencoded.append("code", code);

    var requestOptions = {
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Sheets Central"
      },
      body: urlencoded,
      redirect: 'follow'
    };

    let response = await fetch("https://www.strava.com/api/v3/oauth/token", requestOptions)
    let data = await response.json();
    if (data['errors']) {
      //WIP despues manejar bien este error handling. 
      let message = "No hemos podido validar la conexión con Strava. Por favor intente nuevamente."
      res.render("menus/error-page", { message, navbar_data, lang_object })
    } else {
      /** FUNCIONO OK EL OAUTH */

      //AIRTABLE DATA
      if (state) {
        var google_user_id = state.toString()
      } else {
        var google_user_id = null
      }
      
      var fields_to_db = {
        //  Futuro: Agregar el state para identificar al usuario
        "nickname": "[ST] " + data['athlete']['username'],
        "access_token": data['access_token'],
        "refresh_token": data['refresh_token'],
        "user_id": data['athlete']['id'].toString(),
        "connection": "strava",
        "google_user_id": google_user_id,
        "active": "true",
        "plan": "free",
        "uninstalled_date": null,
        "user_name": data['athlete']['firstname'] + " " + data['athlete']['lastname'],
        "user_logo": data['athlete']['profile'],
        "country": data['athlete']['country'],
        "main_language": "es",
        "user_url": data['athlete']['profile'], //TBD
        "connection_date": new Date().toISOString(),
        "tag": { "id": "usrOsqwIYk4a2tZsg" }
      }
      console.log("fields_to_db")
      console.log(fields_to_db)
      console.log("fields_to_db")

      try {
        let response = await mainService.createAirtableUpsert(true, ["user_id", "connection"], fields_to_db, "prod_users")
        console.log("Airtable response on save response")
        console.log(response)
        console.log("Airtable response on save response")

        if (response['response_status'] == 200) {
          console.log("in status 200")
          let record_id = response['id']
          console.log("record_id: " + record_id)

          res.cookie("st_connection_id", record_id)
          res.cookie("sc_lang", "es")
          res.redirect("/strava/config")
        
        } else {
          let message = "Ha ocurrido un error, intentelo más tarde. Error: 333134"
          res.render("menus/error-page", { message, navbar_data, lang_object })
        }

      } catch (error) {
        console.log(error)
        let message = "Ha ocurrido un error, intentelo más tarde. Error: 90189282999"
        res.render("menus/error-page", { message, navbar_data, lang_object })
      }

    } /** Fin del else error */
  },
  appUninstalled: async (req, res) => {
    //funcion usada cuando se desinstala una conexion. Se guarda en la DB
    let au_store_id = req.body.store_id
    let au_event = req.body.event
    let response_object
    if (au_event == "app/uninstalled") {
      var fields_to_db = {
        "active": "false",
        "plan": "inactive",
        "connection": "tiendanube",
        "uninstalled_date": new Date().toISOString(),
        "user_id": au_store_id.toString()
      }
      try {
        let response = await mainService.createAirtableUpsert(true, ["user_id", "connection"], fields_to_db, "prod_users")
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
  getSheet: async (req, res) => {
    //Funcion que valida si existe connection_id y abre el sheet.
    //Si no existe connection_id redirigir al login page.
  },


};

module.exports = stController;