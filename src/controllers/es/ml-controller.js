// Requires
const path = require("path");
const fs = require("fs");
const fetch = require('node-fetch');
const url = require('url');

//MP CREDENTIALS PROD
const mp_access_token = process.env.MP_PROD_AT
const mp_client_id = process.env.MP_CLIENT_ID
const mp_client_secret = process.env.MP_CLIENT_SECRET

//MP CREDENTIALS TEST
//USER: TESTGUTFSIRT
//PASS: qatest5942

//USER: TESTUSER1060967405
//PASS: i0nRgXG0YP
const mp_test_access_token = process.env.MP_TEST_AT
const mp_test_client_id = process.env.MP_TEST_CLIENT_ID
const mp_test_client_secret = process.env.MP_TEST_CLIENT_SECRET


//SERVICES
const mainService = require("../../services/main-service");
const paymentsService = require("../../services/payment-service");


var ml_redirect_url = "https://www.sheetscentral.com/mercadolibre/oauth"


const mlController = {
  cloneSheet: async (req, res) => {
    //v1.1
    res.redirect("https://docs.google.com/spreadsheets/d/15nVDNejnPQKCPX6oWjF4-a3N9JVuOLeJslZRKXoo3RY/copy")
  },
  mlHome: async (req, res) => {

    let google_user = res.locals.google_user
    let navbar_data = res.locals.navbar_data
    let lang_object = res.locals.lang_object

    let ml_connection_id = res.locals.ml_connection_id

    let user_connected = await mainService.searchUser(ml_connection_id)

    //Path for documentation link
    var pathSegments = req.url.split('/');
    var firstPath = pathSegments[1];
    console.log("firstPath: " + firstPath)


    res.render("menus/mercadolibre", { title: "Mercado Libre", ml_connection_id, user_connected, google_user, navbar_data, firstPath, lang_object });
  },
  configuration: async (req, res) => {
    //TODO

    let google_user = res.locals.google_user
    let navbar_data = res.locals.navbar_data
    let lang_object = res.locals.lang_object

    let ml_connection_id = res.locals.ml_connection_id

    let user_connected = await mainService.searchUser(ml_connection_id)

    //Path for documentation link
    var pathSegments = req.url.split('/');
    var firstPath = pathSegments[1];
    console.log("firstPath: " + firstPath)


    res.render("instructions/ml-instructions", { title: "Instrucciones", ml_connection_id, user_connected, google_user, navbar_data, firstPath, lang_object })
  },
  documentation: (req, res) => {
    //TODO
    res.redirect("https://sheetscentral.notion.site/Sheets-Central-Mercado-Pago-2c38dda89e99413fb0b343cff2d90346")
  },
  mlOauth: async (req, res) => {
    let navbar_data = res.locals.navbar_data

    let code = req.query.code
    let date_now = new Date();
    var requestOptions = {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + mp_access_token
      },
      body: JSON.stringify({
        "client_secret": mp_client_secret,
        "client_id": mp_client_id,
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": ml_redirect_url
      })
    };
    let response = await fetch("https://api.mercadolibre.com/oauth/token", requestOptions)
    let data = await response.json();

    if (data['error']) {
      //ERROR AL CONECTARSE CON MP
      console.log("ml error data")
      console.log(data)
      console.log("ml error data")

      let message = "No hemos podido validar la conexión con Mercado Pago. Por favor intente nuevamente."
      res.render("menus/error-page", { message, navbar_data })
    } else {
      /** FUNCIONO OK EL OAUTH */

      //GET INFO ABOUT MP USER
      let ml_user_info = await mainService.getAccountInfo(data['user_id'], data['access_token'], "ml")
      console.log(ml_user_info)
      if (ml_user_info["logo_url"] == "") {
        var user_logo = null
      } else {
        var user_logo = ml_user_info["logo_url"]
      }

      var data_to_airtable_db = {
        "nickname": "[ML] " + ml_user_info["company_name"],
        "access_token": data['access_token'],
        "refresh_token": data['refresh_token'],
        "user_id": data['user_id'].toString(),
        "connection": "mercadolibre",
        "active": "true",
        "uninstalled_date": null,
        "user_name": ml_user_info["company_name"],
        "user_email": ml_user_info["email"],
        "user_logo": user_logo,
        "country": ml_user_info["country"],
        "connection_date": new Date().toISOString(),
        "tag": { "id": "usrOsqwIYk4a2tZsg" }
      }
      try {
        let airtable_response = await mainService.createAirtableUpsert(true, ["user_id", "connection"], data_to_airtable_db, "prod_users")
        let id_conexion = airtable_response['id']

        res.cookie("ml_connection_id", id_conexion)
        res.cookie("ml_user_id", data['user_id'].toString())

        res.redirect("/mercadolibre/config")
      } catch (error) {
        let message = "Ha ocurrido un error, intentelo más tarde. Error: 90189282991"
        res.render("menus/error-page", { message, navbar_data })
      }


    }

  },
  mpWebooks: async (req, res) => {

    console.log("MP Webhook data: ")
    console.log(req.body)
    console.log("MP Webhook data: ")

    //funcion usada cuando se desinstala una conexion. Se guarda en la DB
    let user_id = req.body.user_id
    let action = req.body.action
    let type = req.body.type
    let id = req.body.data.id
    let response_object

    switch (type) {
      case 'mp-connect':
        if (action == "application.deauthorized") {
          var fields_to_db = {
            "active": "false",
            "plan": "inactive",
            "connection": "mercadopago",
            "uninstalled_date": new Date().toISOString(),
            "user_id": user_id.toString()
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
              "type": "MP_CONNECT_NOTIFICATION_NOT_SUPPORTED",
              "message": "This notification type is not supported."
            }
          }

        }
        return res.json(response_object)

      case 'subscription_preapproval':

        const preapproval_id = req.body.data.id
        const subscription_data = await paymentsService.getMPSubcriptionData(preapproval_id)

        const ext_ref = subscription_data.external_reference
        let connection_id = "1234";
        let connection = "tn"
        let prod_users = undefined

        if(ext_ref){
          const parts = ext_ref.split('-');
          connection_id = parts[1];
          connection = parts[0]
          prod_users = [parts[1]]
        }
        
        let status = subscription_data.status
        if(subscription_data.status == 'authorized') {
          status = "active"
        } else if (subscription_data.status == 'cancelled'){
          status = "canceled"
        } else {
          status = subscription_data.status
        }

        let json_to_sc = {
          "customer_id": preapproval_id,
          "client_reference_id": connection_id,
          "customer_name": null,
          "customer_email": null,
          "date_created": new Date().toISOString(),
          "mode": "subscription",
          "subscription_id": preapproval_id,
          "subscription_status": status,
          "internal_product": "tiendanube_2",
          "tag": { "id": "usrOsqwIYk4a2tZsg" },
          //"prod_users": [connection_id],
          prod_users,
          "test_mode": "false",
          //"test_mode": req.query.test_mode ? req.query.test_mode : "false",
          "management_url": "https://www.mercadopago.com.ar/subscriptions/v0/" + preapproval_id + "/admin"
        }
        try {
          let response = await mainService.createAirtableUpsert(true, ["subscription_id"], json_to_sc, "subscriptions")
          res.json(response)
        } catch (error) {
          res.json(error)
        }

      case 'payment':
        console.log("probando")
      //CREO QUE ESTE NO HACE FALTA TODAVIA. ES PARA OBTENER LA INFO DE LOS PAGOS, PERO ESO LO TIENE TODO EN EL ADMIN
      default:
        return false
       // res.json({"default": true})

    }
  },
  mpPaymentWebooks: async (req,res) => {

    console.log("MP Webhook data: ")
    console.log(req.body)
    console.log("MP Webhook data: ")

    //funcion usada cuando se desinstala una conexion. Se guarda en la DB
    let user_id = req.body.user_id
    let action = req.body.action
    let type = req.body.type
    let id = req.body.data.id

    //GET USER TOKEN

    //GET MP PAYMENT OBJECT

    //POST TO SCRIPT URL
    var requestOptions = {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body)
    };
    let response = await fetch("https://script.google.com/macros/s/AKfycbwU2wTjI73Fkg6l0vYIP-dyjFMPJpJtmM9QJ_3FBUvNvFIjMmQnoWiwVx5YTYli7VTSUg/exec", requestOptions)
    //STRUCTURE PAYMENT RESPONSE
    res.json(response)

  },

};

module.exports = mlController;