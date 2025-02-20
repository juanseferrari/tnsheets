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
    //let user_connected = await mainService.searchUser(connection_id)
    var data_to_airtable_db = {
      "nickname": "[PL] " + data["item"]["connector"]["name"],
      "access_token": data["item"]["id"],
      "user_id": null,
      "connection": "pluggy",
      "active": "true",
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
  configuration2: async (req, res) => {

    let google_user = res.locals.google_user
    let connection_id = req.params.connId
    let navbar_data = res.locals.navbar_data
    let lang_object = res.locals.lang_object

    let user_connected = await mainService.searchUser(connection_id)

    //Path for documentation link
    var pathSegments = req.url.split('/');
    var firstPath = pathSegments[1];
    console.log("firstPath: " + firstPath)

    res.render("instructions/tn-instructions", { connection_id, user_connected, google_user, navbar_data, firstPath, lang_object })
  },
  documentation: (req, res) => {
    res.redirect("https://sheetscentral.notion.site/Sheets-Central-Tiendanube-01ee5d985cff4c759afa414a2cdf1c8d")
  },
  getPremium: async (req, res) => {
    let navbar_data = res.locals.navbar_data
    let lang_object = res.locals.lang_object

    let connection_id = ""
    if (req.query.connection_id) {
      connection_id = req.query.connection_id
    } else if (res.locals.connection_id) {
      connection_id = res.locals.connection_id
    } else {
      res.redirect("/tiendanube/config")
    }

    let user_connected = await mainService.searchUser(connection_id)

    if (user_connected.subscription_status == "no subscription" || user_connected.subscription_status == "canceled" || user_connected.subscription_status == "pending" ) {
      //Si no tiene ni suscripcion o esta cancelado y quiere reactivar.
      let subscription = await paymentService.createSubscription(connection_id,user_connected.user_email,user_connected.country)

      if (subscription.url) {
        res.redirect(subscription.url)
      } else {
        let message = subscription.error.message
        res.render("menus/error-page", { message, navbar_data, lang_object })
      }

    } else {
      console.log("AAA")
      //aca idealmente mandarlo a management
      res.redirect("/tiendanube/config#step4")
    }

  },

  tnOauth: async (req, res) => {
    let navbar_data = res.locals.navbar_data
    let lang_object = res.locals.lang_object

    let code = req.query.code
    let state = req.query.state //Este es el google_id

    var urlencoded = new URLSearchParams();
    urlencoded.append("client_id", tn_client_id);
    urlencoded.append("client_secret", tn_client_secret);
    urlencoded.append("grant_type", "authorization_code");
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

    let response = await fetch("https://www.tiendanube.com/apps/authorize/token", requestOptions)
    let data = await response.json();
    if (data['error']) {
      //WIP despues manejar bien este error handling. 
      let message = "No hemos podido validar la conexión con Tienda Nube. Por favor intente nuevamente."
      res.render("menus/error-page", { message, navbar_data, lang_object })
    } else {
      /** FUNCIONO OK EL OAUTH */

      // GET al store para traer mas informacion relevante de la store.
      var GETrequestOptions = {
        method: 'GET',
        headers: {
          "Authentication": "bearer" + data['access_token']
        },
        redirect: 'follow'
      };
      let tn_user_request_data = await fetch("https://api.tiendanube.com/v1/" + data['user_id'] + "/store", GETrequestOptions)
      let tn_user_data = await tn_user_request_data.json();
      //console.log(tn_user_data)

      let main_language = "es"
      if (tn_user_data['main_language']) {
        main_language = tn_user_data['main_language']
      }

      //AIRTABLE DATA
      if (tn_user_data['url_with_protocol']) {
        var user_url = tn_user_data['url_with_protocol']
      } else {
        var user_url = null
      }
      if (tn_user_data['logo']) {
        var user_logo = "https:" + tn_user_data['logo']
      } else {
        var user_logo = null
      }
      if (state) {
        var google_user_id = state.toString()
      } else {
        var google_user_id = null
      }
      const whatsapp = tn_user_data['whatsapp_phone_number'] ? tn_user_data['whatsapp_phone_number'] : ''
      
      var fields_to_db = {
        //  Futuro: Agregar el state para identificar al usuario
        "nickname": "[TN] " + tn_user_data['name'][main_language],
        "access_token": data['access_token'],
        "user_id": data['user_id'].toString(),
        "connection": "tiendanube",
        "google_user_id": google_user_id,
        "active": "true",
        "plan": "free",
        "uninstalled_date": null,
        "user_name": tn_user_data['name'][main_language],
        "user_email": tn_user_data['email'],
        "whatsapp": whatsapp,
        "user_logo": user_logo,
        "country": tn_user_data['country'],
        "main_language": main_language,
        "user_url": user_url,
        "connection_date": new Date().toISOString(),
        "tag": { "id": "usrOsqwIYk4a2tZsg" }
      }

      try {
        let response = await mainService.createAirtableUpsert(true, ["user_id", "connection"], fields_to_db, "prod_users")
        if (response['response_status'] == 200) {
          let record_id = response['id']
          //send webhook notification for app/uninstalled -> Migrarlo a un service
          var POSTrequestOptions = {
            method: 'POST',
            headers: {
              "Authentication": "bearer" + data['access_token'],
              "Content-Type": "application/json",
              "User-Agent": "Sheets Central"
            },
            body: JSON.stringify({
              "event": "app/uninstalled",
              "url": "https://www.sheetscentral.com/tn/uninstalled"
            }),
            redirect: 'follow'
          };
          try {
            let tn_app_request_data = await fetch("https://api.tiendanube.com/v1/" + data['user_id'] + "/webhooks", POSTrequestOptions)
            let tn_app_data = await tn_app_request_data.json();
            console.log(tn_app_data)
            if (tn_app_data['id']) {
              //SALIO TODO OK
              //save cookie
              res.cookie("connection_id", record_id)
              res.cookie("sc_lang", main_language)

              res.redirect("/tiendanube/config")
            } else {
              //Fallo la generacion del app/uninstalled, pero hago el rendering igual
              //save cookie
              res.cookie("connection_id", record_id)

              res.redirect("/tiendanube/config")
            }
          } catch (error) {
            //arreglar esto despues
            console.log(error)
          }

        }
      } catch (error) {
        let message = "Ha ocurrido un error, intentelo más tarde. Error: 90189282999"
        res.render("menus/error-page", { message, navbar_data, lang_object })
      }

    } /** Fin del else error */
  },



};

module.exports = plController;