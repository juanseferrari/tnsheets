// ***** Global requires *****
const path = require("path");
const fs = require("fs");

const User = require('../models/users');

// ***** Database folder *****
const projectsFilePath = path.join(__dirname, "../db/projects.json");
const projects = JSON.parse(fs.readFileSync(projectsFilePath, "utf-8"));

const mainService = {
  projectos() {
    return projects
  },
  equipamiento() {
      return {
        "equipamiento": "equipamiento"
      };
  },
  async getAccountInfo(user_id,token,platform){
    let response_object = {}
    let headers = {}
    let url = ""
    if(platform == "mp"){
      //MERCADO PAGO
      headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      }
      url = "https://api.mercadopago.com/users/me"
      var requestOptions = {
        method: 'GET',
        headers: headers
      };
  
      let response = await fetch(url, requestOptions)
      let data = await response.json();
      response_object = {
        "company_name": data['first_name'] + " " + data['last_name'],
        "email": data['email'],
        "country": data['country_id'],
        "logo_url": data['logo']
      }


    } else if (platform == "tn"){
      // TIENDA NUBE
      headers = {
        "Content-Type": "application/json",
        'Authentication': token
      }
      url = "https://api.tiendanube.com/v1/"+user_id+"/store"

      var requestOptions = {
        method: 'GET',
        headers: headers
      };
  
      let response = await fetch(url, requestOptions)
      let data = await response.json();
      response_object = {
        "company_name": data['name']['es'],
        "email": data['email'],
        "country": data['country'],
        "logo_url": data['logo']
      }
    } else {
      response_object = {
        "error": "invalid platform"
      }
    }



    return response_object

  }
};

module.exports = mainService;