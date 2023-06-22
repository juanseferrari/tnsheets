//a futuro renombrar a tn-controller y tener un controller por app.

// Requires
const path = require("path");
const fs = require("fs");
const fetch = require('node-fetch');
const url = require('url');

//Services
const mainService = require("../services/main-service");

const google_client_id = process.env.GOOGLE_CLIENT_ID
const google_client_secret = process.env.GOOGLE_CLIENT_SECRET


//Google OAUTH validation
//const {OAuth2Client} = require('google-auth-library');
//const client = new OAuth2Client(google_client_id);
const {google} = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  google_client_id,
  google_client_secret,
  "http://localhost:5001/authenticate"
);


const googleController = {
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
  }
};

module.exports = googleController;