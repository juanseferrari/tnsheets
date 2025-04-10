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

    //locals
    let google_user = res.locals.google_user
    let connection_id = res.locals.connection_id
    let dt_connection_id = res.locals.dt_connection_id
    let navbar_data = res.locals.navbar_data
    let lang_object = res.locals.lang_object

    let user_connected = await mainService.searchUser(connection_id)

    const projectos = await mainService.projectos()

    var pathSegments = req.url.split('/');
    var firstPath = undefined;

    console.log("navbar_data")
    console.log(navbar_data)
    console.log("navbar_data")

    res.render("index", { projectos, google_user, user_connected, connection_id, dt_connection_id, navbar_data, firstPath, lang_object });
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
    let lang_object = res.locals.lang_object

    let user_connected = await mainService.searchUser(connection_id)

    res.render("menus/contacto", { connection_id, user_connected, google_user, navbar_data,lang_object });
  },
  whatsapp: async (req, res) => {
    let message = req.query.message
    res.redirect("https://wa.me/+541172000689?text="+message+"&type=phone_number&app_absent=0")
  },
  account: async (req, res) => {
    const projectos = await mainService.projectos()

    let google_user = res.locals.google_user
    let navbar_data = res.locals.navbar_data
    let connections = res.locals.connections
    let lang_object = res.locals.lang_object

    var pathSegments = req.url.split('/');
    var firstPath = pathSegments[1];
    console.log("firstPath: " + firstPath)

    if(google_user.google_user_id || connections.length > 0){
      res.render("menus/account", { projectos, google_user, connections, navbar_data,lang_object });
    } else {
      res.redirect("/")
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
    let lang_object = res.locals.lang_object

    res.render("menus/privacy-policy", { navbar_data, lang_object })
  },
  terms: async (req, res) => {
    let navbar_data = res.locals.navbar_data
    let lang_object = res.locals.lang_object

    res.render("menus/terms-and-conditions", { navbar_data,lang_object })
  }
};

module.exports = mainController;