// ***** Global requires *****
const path = require("path");
const fs = require("fs");

const User = require('../models/users');



const mainService = {
  viajes() {
    return {
      "viajes": "viajes"
    };
  },
  equipamiento() {
      return {
        "equipamiento": "equipamiento"
      };
  }
};

module.exports = mainService;