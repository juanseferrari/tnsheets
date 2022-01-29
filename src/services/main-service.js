// ***** Global requires *****
const path = require("path");
const fs = require("fs");

// ***** Database folder *****
const viajesFilePath = path.join(__dirname, "../db/viajes.json");
const viajes = JSON.parse(fs.readFileSync(viajesFilePath, "utf-8"));

// ***** Database folder *****
const equipamientoFilePath = path.join(__dirname, "../db/equipamiento.json");
const equipamiento = JSON.parse(fs.readFileSync(equipamientoFilePath, "utf-8"));

const mainService = {
  viajes() {
    return viajes;
  },
  equipamiento() {
      return equipamiento;
  }
};

module.exports = mainService;