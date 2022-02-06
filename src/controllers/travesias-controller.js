// Requires
const path = require("path");
const fs = require("fs");


const mainController = {
  travesias: (req, res) => {
    res.render("menus/travesias", {url : "../viajes/home-travesias"});
  },
  lagunanegra: (req,res) => {
    res.render("menus/travesias", {url : "../viajes/brc/1-lagunanegra"} );
  },
  lagunacab: (req,res) => {
    res.render("menus/travesias", {url : "../viajes/brc/2-lagunacab"} );
  }
};

module.exports = mainController;