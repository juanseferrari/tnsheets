// Requires
const path = require("path");
const fs = require("fs");
const fetch = require('node-fetch');

const tn_client_secret = process.env.TN_CLIENT_SECRET

//Google OAUTH validation
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const mainService = require("../services/main-service");

const User = require('../models/users');


const mainController = {
  home: async (req, res) => {
    const viajes = await mainService.viajes()
    res.render( "menus/home", { viajes });
  },
  tiendaNubeHome: (req, res) => {
    res.render( "index", { title: "Inicio" });
  },
  contacto: (req, res) => {
    res.render("menus/contacto");
  },
  login: (req,res) => {
    res.render("menus/login", {title: "Login"})
  },
  pricing: (req,res) => {
    res.render("menus/pricing", {title: "Pricing"})
  },
  privacy: (req,res) => {
    res.render("menus/privacy-policy", {})
  },
  terms: (req,res) => {
    res.render("menus/terms-and-conditions", {})
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
      const user = await User.findById(req.params.userId)
      res.json(user)
  } catch (error) {
      res.json(error)
  }
  },
  oauth: async (req,res) => {
    let code = req.query.code

    var urlencoded = new URLSearchParams();
    urlencoded.append("client_id", "5434");
    urlencoded.append("client_secret", tn_client_secret); // Pasar a .env en el futuro
    urlencoded.append("grant_type", "authorization_code");
    urlencoded.append("code", code);

    var requestOptions = {
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: urlencoded,
      redirect: 'follow'
    };

    let response = await fetch("https://www.tiendanube.com/apps/authorize/token", requestOptions)
    let data = await response.json();
    if(data['error']){
      res.json({
        errorMessage: "Error",
        data: data
      })
    } else {
      /** FUNCIONO OK EL OAUTH, valido que exista en la DB */
        const user = {
          access_token: data['access_token'],
          store_id: String(data['user_id'])
        }; 
        //hacer un GET al store para traer mas informacion relevante de la store.
 
        let finded_user = User.findOneAndUpdate({store_id: data['user_id'].toString()},user,{upsert: true,rawResult: true,returnNewDocument: true},function(error,result){
          if(error){
            res.send(error)
          }else{
            //send email api

            //save cookie
            res.cookie("tn_id", result.value._id)

            //render instrucciones
            res.render("menus/instrucciones", {id_conexion: result.value._id ,title:"Instrucciones"});
          }
        })
 
      } /** Fin del else error */
      /** FUNCIONO OK EL OAUTH, ahora guardo en DB */
    }  
    
  ,
  getToken: async (req,res) => {
    let token = req.query.token
    if(token === "sheetapi5678"){
      try {
        const user = await User.findById(req.params.Id)
        res.json({
          "id": user._id,
          "access_token": user.access_token,
          "store_id": user.store_id
        })
    } catch (error) {
        res.json({
          "error": "Usuario no encontrado",
          "errorName": error.name
        })
    }
    } else {
      res.json({
        "error": "Token invalido"
      })
    }

  },
  googleoauth: async(req,res) =>{


    async function verify() {
      const ticket = await client.verifyIdToken({
          idToken: req.body.credential,
          audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
          // Or, if multiple clients access the backend:
          //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
      });
      const payload = ticket.getPayload();
      const userid = payload['sub'];
      //Guardar esta info del payload en Mongo. 
      // If request specified a G Suite domain:
      // const domain = payload['hd'];
      // Cookies that have not been signed

      // Cookies that have been signed
      return payload
    }
    let google_user = await verify().catch(console.error);
    res.cookie("google_user", google_user.name)
    //console.log(google_user)


    res.render("menus/instrucciones", {id_conexion:req.cookies.tn_id,title:"Instrucciones"});


  },
  getStore: async (req,res) => {
    const data = await mainService.findByStore(req.query.store_id);
    console.log(data)
    res.json(data)
  }
};

module.exports = mainController;