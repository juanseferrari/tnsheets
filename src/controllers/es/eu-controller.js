//CONTROLLER PARA LAS APPS EUROPEAS BANCARIAS

// Requires
const path = require("path");
const fs = require("fs");
const fetch = require('node-fetch');
const url = require('url');
const jwa = require("jwa")

const mainService = require("../../services/main-service");
const paymentService = require("../../services/payment-service");

const PRODSESSIONID = 'f3e8b085-8ee6-4467-98e4-f4ed081a3371'


const SandboxID = 'e4f8aa25-1e3a-4f2d-b35c-a750ebaf595b'
const ProdID = '06ef0654-b2b9-47bb-acd5-a1a19c1e26f9'

const jsonBase64 = (data) => {
  return Buffer.from(JSON.stringify(data)).toString("base64").replace("=", "")
}
const filePath = path.join(__dirname, `../../db/${ProdID}.pem`);

const privateKey = fs.readFileSync(filePath, "utf8")

const iat = Math.floor((new Date()).getTime() / 1000)
const jwtBody = {
  iss: "enablebanking.com", // always the same value
  aud: "api.enablebanking.com", // always the same value
  iat: iat, // time when the token is created
  exp: iat + 3600 // time when the token is set to expire
}
const jwt = ((exp = 3600) => {
  const header = jsonBase64({
    typ: "JWT",
    alg: "RS256",
    kid: ProdID // your application's ID
  })
  const body = jsonBase64(jwtBody)
  const signature = jwa("RS256").sign(`${header}.${body}`, privateKey)
  return `${header}.${body}.${signature}`
})()

console.log("jwt")
console.log(jwt)
console.log("jwt")

const baseHeaders = {
  Authorization: `Bearer ${jwt}`,
  'Content-Type': 'application/json'
}
async function getASPS (){
  const aspspsResponse = await fetch(`https://api.enablebanking.com/aspsps?country=FI`, {
    headers: baseHeaders
    })
    // If you want you can override BANK_NAME and BANK_COUNTRY with any bank from this list
    console.log(`Available ASPSPs: ${await aspspsResponse.text()}`)
    //Services
}

