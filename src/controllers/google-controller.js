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
const redirect_url = "https://www.sheetscentral.com/google-auth"


//Google OAUTH validation
//const {OAuth2Client} = require('google-auth-library');
//const client = new OAuth2Client(google_client_id);


const googleController = {
  googleLink: async (req,res)=> {
    var google_url = "https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?response_type=code&redirect_uri="+redirect_url+"&scope=email%20profile&client_id="+google_client_id
    //SOLUCIONAR ESTO A FUTURO.
    console.log(google_url)
    res.redirect(google_url)
  },
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
        //hacer analisis si el response es correcto.
        res.redirect("/");
      } catch (error) {
        //render info of error
        console.log(error)
        res.json(error)
      }
  }
};

module.exports = googleController;