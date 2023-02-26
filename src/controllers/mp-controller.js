// Requires
const path = require("path");
const fs = require("fs");
const fetch = require('node-fetch');
const url = require('url');


const mpUser = require('../models/usersmp');

var mp_redirect_url = "https://www.sheetscentral.com/mp-oauth"


const mpController = {
  mpHome: (req,res) => {
    res.render( "menus/mercadopago", { title: "Mercado Pago" });
  },
  instrucciones: (req,res) => {
    console.log("Cookies:", req.cookies)
    id_conexion = ""
    if(req.cookies.tn_id){
      id_conexion = req.cookies.tn_id
    }

    res.render("menus/instrucciones", {title: "Instrucciones",id_conexion})
  },
  getData: async (req,res) => {
    try {
      const user = await mpUser.findById(req.params.userId)
      res.json(user)
  } catch (error) {
      res.json(error)
  }
  },
  mp_oauth: async (req,res) => {
    let code = req.query.code
    console.log(code)
    var requestOptions = {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer APP_USR-8414965337573666-022612-3ae1feb9805de5b497a50c59ae587d3f-1196439407"
      },
      body: JSON.stringify({
        "client_secret": "2tdgDtxL7cb6ZTuzg7zazSOPrxh3Qliw",
        "client_id": "8414965337573666",
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": mp_redirect_url
      })
    };
    console.log(requestOptions.body)

    let response = await fetch("https://api.mercadopago.com/oauth/token", requestOptions)
    let data = await response.json();
    console.log(data)
    res.send(data) 
    }  
    
  
};

module.exports = mpController;