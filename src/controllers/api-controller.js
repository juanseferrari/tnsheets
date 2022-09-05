// Requires
const path = require("path");
const fs = require("fs");

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
  mongousers: async (req,res) => {
    try {
      const user = await User.findById(req.params.userId)
      res.json(user)
  } catch (error) {
      res.json(error)
  }
  },
  mongouserscheck: (req,res) => {
    console.log("checking mongo")
    res.json({"test": 123})
  },
  addmongouser: async (req,res) => {
    let store_id_from_req = req.query.store_id
    userObject = {
      access_token: "testing1234fromheroku",
      refresh_token: "rt1234",
      store_id: store_id_from_req
    }
    console.log(userObject)
    try{
      const userToAdd = await User.create(userObject)
      res.json(userToAdd)
    } catch (error){
      res.json(error)
    }

  }
};

module.exports = apiController;