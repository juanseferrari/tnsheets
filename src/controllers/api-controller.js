// Requires
const path = require("path");
const fs = require("fs");

const mainService = require("../services/main-service");


const apiController = {
  viajes: async (req, res) => {
    const viajes = await mainService.viajes()
    res.json(viajes) 
  },
  equipamiento: async (req,res) => {
    const equipamiento = await mainService.equipamiento()
    res.json(equipamiento)
  }
};

module.exports = apiController;