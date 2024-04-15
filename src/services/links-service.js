// ***** Global requires *****
const path = require("path");
const fs = require("fs");


const linksService = {
  links() {

    let links = {
      "tiendanube": {
        "sheet_link": "",
        "premium_link": ""
      }

    }
    return links
  }
};

module.exports = linksService;