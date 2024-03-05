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

    let google_user = res.locals.google_user
    let connection_id = res.locals.connection_id
    let dt_connection_id = res.locals.dt_connection_id
    let navbar_data = res.locals.navbar_data

    let user_connected = await mainService.searchUser(connection_id)

    const projectos = await mainService.projectos()

    var pathSegments = req.url.split('/');
    var firstPath = pathSegments[1];
    console.log("firstPath: " + firstPath)

    res.render("index", { projectos, google_user, user_connected, connection_id, dt_connection_id, navbar_data, firstPath });
  },
  pong: async (req, res) => {
    res.json({
      "pong": true
    });
  },
  contacto: async (req, res) => {

    let google_user = res.locals.google_user
    let connection_id = res.locals.connection_id
    let navbar_data = res.locals.navbar_data

    let user_connected = await mainService.searchUser(connection_id)

    res.render("menus/contacto", { connection_id, user_connected, google_user, navbar_data });
  },
  account: async (req, res) => {
    const projectos = await mainService.projectos()

    let google_user = res.locals.google_user
    let navbar_data = res.locals.navbar_data
    let connections = res.locals.connections

    var pathSegments = req.url.split('/');
    var firstPath = pathSegments[1];
    console.log("firstPath: " + firstPath)

    //IF google_connections.error -> Devolver que no se puede acceder o llevar a la home
    if (connections.google_connections.error && connections.cookie_connections.amount_of_results == 0) {

      res.redirect("/")
    } else {
      //Para cada una de las conexiones que tenga el usuario, traer la data (ni si quiera, podria solo poner estas conectado, ir a config o conectar. )
      //Traer el array de projectos y mostrarlos en la pagina de
      res.render("menus/account", { projectos, google_user, connections, navbar_data });
    }

  },
  login: (req, res) => {
    res.render("menus/login", { title: "Login" })
  },
  documentation: (req, res) => {
    res.redirect("https://sheetscentral.notion.site/Documentaci-n-890e7b0a5d6c47f2a2b82d2061ca0ef8")
  },
  privacy: async (req, res) => {
    let navbar_data = res.locals.navbar_data
    res.render("menus/privacy-policy", { navbar_data })
  },
  terms: async (req, res) => {
    let navbar_data = res.locals.navbar_data
    res.render("menus/terms-and-conditions", { navbar_data })
  }
};

module.exports = mainController;