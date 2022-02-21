// Requires
const path = require("path");
const fs = require("fs");

const mainService = require("../services/main-service");


const mainController = {
  home: async (req, res) => {
    const viajes = await mainService.viajes()

    res.render( "index", { viajes, title: "Inicio" });
  },
  viajes: async(req, res) => {
    const viajes = await mainService.viajes()
 
    res.render("menus/viajes", {viajes, title: "Viajes"} );
  },
  travesias: (req, res) => {
    res.render("menus/travesias", {title: "Travesias"});
  },
  equipamiento: async (req, res) => {
    const equipamiento = await mainService.equipamiento();
    console.log(equipamiento)
    console.log(equipamiento.comida)
    res.render("menus/equipamiento", {equipamiento, title: "Equipamiento"});
  },
  contacto: (req, res) => {
    res.render("menus/contacto", {title: "Contacto"});
  },
  bariloche: (req,res) => {
    console.log("bariloche")
    res.render("contenidos/cincolagunas", {title: "5 Lagunas"} );

  }
};

module.exports = mainController;