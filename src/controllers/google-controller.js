//a futuro renombrar a tn-controller y tener un controller por app.

// Requires
const path = require("path");
const fs = require("fs");
const fetch = require('node-fetch');
const url = require('url');
const jwt_decode = require('jwt-decode');

 

//Services
const mainService = require("../services/main-service");

const google_client_id = process.env.GOOGLE_CLIENT_ID
const google_client_secret = process.env.GOOGLE_CLIENT_SECRET


//Google OAUTH validation
//const {OAuth2Client} = require('google-auth-library');
//const client = new OAuth2Client(google_client_id);
const {google} = require('googleapis');

//esto tampoco sirve
const oauth2Client = new google.auth.OAuth2(
  google_client_id,
  google_client_secret,
  "http://localhost:5001/authenticate"
);


const googleController = {
  googleoauth: async (req,res) => {
    //console.log(req.body)
    var google_object = jwt_decode(req.body.credential);
    console.log("google_object")
    console.log(google_object)
    console.log("google_object")
    var google_user_id = google_object.sub
    var email = google_object.email
    var name = google_object.name
    var given_name = google_object.given_name
    var family_name = google_object.family_name
    var user_picture_url = google_object.picture
    //Save google_id in cookie. If cookie exists, remove google login.
    res.cookie("google_user_id", google_user_id)


    //Save info of google user in DB
    var fields_to_db = {
      google_user_id,
      email,
      name,
      given_name,
      family_name,
      user_picture_url
    }
    try {
        let response = await mainService.createAirtableUpsert(true,["google_user_id"],fields_to_db,"google_users")
        res.redirect("/");
      } catch (error) {
        //render info of error
        console.log(error)
        res.json(error)
      }
  }
};

module.exports = googleController;