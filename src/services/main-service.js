// ***** Global requires *****
const path = require("path");
const fs = require("fs");

const User = require('../models/users');

// ***** Database folder *****
const projectsFilePath = path.join(__dirname, "../db/projects.json");
const projects = JSON.parse(fs.readFileSync(projectsFilePath, "utf-8"));

const mainService = {
  viajes() {
    return projects
  },
  equipamiento() {
      return {
        "equipamiento": "equipamiento"
      };
  }
};

module.exports = mainService;