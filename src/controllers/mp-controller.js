// Requires
const path = require("path");
const fs = require("fs");
const fetch = require('node-fetch');
const url = require('url');

//MP CREDENTIALS
const mp_test_access_token = process.env.MP_TEST_AT
const mp_access_token = process.env.MP_PROD_AT
const mp_test_client_secret = process.env.MP_TEST_CLIENT_SECRET

//MP MONGO DB
const MpUser = require('../models/usersmp');

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
      const user = await MpUser.findById(req.params.userId)
      res.json(user)
  } catch (error) {
      res.json(error)
  }
  },
  mp_oauth: async (req,res) => {
    let code = req.query.code
    let date_now = new Date();
    var requestOptions = {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + mp_test_access_token
      },
      body: JSON.stringify({
        "client_secret": mp_test_client_secret,
        "client_id": "8414965337573666",
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": mp_redirect_url
      })
    };

    let response = await fetch("https://api.mercadopago.com/oauth/token", requestOptions)
    let data = await response.json();


    if(data['error']){
        //WIP mostrar una pagina de error
        res.json({
          errorMessage: "Error al validar el token con Mercado Pago",
          data: data
        })
      } else {
        /** FUNCIONO OK EL OAUTH, valido que exista en la DB */
          const mp_user = {
            mp_access_token: data['access_token'],
            mp_user_id: data['user_id'],
            mp_refresh_token: data['refresh_token'],
            conection_date: date_now.toISOString()
          }; 
          //hacer un GET al store para traer mas informacion relevante de la store.
   
          let finded_mp_user = MpUser.findOneAndUpdate({mp_user_id: data['user_id'].toString()},mp_user,{upsert: true,rawResult: true,returnNewDocument: true},function(error,result){
            if(error){
              res.json({
                errorMessage: "Error al guardar en la base de datos",
                data: error
              })
            }else{
              //GUARDADO EXITOSAMENTE EN DB

              //WIP send email api

              //save cookie
              res.cookie("mp_user_id", data['user_id'])
  
              //render instrucciones
              res.render("menus/mp_instructions", {id_conexion: result.value._id ,title:"Instrucciones"});
            }
          })
   
        }
    }  
    
  
};

module.exports = mpController;