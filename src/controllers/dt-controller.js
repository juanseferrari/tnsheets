//a futuro renombrar a tn-controller y tener un controller por app.

// Requires
const path = require("path");
const fs = require("fs");
const fetch = require('node-fetch');
const url = require('url');

//Services
const mainService = require("../services/main-service");

//Sheets Central tokens. 
const dt_client_id = "7342"
const dt_client_secret = process.env.DT_CLIENT_SECRET

//TEST ENVIRONMENTS
const test_client_id = "6107"
const test_client_secret = "d05ab78cfd8ec215ffe08d235cbf079a6c224c9b066b641e"


//AIRTABLE VALUES
//idealmente aca no deberia haber ninguna variable de airtable, tiene que estar todo en el service
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

const dtController = {
  dtHome: async (req, res) => {
    let connection_id = ""
    let google_user_id = ""
    if (req.cookies.connection_id) {
      connection_id = req.cookies.connection_id
    }
    if (req.cookies.google_user_id) {
      google_user_id = req.cookies.google_user_id
    }
    let user_connected = await mainService.searchUser(connection_id)
    res.render("menus/drive-to-tiendanube", { title: "Drive to Tiendanube", google_user_id, connection_id, user_connected });
  },
  instrucciones: async (req, res) => {
    console.log("Cookies:", req.cookies)
    connection_id = ""
    google_user_id = ""
    if (req.cookies.connection_id) {
      connection_id = req.cookies.connection_id
    }
    if (req.cookies.google_user_id) {
      google_user_id = req.cookies.google_user_id
    }
    let user_connected = await mainService.searchUser(connection_id)
    console.log("user_connected")
    console.log(user_connected)
    console.log("user_connected")

    res.render("instructions/dt-instructions", { title: "Instrucciones", connection_id, user_connected, google_user_id})
  },
  documentation: (req,res) => {
    res.redirect("https://sheetscentral.notion.site/Drive-to-Tiendanube-72f6a9435253493885209eab1d671c10?pvs=4")
  },
  dtOauth: async (req, res) => {
    let code = req.query.code
    let state = req.query.state //Este es el google_id

    var urlencoded = new URLSearchParams();
    urlencoded.append("client_id", dt_client_id);
    urlencoded.append("client_secret", dt_client_secret);
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

      //AIRTABLE DATA
      if(tn_user_data['url_with_protocol']){
        var user_url = tn_user_data['url_with_protocol']
      } else {
        var user_url = null
      }
      if(tn_user_data['logo']){
        var user_logo = "https:" + tn_user_data['logo']
      } else {
        var user_logo  = null
      }
      if(state){
        var google_user_id = state.toString()
      } else {
        var google_user_id = null
      }

      var fields_to_db = {
        //  Futuro: Agregar el state para identificar al usuario
        "nickname": "[DT] " + tn_user_data['name']['es'],
        "access_token": data['access_token'],
        "user_id": data['user_id'].toString(),
        "conection": "drive_to_tiendanube",
        "google_user_id": google_user_id,
        "active": "true",
        "user_name": tn_user_data['name']['es'],
        "user_email": tn_user_data['email'],
        "user_logo": user_logo,
        "country": tn_user_data['country'],
        "user_url": user_url,
        "conection_date": new Date().toISOString(),
        "tag": { "id": "usrvCuwmV2hTFySmZ" }
      }

      try {
        let response = await mainService.createAirtableUpsert(true, ["user_id", "conection"], fields_to_db, "prod_users")
        if(response['response_status'] == 200){
          let record_id = response['id']
          //send webhook notification for app/uninstalled -> Migrarlo a un service
          var POSTrequestOptions = {
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
            let tn_app_request_data = await fetch("https://api.tiendanube.com/v1/" + data['user_id'] + "/webhooks", POSTrequestOptions)
            let tn_app_data = await tn_app_request_data.json();
            console.log(tn_app_data)
            if(tn_app_data['id']){
                //SALIO TODO OK
                //save cookie
                res.cookie("connection_id", record_id)
                res.cookie("tn_user_name", tn_user_data['name']['es'])
          
                res.redirect("/drive-to-tiendanube/config")
            } else {
                //Fallo la generacion del app/uninstalled, pero hago el rendering igual
                //save cookie
                res.cookie("connection_id", record_id)
                res.cookie("tn_user_name",  tn_user_data['name']['es'])

                res.redirect("/drive-to-tiendanube/config")
            }
            } catch (error) {
              //arreglar esto despues
              console.log(error)
            }

        }
        } catch (error) {
          let message = "Ha ocurrido un error, intentelo más tarde. Error: 90189282999"
          res.render("menus/error-page", { message })
        }

    } /** Fin del else error */
  },
  getTokenTN: async (req, res) => {
    //todo A FUTURO: esta funcion deberia ser connectSheet y se aplicaria para todas las conexiones.
    //deberiamos validar la suscripcion
    // funcion usada para obtener el token desde GAS
    let token = req.body.token
    let spreadsheet_id = req.body.spreadsheet_id
    var connection_id = req.body.connection_id

    //TODO migrate to upsert data
    //TODO agregar validacion del email y del tipo de connection. Si es tienda_nube/shopify, etc se tiene que enviar directo desde el Google Sheet. 
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

  }

};

module.exports = dtController;