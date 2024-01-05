//a futuro renombrar a tn-controller y tener un controller por app.

// Requires
const path = require("path");
const fs = require("fs");
const fetch = require('node-fetch');
const url = require('url');

//Services
const mainService = require("../../services/main-service");


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

    res.render("instructions/dt-instructions", { title: "Instrucciones", dt_connection_id, user_connected,google_user, google_user_id, firstPath})
  },
  documentation: (req,res) => {
    res.redirect("https://sheetscentral.notion.site/Drive-to-Tiendanube-72f6a9435253493885209eab1d671c10?pvs=4")
  }

};

module.exports = dtController;