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


    res.cookie("sc_lang", "ES")

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
  } 
};

module.exports = mainController;