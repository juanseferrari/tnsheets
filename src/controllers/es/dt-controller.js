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

//TEST ENVIRONMENTS
const test_client_id = "6107"
const test_client_secret = "d05ab78cfd8ec215ffe08d235cbf079a6c224c9b066b641e"


//AIRTABLE VALUES
//idealmente aca no deberia haber ninguna variable de airtable, tiene que estar todo en el service
const airtable_base_id = process.env.AIRTABLE_BASE_ID
const airtable_test_table_id = "tbl3tdymJSf7Rhiv0"
const airtable_prod_table_id = process.env.AIRTABLE_PROD_USERS
const airtable_access_token = process.env.AIRTABLE_ACCESS_TOKEN

const dtController = {
  dtHome: async (req, res) => {
    let dt_connection_id = ""

    if (req.cookies.dt_connection_id) {
      dt_connection_id = req.cookies.dt_connection_id
    } else if (req.cookies.connection_id){
      let user_connected_2 = await mainService.searchUser(req.cookies.connection_id)
      if(user_connected_2.connection == "drive-to-tiendanube"){
        dt_connection_id = req.cookies.connection_id
      }

    }
    console.log("dt_connection_id")
    console.log(dt_connection_id)
    console.log("dt_connection_id")

    let google_user_id = ""
    if (req.cookies.google_user_id) {
      google_user_id = req.cookies.google_user_id
    }

    let user_connected = await mainService.searchUser(dt_connection_id)
    let google_user = await mainService.searchGoogleUser(google_user_id)

    //Path for documentation link
    var pathSegments = req.url.split('/');
    var firstPath = pathSegments[1];  
    console.log("firstPath: "+ firstPath)


    res.render("menus/drive-to-tiendanube", { title: "Drive to Tiendanube", google_user_id, dt_connection_id, user_connected, google_user,  firstPath });
  },
  configuration: async (req, res) => {
    let dt_connection_id = ""
    console.log("dt_connection_id: " + dt_connection_id)

    if (req.cookies.dt_connection_id) {
      dt_connection_id = req.cookies.dt_connection_id
    } else if (req.cookies.connection_id){
      let user_connected_2 = await mainService.searchUser(req.cookies.connection_id)
      if(user_connected_2.connection == "drive-to-tiendanube"){
        dt_connection_id = req.cookies.connection_id
      }

    }
    console.log("dt_connection_id: " + dt_connection_id)


    let google_user_id = ""
    if (req.cookies.google_user_id) {
      google_user_id = req.cookies.google_user_id
    }


    let user_connected = await mainService.searchUser(dt_connection_id)
    let google_user = await mainService.searchGoogleUser(google_user_id)

    let unredeemedPayments = await paymentService.unredeemedPayments(dt_connection_id)


    //Path for documentation link
    var pathSegments = req.url.split('/');
    var firstPath = pathSegments[1];  
    console.log("firstPath: "+ firstPath)    

    res.render("instructions/dt-instructions", { title: "Instrucciones", dt_connection_id, user_connected,google_user, google_user_id, firstPath, unredeemedPayments})
  },
  documentation: (req,res) => {
    res.redirect("https://sheetscentral.notion.site/Drive-to-Tiendanube-72f6a9435253493885209eab1d671c10?pvs=4")
  },
  dtOauth: async (req, res) => {
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
          "Authentication": "bearer" + data['access_token'],
          "User-Agent": "Sheets Central"
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
        "connection": "drive-to-tiendanube",
        "google_user_id": google_user_id,
        "active": "true",
        "uninstalled_date": null,
        "user_name": tn_user_data['name']['es'],
        "user_email": tn_user_data['email'],
        "user_logo": user_logo,
        "country": tn_user_data['country'],
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
                res.cookie("tn_user_name", tn_user_data['name']['es'])
          
                res.redirect("/drive-to-tiendanube/config")
            } else {
                //Fallo la generacion del app/uninstalled, pero hago el rendering igual
                //save cookie
                res.cookie("dt_connection_id", record_id)
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
  appUninstalled: async (req,res) => {
    //funcion usada cuando se desinstala una conexion. Se guarda en la DB
    let au_store_id = req.body.store_id
    let au_event =  req.body.event
    let response_object
    if(au_event == "app/uninstalled"){
    var fields_to_db = {
        "active": "false",
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