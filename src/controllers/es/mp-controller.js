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


var mp_redirect_url = "https://www.sheetscentral.com/mp-oauth"


const mpController = {
  mpHome: async (req,res) => {

    let google_user = res.locals.google_user
    let navbar_data = res.locals.navbar_data

    let mp_connection_id = res.locals.mp_connection_id

    let user_connected = await mainService.searchUser(mp_connection_id)

      //Path for documentation link
      var pathSegments = req.url.split('/');
      var firstPath = pathSegments[1];  
      console.log("firstPath: "+ firstPath)    
  

    res.render( "menus/mercadopago", { title: "Mercado Pago", mp_connection_id, user_connected, google_user, navbar_data, firstPath });
  },
  configuration: async (req,res) => {

    let google_user = res.locals.google_user
    let navbar_data = res.locals.navbar_data

    let mp_connection_id = res.locals.mp_connection_id

    let user_connected = await mainService.searchUser(mp_connection_id)

      //Path for documentation link
      var pathSegments = req.url.split('/');
      var firstPath = pathSegments[1];  
      console.log("firstPath: "+ firstPath)    

      
    res.render("instructions/mp-instructions", {title: "Instrucciones",mp_connection_id,user_connected, google_user,navbar_data, firstPath})
  },
  documentation: (req,res) => {
    res.redirect("https://sheetscentral.notion.site/Mercado-Pago-b65c0b5feb5545c795f277bfe6c5ef04")
  },
  mpOauth: async (req,res) => {
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
        "redirect_uri": mp_redirect_url
      })
    };
    let response = await fetch("https://api.mercadopago.com/oauth/token", requestOptions)
    let data = await response.json();

    if(data['error']){
      //ERROR AL CONECTARSE CON MP
      let message = "No hemos podido validar la conexión con Mercado Pago. Por favor intente nuevamente."
      res.render("menus/error-page", { message,navbar_data })
      } else {
        /** FUNCIONO OK EL OAUTH */

        //GET INFO ABOUT MP USER
        let mp_user_info = await mainService.getAccountInfo(data['user_id'],data['access_token'],"mp")
        console.log(mp_user_info)
        var data_to_airtable_db = {
                "nickname": "[MP] " + mp_user_info["company_name"],
                "access_token": data['access_token'],
                "refresh_token": data['refresh_token'],
                "user_id": data['user_id'].toString(),
                "connection": "mercadopago",
                "active": "true",
                "uninstalled_date": null,
                "user_name": mp_user_info["company_name"],
                "user_email": mp_user_info["email"],
                "user_logo": mp_user_info["logo_url"],
                "country": mp_user_info["country"],
                "connection_date": new Date().toISOString(),
                "tag": { "id": "usrOsqwIYk4a2tZsg" }
        } //end data_to_airtable_db
        try {
          let airtable_response = await mainService.createAirtableUpsert(true, ["user_id", "connection"], data_to_airtable_db, "prod_users")
          let id_conexion = airtable_response['id']

          res.cookie("mp_connection_id", id_conexion)
          res.cookie("mp_user_id", data['user_id'].toString())
          res.cookie("mp_user_name", mp_user_info["company_name"])

          res.redirect("/mercadopago/config")
        } catch (error) {
          let message = "Ha ocurrido un error, intentelo más tarde. Error: 90189282991"
          res.render("menus/error-page", { message ,navbar_data})
        }

      
      }

  },
  appUninstalled: async (req,res) => {
    //funcion usada cuando se desinstala una conexion. Se guarda en la DB
    let user_id = req.body.user_id
    let event =  req.body.action

    let response_object
    if(event == "application.deauthorized"){
    var fields_to_db = {
        "active": "false",
        "connection": "mercadopago",
        "uninstalled_date": new Date().toISOString(),
        "user_id": user_id.toString()
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
          "type": "MP_NOTIFICATION_NOT_SUPPORTED",
          "message": "This notification type is not supported."
        }
      }
    }
    res.json(response_object)
  },
  getTokenMP: async (req,res) => {
    //WIP AGREGARLE LO DEL REFRESH TOKEN

  },   
  
};

module.exports = mpController;