// Requires
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");


const mainService = require("../services/main-service");
const User = require('../models/users');


const apiController = {
  viajes: async (req, res) => {
    const viajes = await mainService.viajes()
    res.json(viajes) 
  },
  equipamiento: async (req,res) => {
    const equipamiento = await mainService.equipamiento()
    res.json(equipamiento)
  },
  getData: async (req,res) => {
    try {
      const user = await User.findById(req.params.userId)
      res.json(user)
  } catch (error) {
      res.json(error)
  }
  },
  addmongouser: async (req,res) => {
    let store_id_from_req = req.query.store_id
    userObject = {
      access_token: "testing1234fromheroku",
      store_id: store_id_from_req
    }
    console.log(userObject)
    try{
      const userToAdd = await User.create(userObject)
      res.json(userToAdd)
    } catch (error){
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
      res.json(user)
  } catch (error) {
      res.json(error)
  }
  }
};

module.exports = apiController;