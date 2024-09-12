// Requires
const path = require("path");
const fs = require("fs");
const fetch = require('node-fetch');
const url = require('url');

//MP CREDENTIALS ASTON
const mp_access_token = process.env.MP_PROD_AT_ASTON
const mp_client_id = process.env.MP_CLIENT_ID_ASTON
const mp_client_secret = process.env.MP_CLIENT_SECRET_ASTON


//SERVICES
const mainService = require("../../services/main-service");


var mp_redirect_url = "https://www.sheetscentral.com/aston/oauth"
const aston_url = "https://auth.mercadopago.com/authorization?client_id="+mp_client_id+"&response_type=code&platform_id=mp&redirect_uri=https://www.sheetscentral.com/aston/oauth"

const mpController = {
  connect: async (req, res) => {
    res.redirect(aston_url)
  },
  redirect: async (req, res) => {
    res.redirect("https://sheetscentral.notion.site/Sheets-Central-Mercado-Pago-2c38dda89e99413fb0b343cff2d90346")
  },
  astonOauth: async (req, res) => {
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

    if (data['error']) {
      //ERROR AL CONECTARSE CON MP
      console.log("mp error data")
      console.log(data)
      console.log("mp error data")

      let message = "No hemos podido validar la conexión con Mercado Pago. Por favor intente nuevamente."
      res.render("menus/error-page", { message, navbar_data })
    } else {
      /** FUNCIONO OK EL OAUTH */

      //GET INFO ABOUT MP USER
      let mp_user_info = await mainService.getAccountInfo(data['user_id'], data['access_token'], "mp")
      console.log(mp_user_info)
      if (mp_user_info["logo_url"] == "") {
        var user_logo = null
      } else {
        var user_logo = mp_user_info["logo_url"]
      }
      var data_to_airtable_db = {
        "nickname": "[AS] " + mp_user_info["company_name"],
        //ESTO ES UN ERROR, PORQUE NO TODOS TIENEN COMPANY NAME
        "access_token": data['access_token'],
        "refresh_token": data['refresh_token'],
        "user_id": data['user_id'].toString(),
        "connection": "aston",
        "active": "true",
        "uninstalled_date": null,
        "user_name": mp_user_info["company_name"],
        "user_email": mp_user_info["email"],
        "user_logo": user_logo,
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

        res.redirect("https://www.astonapp.com/")
      } catch (error) {
        let message = "Ha ocurrido un error, intentelo más tarde. Error: 90189282991"
        res.render("menus/error-page", { message, navbar_data })
      }


    }

  },

};

module.exports = mpController;