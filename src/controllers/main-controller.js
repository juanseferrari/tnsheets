// Requires
const path = require("path");
const fs = require("fs");
const fetch = require('node-fetch');
const url = require('url');

const tn_client_id = "5434"
const tn_client_secret = process.env.TN_CLIENT_SECRET
const google_client_id = process.env.GOOGLE_CLIENT_ID
const google_client_secret = process.env.GOOGLE_CLIENT_SECRET

//TEST ENVIRONMENTS
const test_client_id = "6107"
const test_client_secret = "d05ab78cfd8ec215ffe08d235cbf079a6c224c9b066b641e"


//AIRTABLE VALUES
const airtable_base_id = "apptn4i3QI5oFREAR"
const airtable_test_table_id = "tbl3tdymJSf7Rhiv0"
const airtable_prod_table_id = "tblnrwQ17D1popaBe"
const airtable_access_token = process.env.AIRTABLE_ACCESS_TOKEN

const airtable_GETrequestOptions = {
  method: 'GET',
  headers: {
    "Authorization": "Bearer " + airtable_access_token,
    "Content-Type": "application/json"
  },
  redirect: 'follow'
}

//Google OAUTH validation
//const {OAuth2Client} = require('google-auth-library');
//const client = new OAuth2Client(google_client_id);
const {google} = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  google_client_id,
  google_client_secret,
  "http://localhost:5001/authenticate"
);


const mainService = require("../services/main-service");
//const User = require('../models/users'); // MongoDB model -> TO DELETE
const MpUser = require('../models/usersmp');