const euController = {
  cloneSheet: async (req, res) => {
    let connection_id = req.query.connection_id    
    if (connection_id) {
      let user_connected = await mainService.searchUser(connection_id)
      console.log("user_connected: " + JSON.stringify(user_connected))
      if (user_connected) {
        var fields_to_db = {
          "clicked_cloned": "clicked",
          "clicked_cloned_date": new Date().toISOString(),
          connection_id,
          "connection": "eubanks",
          "user_id": user_connected.user_id
        }
        console.log("fields_to_db: " + JSON.stringify(fields_to_db))
        try {
          let result = await mainService.createAirtableUpsert(true, ["user_id", "connection"], fields_to_db, "prod_users")
          console.log("result: " + JSON.stringify(result))
        } catch (error) {
        }
      }
    }

    //TODO add logic to redirect to the correct sheet
    res.redirect("https://docs.google.com/spreadsheets/d/1fAjXyysxHFVx_2zv70kY3FM9emwi0m1kYHve_XT2JMg/copy")
  },
  euHome: async (req, res) => {
    let google_user = res.locals.google_user
    let eu_connection_id = res.locals.eu_connection_id
    let navbar_data = res.locals.navbar_data
    let lang_object = res.locals.lang_object

    let user_connected = await mainService.searchUser(eu_connection_id)

    //SELECT COUNTRY AND BANK AND THEN REDIRECT TO WEBPAGE. 

    //Path for documentation link
    var pathSegments = req.url.split('/');
    var firstPath = pathSegments[1];

    res.render("menus/eubanks", { eu_connection_id, user_connected, google_user, navbar_data, firstPath, lang_object });
  },
  euOauth: async (req, res) => {
    console.log("in: /eubanks/oauth")
    let navbar_data = res.locals.navbar_data
    let lang_object = res.locals.lang_object

    let state = req.query.state //Este es el google_id
    
    const createSessionBody = {
      code: req.query.code
    }
    const createSessionResponse = await fetch(`https://api.enablebanking.com/sessions`, {
      method: "POST",
      headers: baseHeaders,
      body: JSON.stringify(createSessionBody)
    })
    const session = await createSessionResponse.json()
    console.log("session")
    console.log(session)
    console.log("session")

    console.log(`New user session has been created: ${session.session}`)

    if (session.error) {
      //WIP despues manejar bien este error handling. 
      let message = "No hemos podido validar la conexión con el banco europeo. Por favor intente nuevamente."
      res.render("menus/error-page", { message, navbar_data, lang_object })
    } else {
      /** FUNCIONO OK EL OAUTH */

      //HACER UN GET PARA OBTENER LA INFO DE LA ACCOUNT
      
      let google_user_id = null
      if (state) {
        google_user_id = state.toString()
      }

      //AIRTABLE DATA
      var fields_to_db = {
        "nickname": "[EU] Revolut Bank",
        "access_token": session.session_id,
        "user_id": session.session_id,
        "connection": "eubanks",
        "google_user_id": google_user_id,
        "active": "true",
        "plan": "free",
        "uninstalled_date": null,
        "user_name": "Revolut User",
        "user_email": null,
        "country": "LT",
        "connection_date": new Date().toISOString(),
        "tag": { "id": "usrOsqwIYk4a2tZsg" }
      }
      console.log("fields_to_db")
      console.log(fields_to_db)
      console.log("fields_to_db")

      try {
        let response = await mainService.createAirtableUpsert(true, ["user_id", "connection"], fields_to_db, "prod_users")
        console.log("Airtable response on save response")
        console.log(response)
        console.log("Airtable response on save response")

        if (response['response_status'] == 200) {
          let record_id = response['id']
          //save cookie
          res.cookie("eu_connection_id", record_id)
          res.cookie("sc_lang", "en")

          res.redirect("/eubanks/config")
        } else {
          let message = "Ha ocurrido un error, intentelo más tarde. Error: 333134"
          res.render("menus/error-page", { message, navbar_data, lang_object })
        }

      } catch (error) {
        let message = "Ha ocurrido un error, intentelo más tarde. Error: 90189282999"
        res.render("menus/error-page", { message, navbar_data, lang_object })
      }

    } /** Fin del else error */
  },
  euGetLink: async (req, res) => {
    console.log("in euGetLink ")
    let google_user = res.locals.google_user
    let connection_id = res.locals.connection_id
    let navbar_data = res.locals.navbar_data
    let lang_object = res.locals.lang_object

    let bank_name = req.query.bank_name
    let country = req.query.country

    const validUntil = new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000);
    const startAuthorizationBody = {
      access: {
        valid_until: validUntil.toISOString()
      },
      aspsp: {
        name: "Revolut", // BANK_NAME
        country: "LT" // BANK_COUNTRY
      },
      state: "123e4567-e89b-12d3-a456-426614174000",
      redirect_url: "https://www.sheetscentral.com/eubanks/oauth", // application's redirect URL
      psu_type: "personal"
    }
    const startAuthorizationResponse = await fetch(`https://api.enablebanking.com/auth`, {
      method: "POST",
      headers: baseHeaders,
      body: JSON.stringify(startAuthorizationBody)
    })
    const startAuthorizationData = await startAuthorizationResponse.json();
    console.log(`Start authorization data: ${startAuthorizationData.url}`)
    res.redirect(startAuthorizationData.url)
    //Path for documentation link
    },
  plSaveDB: async (req, res) => {
    let response_object
    const data = req.body;
    const google_user_id = req.query.state ? req.query.state.toString() : null
    //let user_connected = await mainService.searchUser(connection_id)
    var data_to_airtable_db = {
      "nickname": "[PL] " + data["item"]["connector"]["name"],
      "access_token": data["item"]["id"],
      "user_id": null,
      "connection": "pluggy",
      "google_user_id": google_user_id,
      "active": "true",
      "plan": "free",
      "uninstalled_date": null,
      "user_email": data["item"]["clientUserId"],
      "country": data["item"]["connector"]["country"],
      "connection_date": new Date().toISOString(),
      "tag": { "id": "usrOsqwIYk4a2tZsg" }
    } //end data_to_airtable_db
    try {
      let airtable_response = await mainService.createAirtableUpsert(true, ["user_id", "connection"], data_to_airtable_db, "prod_users")
      
      let id_conexion = airtable_response['id']
      if(id_conexion){
        response_object = airtable_response
      }
    } catch (error) {
      response_object = {
        "error": {
          "type": "GENERIC_ERROR",
          "message": error
        }
      }
    }
    console.log(response_object)
    res.json(response_object)
  },
  
  configuration: async (req, res) => {

    let google_user = res.locals.google_user
    let connection_id = res.locals.connection_id
    let navbar_data = res.locals.navbar_data
    let lang_object = res.locals.lang_object

    let user_connected = await mainService.searchUser(connection_id)

    //Path for documentation link
    var pathSegments = req.url.split('/');
    var firstPath = pathSegments[1];
    console.log("firstPath: " + firstPath)

    res.render("instructions/eu-instructions", { connection_id, user_connected, google_user, navbar_data, firstPath, lang_object })
  },
  documentation: (req, res) => {
    res.redirect("https://sheetscentral.notion.site/Sheets-Central-Tiendanube-01ee5d985cff4c759afa414a2cdf1c8d")
  }

};

module.exports = euController;