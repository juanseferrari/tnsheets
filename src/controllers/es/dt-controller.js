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
const dt_client_id = "7342"
const dt_client_secret = process.env.DT_CLIENT_SECRET


const dtController = {
  cloneSheet: async (req,res) => {
    //v1.5
    res.redirect("https://docs.google.com/spreadsheets/d/1RKtuQ3AYjQdeaUDRvgKIppQMc8J9SxZz6ElzjeCV6EM/copy")
  },
  dtHome: async (req, res) => {
    let google_user = res.locals.google_user
    let dt_connection_id = res.locals.dt_connection_id
    let navbar_data = res.locals.navbar_data
    let lang_object = res.locals.lang_object

    let user_connected = await mainService.searchUser(dt_connection_id)

    //Path for documentation link
    var pathSegments = req.url.split('/');
    var firstPath = pathSegments[1];  
    console.log("firstPath: "+ firstPath)

    res.render("menus/drive-to-tiendanube", { google_user, dt_connection_id, user_connected, navbar_data, firstPath, lang_object });
  },
  configuration: async (req, res) => {

    let google_user = res.locals.google_user
    let dt_connection_id = res.locals.dt_connection_id
    let navbar_data = res.locals.navbar_data
    let lang_object = res.locals.lang_object

    let user_connected = await mainService.searchUser(dt_connection_id)

    let unredeemedPayments = await paymentService.unredeemedPayments(dt_connection_id)

    //Path for documentation link
    var pathSegments = req.url.split('/');
    var firstPath = pathSegments[1];  

    res.render("instructions/dt-instructions", { dt_connection_id, user_connected,google_user, navbar_data, firstPath, unredeemedPayments, lang_object})
  },
  configuration2: async (req, res) => {

    let google_user = res.locals.google_user
    let dt_connection_id = req.params.connId
    let navbar_data = res.locals.navbar_data
    let lang_object = res.locals.lang_object

    let user_connected = await mainService.searchUser(dt_connection_id)

    let unredeemedPayments = await paymentService.unredeemedPayments(dt_connection_id)


    //Path for documentation link
    var pathSegments = req.url.split('/');
    var firstPath = pathSegments[1];  

    res.render("instructions/dt-instructions", {dt_connection_id, user_connected,google_user, navbar_data, firstPath, unredeemedPayments, lang_object})
  },
  documentation: (req,res) => {
    let lang = req.query.lang
    if(lang == 'pt'){
      res.redirect("https://sheetscentral.notion.site/Drive-to-Tiendanube-PT-1d090c0cf28a80c0bdd6d1bc2e848a81?pvs=74")
    } else {
      res.redirect("https://sheetscentral.notion.site/Drive-to-Tiendanube-ES-72f6a9435253493885209eab1d671c10")
    }

  },
  getPremium: (req,res) => {
      res.redirect("/drive-to-tiendanube/config#step4")
  },
  dtOauth: async (req, res) => {
    let navbar_data = res.locals.navbar_data

    /**EL OAUTH DEBERIA SER UNO SOLO PARA TODOS LOS IDIOMAS.  */
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
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Sheets Central"
      },
      body: urlencoded,
      redirect: 'follow'
    };

    let response = await fetch("https://www.tiendanube.com/apps/authorize/token", requestOptions)
    let data = await response.json();
    console.log("data")
    console.log(data)
    console.log("data")

    if (data['error']) {
      //WIP despues manejar bien este error handling. 
      let message = "No hemos podido validar la conexión con Tienda Nube. Por favor intente nuevamente."
      res.render("menus/error-page", { message,navbar_data })
    } else {
      /** FUNCIONO OK EL OAUTH */

      // GET al store para traer mas informacion relevante de la store.
      var GETrequestOptions = {
        method: 'GET',
        headers: {
          "Authentication": "bearer" + data['access_token'],
          "User-Agent": "Sheets Central"
        },
        redirect: 'follow'
      };
      let tn_user_request_data = await fetch("https://api.tiendanube.com/v1/" + data['user_id'] + "/store", GETrequestOptions)
      let tn_user_data = await tn_user_request_data.json();
      console.log(tn_user_data)

      let main_language = "es"
      if(tn_user_data['main_language']){
        main_language = tn_user_data['main_language']
      }

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
      const whatsapp = tn_user_data['whatsapp_phone_number'] ? tn_user_data['whatsapp_phone_number'] : ''

      var fields_to_db = {
        //  Futuro: Agregar el state para identificar al usuario
        "nickname": "[DT] " + tn_user_data['name'][main_language],
        "access_token": data['access_token'],
        "user_id": data['user_id'].toString(),
        "connection": "drive-to-tiendanube",
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
        if(response['response_status'] == 200){
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
              "url": "https://www.sheetscentral.com/drive-to-tiendanube/uninstalled"
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
                res.cookie("dt_connection_id", record_id)
                res.cookie("sc_lang", main_language)

                res.redirect("/drive-to-tiendanube/config")
            } else {
                //Fallo la generacion del app/uninstalled, pero hago el rendering igual
                //save cookie
                res.cookie("dt_connection_id", record_id)

                res.redirect("/drive-to-tiendanube/config")
            }
            } catch (error) {
              //arreglar esto despues
              console.log(error)
            }

        }
        } catch (error) {
          let message = "Ha ocurrido un error, intentelo más tarde. Error: 90189282999"
          res.render("menus/error-page", { message,navbar_data })
        }

    } /** Fin del else error */
  },
  appUninstalled: async (req,res) => {
    //funcion usada cuando se desinstala una conexion. Se guarda en la DB
    console.log(req.body)
    let au_store_id = req.body.store_id
    let au_event =  req.body.event
    let response_object
    if(au_event == "app/uninstalled"){
    var fields_to_db = {
        "active": "false",
        "plan": "inactive",
        "connection": "drive-to-tiendanube",
        "uninstalled_date": new Date().toISOString(),
        "user_id": au_store_id.toString()
      }
    try {
      let response = await mainService.createAirtableUpsert(true, ["user_id","connection"], fields_to_db, "prod_users")
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


};

module.exports = dtController;