const mainController = {
  home: async (req, res) => {
    const projectos = await mainService.projectos()
    res.render( "menus/home", { projectos });
  },
  tiendaNubeHome: (req, res) => {
    res.render( "index", { title: "Inicio" });
  },
  contacto: (req, res) => {
    res.render("menus/contacto");
  },
  login: (req,res) => {
    res.render("menus/login", {title: "Login"})
  },
  pricing: (req,res) => {
    res.render("menus/pricing", {title: "Pricing"})
  },
  privacy: (req,res) => {
    res.render("menus/privacy-policy", {})
  },
  terms: (req,res) => {
    res.render("menus/terms-and-conditions", {})
  },
  instrucciones: (req,res) => {
    console.log("Cookies:", req.cookies)
    id_conexion = ""
    if(req.cookies.conection_id){
      id_conexion = req.cookies.conection_id
    }

    res.render("menus/instrucciones", {title: "Instrucciones",id_conexion})
  },
  errorPage: (req,res) => {
    let message = "No hemos podido validar la conexión con Tienda Nube. Por favor intente nuevamente."
    res.render("menus/error-page", {message})
  },
  tnOauth: async (req,res) => {
    let code = req.query.code
    var urlencoded = new URLSearchParams();
    urlencoded.append("client_id", tn_client_id);
    urlencoded.append("client_secret", tn_client_secret); 
    urlencoded.append("grant_type", "authorization_code");
    urlencoded.append("code", code);

    var requestOptions = {
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: urlencoded,
      redirect: 'follow'
    };

    let response = await fetch("https://www.tiendanube.com/apps/authorize/token", requestOptions)
    let data = await response.json();
    if(data['error']){
      //WIP despues manejar bien este error handling. 
      let message = "No hemos podido validar la conexión con Tienda Nube. Por favor intente nuevamente."
      res.render("menus/error-page", {message})
    } else {
      /** FUNCIONO OK EL OAUTH, valido que exista en la DB */
        const user = {
          access_token: data['access_token'],
          store_id: String(data['user_id'])
        }; 
        // GET al store para traer mas informacion relevante de la store.
        var GETrequestOptions = {
          method: 'GET',
          headers: {
            "Authentication": "bearer" + data['access_token']
          },
          redirect: 'follow'
        };
        let tn_user_request_data = await fetch("https://api.tiendanube.com/v1/"+data['user_id']+"/store", GETrequestOptions)
        let tn_user_data = await tn_user_request_data.json();
        //console.log(tn_user_data)

        //AIRTABLE DATA
        let user_email = tn_user_data['email']
        let user_name = tn_user_data['name']['es']
        const data_to_airtable_db = {
          "performUpsert": {
            "fieldsToMergeOn": [
              "user_id", "conection"
            ]
          },
          "records": [
            {
              "fields": {
              //  Futuro: Agregar el state para identificar al usuario
                "nickname": "[TN] " + user_name,
                "access_token": data['access_token'],
                "user_id": data['user_id'].toString(),
                "conection": "tienda_nube",
                "active": "true",
                "user_name": user_name,
                "user_email": user_email,
                "conection_date": new Date().toISOString(),
                "tag": { "id": "usrvCuwmV2hTFySmZ"}  
              }
            }
          ]
        } //end data_to_airtable_db

      var airtable_POSTrequestOptions = {
          method: 'PATCH',
          headers: {
            "Authorization": "Bearer " + airtable_access_token,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data_to_airtable_db),
          redirect: 'follow'
        }
      let airtabe_request = await fetch("https://api.airtable.com/v0/"+ airtable_base_id + "/" + airtable_prod_table_id, airtable_POSTrequestOptions)
      let airtable_response = await airtabe_request.json();
      //WIP Chequear que solamente haya un solo valor aca.
      let record_id = airtable_response['records'][0]['id']
      if(airtable_response['error']){
        console.log(airtable_response['error'])
        let message = "Ha ocurrido un error, intentelo más tarde. Error: 90189282999"
        res.render("menus/error-page", {message})
      } else {
        //SALIO TODO OK EL GUARDADO EN AIRTABLE Y VALIDACION DE TIENDA NUBE
        //send email - esto podria hacerse en Airtable
        //save cookie
        res.cookie("conection_id", record_id)
        //render instrucciones
        res.render("menus/instrucciones", {id_conexion: record_id ,title:"Instrucciones"});
      }

 
      } /** Fin del else error */
      /** FUNCIONO OK EL OAUTH, ahora guardo en DB */
    }  
    
  , 
  getTokenTN: async (req,res) => {
    let token = req.query.token
    var conection_id = req.params.Id
    //var spreadsheet_id = req.params.spreadsheet_id
    //FUTURO, AGREGAR LA VALIDACION DEL SPREADSHEET ID
    if(token === "sheetapi5678"){
      try {
      let airtabe_request = await fetch("https://api.airtable.com/v0/"+ airtable_base_id + "/" + airtable_prod_table_id + "/" + conection_id, airtable_GETrequestOptions)
      let airtable_response = await airtabe_request.json();
        res.json({
          "id": airtable_response.id,
          "access_token": airtable_response.fields.access_token,
          "store_id": airtable_response.fields.user_id
        })
    } catch (error) {
        res.json({
          "error": "Usuario no encontrado",
          "errorName": error
        })
    }
    } else {
      res.json({
        "error": "Token invalido"
      })
    }

  },
  getTokenTN2: async (req,res) => {
    let token = req.body.token
    let spreadsheet_id = req.body.spreadsheet_id
    var connection_id = req.body.connection_id

    var data_to_airtable = {
               "fields": {
                 "spreadsheet_id": spreadsheet_id,
                 "spreadsheet_conection_date": new Date().toISOString(),
               }
         } //end data_to_airtable
 
    var airtable_update_record = {
           method: 'PATCH',
           headers: {
             "Authorization": "Bearer " + airtable_access_token,
             "Content-Type": "application/json"
           },
           body: JSON.stringify(data_to_airtable),
           redirect: 'follow'
         }

    if(token === "sheetapi5678"){
      try {
      let airtabe_request = await fetch("https://api.airtable.com/v0/"+ airtable_base_id + "/" + airtable_prod_table_id + "/" + connection_id, airtable_update_record)
      let airtable_response = await airtabe_request.json();
        res.json({
          "id": airtable_response.id,
          "access_token": airtable_response.fields.access_token,
          "store_id": airtable_response.fields.user_id
        })
    } catch (error) {
        res.json({
          "error": "Usuario no encontrado",
          "errorName": error
        })
    }
    } else {
      res.json({
        "error": "Token invalido"
      })
    }

  },
  getTokenMP: async (req,res) => {
    //WIP AGREGARLE LO DEL REFRESH TOKEN
    let token = req.query.token
    if(token === "sheetapi5678"){
      try {
        const user = await MpUser.findById(req.params.Id)
        res.json({
          "id": user._id,
          "access_token": user.mp_access_token,
          "user_id": user.mp_user_id
        })
    } catch (error) {
        res.json({
          "error": "Usuario no encontrado",
          "errorName": error.name
        })
    }
    } else {
      res.json({
        "error": "Token invalido"
      })
    }

  },
  googleoauth: async(req,res) =>{


    async function verify() {
      const ticket = await client.verifyIdToken({
          idToken: req.body.credential,
          audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
          // Or, if multiple clients access the backend:
          //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
      });
      const payload = ticket.getPayload();
      const userid = payload['sub'];
      //Guardar esta info del payload en Mongo. 
      // If request specified a G Suite domain:
      // const domain = payload['hd'];
      // Cookies that have not been signed

      // Cookies that have been signed
      return payload
    }
    let google_user = await verify().catch(console.error);
    // Guardar la info del user en Mongo
    res.cookie("google_name", google_user.name)
    res.cookie("google_user_id", google_user.sub)

    console.log(google_user)


    res.render("menus/instrucciones", {id_conexion:req.cookies.tn_id,title:"Instrucciones"});


  },
  google: async (req,res) => {

    // Access scopes for read-only Drive activity.
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/script.container.ui',
      'https://www.googleapis.com/auth/script.external_request'

    ];

    // Generate a url that asks permissions for the Drive activity scope
    const authorizationUrl = oauth2Client.generateAuthUrl({
      // 'online' (default) or 'offline' (gets refresh_token)
      access_type: 'offline',
      /** Pass in the scopes array defined above.
        * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
      scope: scopes,
      // Enable incremental authorization. Recommended as a best practice.
      include_granted_scopes: true
    });
    console.log(authorizationUrl)
    res.send(authorizationUrl)

  },
  authenticate: async (req,res) => {
    let object = {}
    let q = url.parse(req.url, true).query;
    let { tokens } = await oauth2Client.getToken(q.code);
    oauth2Client.setCredentials(tokens);
    object.tokens = tokens
    res.send(object)

    //deberia aca guardar todo en la DB de Mongo. 

    // Example of using Google Drive API to list filenames in user's Drive.
    //const drive = google.drive('v3');

    /*
    async function createFolder() {
      // Get credentials and build service
      // TODO (developer) - Use appropriate auth mechanism for your app
      const fileMetadata = {
        name: 'Sheets Central from JS',
        mimeType: 'application/vnd.google-apps.folder',
      };
      try {
        const file = await drive.files.create({
          resource: fileMetadata,
          fields: 'id',
        });
        console.log('Folder Id:', file.data.id);
        return file.data.id;
      } catch (err) {
        // TODO(developer) - Handle error
        throw err;
      }
    }
    let folder_created = await createFolder()
    console.log("folder_created")
    console.log(folder_created)
    console.log("folder_created")



    drive.files.list({
      auth: oauth2Client,
      pageSize: 10,
      fields: 'nextPageToken, files(id, name)',
    }, (err1, res1) => {
      if (err1) return console.log('The API returned an error: ' + err1);
      const files = res1.data.files;
      object.files = files
      if (files.length) {
        console.log('Files:');
        files.map((file) => {
          console.log(`${file.name} (${file.id})`);
        });
      } else {
        console.log('No files found.');
      }
    });
    */
  },
  getStore: async (req,res) => {
    const data = await mainService.findByStore(req.query.store_id);
    console.log(data)
    res.json(data)
  }
};

module.exports = mainController;