//a futuro renombrar a tn-controller y tener un controller por app.

// Requires
const path = require("path");
const fs = require("fs");
const fetch = require('node-fetch');
const url = require('url');

//Services
const mainService = require("../services/main-service");
//const User = require('../models/users'); // MongoDB model -> TO DELETE
const MpUser = require('../models/usersmp');

const tn_client_id = "5434"
const tn_client_secret = process.env.TN_CLIENT_SECRET
const google_client_id = process.env.GOOGLE_CLIENT_ID
const google_client_secret = process.env.GOOGLE_CLIENT_SECRET

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
    res.render("menus/home", { projectos });
  },
  tiendaNubeHome: (req, res) => {
    res.render("index", { title: "Inicio" });
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
  instrucciones: (req, res) => {
    console.log("Cookies:", req.cookies)
    id_conexion = ""
    if (req.cookies.conection_id) {
      id_conexion = req.cookies.conection_id
    }
    let tn_user_name = req.cookies.tn_user_name
    //validar si el conection_id tiene subscription_status (nueva variable a agregar al momento del primer auth)

    res.render("menus/instrucciones", { title: "Instrucciones", id_conexion })
  },
  instrucciones2: async (req, res) => {
    //res.cookie("connection_id", "rec4UeECqFJzN49Vy")

    console.log("Cookies:", req.cookies)
    connection_id = ""
    if (req.cookies.connection_id) {
      connection_id = req.cookies.connection_id
    }
    let user_connected = await mainService.searchUser(connection_id)
    console.log("user_connected")
    console.log(user_connected)
    console.log("user_connected")

    //validar si el conection_id tiene subscription_status (nueva variable a agregar al momento del primer auth)

    let user_name = req.cookies.tn_user_name

    res.render("menus/tn-instructions", { title: "Instrucciones", connection_id, user_connected})
  },
  errorPage: (req, res) => {
    let message = "No hemos podido validar la conexión con Tienda Nube. Por favor intente nuevamente."
    res.render("menus/error-page", { message })
  },
  tnOauth: async (req, res) => {
    let code = req.query.code
    var urlencoded = new URLSearchParams();
    urlencoded.append("client_id", tn_client_id);
    urlencoded.append("client_secret", tn_client_secret);
    urlencoded.append("grant_type", "authorization_code");
    urlencoded.append("code", code);

    var requestOptions = {
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: urlencoded,
      redirect: 'follow'
    };

    let response = await fetch("https://www.tiendanube.com/apps/authorize/token", requestOptions)
    let data = await response.json();
    if (data['error']) {
      //WIP despues manejar bien este error handling. 
      let message = "No hemos podido validar la conexión con Tienda Nube. Por favor intente nuevamente."
      res.render("menus/error-page", { message })
    } else {
      /** FUNCIONO OK EL OAUTH, valido que exista en la DB */
      const user = {
        access_token: data['access_token'],
        store_id: String(data['user_id'])
      };
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

      //AIRTABLE DATA
      let user_email = tn_user_data['email']
      let user_name = tn_user_data['name']['es']
      let user_logo = tn_user_data['logo']
      var data_to_airtable_db = {
        "performUpsert": {
          "fieldsToMergeOn": [
            "user_id", "conection"
          ]
        },
        "records": [
          {
            "fields": {
              //  Futuro: Agregar el state para identificar al usuario
              "nickname": "[TN] " + user_name,
              "access_token": data['access_token'],
              "user_id": data['user_id'].toString(),
              "conection": "tienda_nube",
              "active": "true",
              "user_name": user_name,
              "user_email": user_email,
              "user_logo": "https:" + user_logo,
              "conection_date": new Date().toISOString(),
              "tag": { "id": "usrvCuwmV2hTFySmZ" }
            }
          }
        ]
      } //end data_to_airtable_db

      var airtable_POSTrequestOptions = {
        method: 'PATCH',
        headers: {
          "Authorization": "Bearer " + airtable_access_token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data_to_airtable_db),
        redirect: 'follow'
      }
      //A FUTURO: Migrar a createAirtableUpsert
      let airtabe_request = await fetch("https://api.airtable.com/v0/" + airtable_base_id + "/" + airtable_prod_table_id, airtable_POSTrequestOptions)
      let airtable_response = await airtabe_request.json();
      //WIP Chequear que solamente haya un solo valor aca.
      let record_id = airtable_response['records'][0]['id']
      if (airtable_response['error']) {
        //console.log(airtable_response['error'])
        let message = "Ha ocurrido un error, intentelo más tarde. Error: 90189282999"
        res.render("menus/error-page", { message })
      } else {
        //SALIO TODO OK EL GUARDADO EN AIRTABLE Y VALIDACION DE TIENDA NUBE
        //A FUTURO send email - esto podria hacerse en Airtable

      //send webhook notification for app/uninstalled -> Migrarlo a un service
      var POSTrequestOptions2 = {
        method: 'POST',
        headers: {
          "Authentication": "bearer" + data['access_token'],
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "event": "app/uninstalled",
          "url": "https://www.sheetscentral.com/tn/uninstalled"
        }),
        redirect: 'follow'
      };
      try {
        let tn_app_request_data = await fetch("https://api.tiendanube.com/v1/" + data['user_id'] + "/webhooks", POSTrequestOptions2)
        let tn_app_data = await tn_app_request_data.json();
        console.log(tn_app_data)
        if(tn_app_data['id']){
            //SALIO TODO OK
            console.log(tn_app_data)
            //save cookie
            res.cookie("conection_id", record_id)
            res.cookie("tn_user_name", user_name)

            //render instrucciones
            res.render("menus/instrucciones", { id_conexion: record_id, title: "Instrucciones" });
        } else {
            //Fallo la generacion del app/uninstalled, pero hago el rendering igual
            console.log(tn_app_data)
            //save cookie
            res.cookie("conection_id", record_id)
            res.cookie("tn_user_name", user_name)
            //render instrucciones
            res.render("menus/instrucciones", { id_conexion: record_id, title: "Instrucciones" });
        }
        } catch (error) {
          //arreglar esto despues
          console.log(error)
        }

      

      }


    } /** Fin del else error */
    /** FUNCIONO OK EL OAUTH, ahora guardo en DB */
  }

  ,
  getTokenTN: async (req, res) => {
    //A FUTURO: esta funcion deberia ser connectSheet y se aplicaria para todas las conexiones.
    //deberiamos validar la suscripcion
    // funcion usada para obtener el token desde GAS
    let token = req.body.token
    let spreadsheet_id = req.body.spreadsheet_id
    var connection_id = req.body.connection_id

    //migrate to upsert data
    var data_to_airtable = {
      "fields": {
        "spreadsheet_id": spreadsheet_id,
        "spreadsheet_conection_date": new Date().toISOString(),
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
    //FUTURO, AGREGAR LA VALIDACION DEL SPREADSHEET ID
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

  },
  webhookConnection: async (req, res) => {
    //receive webhooks url and connection id and save into DB to keep tracking
    //in the case users cancels subscription, send webhook to url and cancel connection.

    let token = req.body.token
    var connection_id = req.body.connection_id
    var webhook_url = req.body.webhook_url

    var fields_to_db = {
      "webhook_url": webhook_url,
      "webhook_conection_date": new Date().toISOString(),
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
          "message": "This notification type is not supported. "
        }
      }
    }
    res.json(response_object)
  }
};

module.exports = mainController;