// Requires
const path = require("path");
const fs = require("fs");

const mainService = require("../services/main-service");

const User = require('../models/users');


const mainController = {
  home: async (req, res) => {
    const viajes = await mainService.viajes()

    res.render( "index", { viajes, title: "Inicio" });
  },
  contacto: (req, res) => {
    res.render("menus/contacto", {title: "Contacto"});
  },
  login: (req,res) => {
    res.render("menus/login", {title: "Login"})
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
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    var urlencoded = new URLSearchParams();
    urlencoded.append("client_id", "5434");
    urlencoded.append("client_secret", "kI8kgTH4im9qPYp1nYVlZgbsC1zkHRe03FQsm88xYjoukida");
    urlencoded.append("grant_type", "authorization_code");
    urlencoded.append("code", code);

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: urlencoded,
      redirect: 'follow'
    };

    let response = await fetch("https://www.tiendanube.com/apps/authorize/token", requestOptions)
    let data = await response.json();

    if(data['error']){
      res.json({
        errorMessage: "Errorrrr",
        data: data
      })
    } else {
      /** FUNCIONO OK EL OAUTH, ahora guardo en DB */
      const user = new User({
        access_token: data['access_token'],
        store_id: data['user_id']
      });   
      try{
        const userToAdd = await User.create(user)
        console.log(userToAdd._id)
        console.log(userToAdd.store_id)
        res.json(userToAdd)
      } catch (error){
        res.json(error)
      }
    }  
  },
  getToken: async (req,res) => {
    try {
      const user = await User.findById(req.params.mongoId)
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
  }
};

module.exports = mainController;