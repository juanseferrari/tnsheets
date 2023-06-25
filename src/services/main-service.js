// ***** Global requires *****
const path = require("path");
const fs = require("fs");

const User = require('../models/users');

//AIRTABLE VALUES
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const AIRTABLE_TEST_USERS = process.env.AIRTABLE_TEST_USERS
const AIRTABLE_PROD_USERS = process.env.AIRTABLE_PROD_USERS
const AIRTABLE_ACCESS_TOKEN = process.env.AIRTABLE_ACCESS_TOKEN
const AIRTABLE_SUBSCRIPTIONS = process.env.AIRTABLE_SUBSCRIPTIONS
const AIRTABLE_GOOGLE_USERS = process.env.AIRTABLE_GOOGLE_USERS

// ***** Database folder *****
const projectsFilePath = path.join(__dirname, "../db/projects.json");
const projects = JSON.parse(fs.readFileSync(projectsFilePath, "utf-8"));

const mainService = {
  projectos() {
    return projects
  },
  async searchUser(connection_id){
    let response_object

    var get_request_options = {
      method: 'GET',
      headers: {
        "Authorization": "Bearer " + AIRTABLE_ACCESS_TOKEN,
        "Content-Type": "application/json"
      },
      redirect: 'follow'
    };
    const airtable_user_response = await fetch("https://api.airtable.com/v0/"+ AIRTABLE_BASE_ID + "/" + AIRTABLE_PROD_USERS + "/"+connection_id, get_request_options)
    if (airtable_user_response.status === 200) {
    let user_data = await airtable_user_response.json();
    response_object = {
      "connection_id": user_data.id,
      "nickname": user_data.nickname,
      "user_id": user_data.user_id,
      "connection_date": user_data.connection_date,
      "active": user_data.active
    }

    } else {
      //user not found
      response_object = {
        "error": {
            "type": "CONNECTION_NOT_FOUND",
            "message": "connection_id not found"
        }
    }
    }



    return response_object
  },
  async validateUserExists(connection_id){
    let response
    var get_request_options = {
      method: 'GET',
      headers: {
        "Authorization": "Bearer " + AIRTABLE_ACCESS_TOKEN,
        "Content-Type": "application/json"
      },
      redirect: 'follow'
    };
    const airtable_user_response = await fetch("https://api.airtable.com/v0/"+ AIRTABLE_BASE_ID + "/" + AIRTABLE_PROD_USERS + "/"+connection_id, get_request_options)
    if (airtable_user_response.status === 200) {
      response =  true
    } else {
      //user not found
      response =  false
    }
    return response
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

  },
  async validatePaymentSubscription(connection_id) {
    //validar que el usuario esta pago OK
    //en el return devolver un objecto que sea el status de la suscripcion
    let response_object


    //validar si el usuario existe
    let user_exists = await this.validateUserExists(connection_id)
    if(user_exists) {
      var get_request_options = {
        method: 'GET',
        headers: {
          "Authorization": "Bearer " + AIRTABLE_ACCESS_TOKEN,
          "Content-Type": "application/json"
        },
        redirect: 'follow'
      };
      let airtable_subs_response = await fetch("https://api.airtable.com/v0/"+ AIRTABLE_BASE_ID + "/" + AIRTABLE_SUBSCRIPTIONS + "?filterByFormula={client_reference_id}='"+connection_id+"'", get_request_options)
      let user_subs_data = await airtable_subs_response.json();
      console.log(user_subs_data)
      if(user_subs_data.records.length == 0) {
        //usuario existe pero no tiene suscripcion. Si esta en plan free, todo piola. Sino, rechazar conexion. 
        console.log("amount of records: 0")
        response_object = {
          "connection_id": connection_id,
          "subscription": false,
          "message": "Connection do not have any current subscription."
        }
      } else if (user_subs_data.records.length == 1) {
        console.log("amount of records: 1")
        response_object = {
          "connection_id": connection_id,
          "subscription": true,
          "subscription_status": user_subs_data.records[0].fields.subscription_status
        }
      } else {
        console.log("amount of records: more")
        response_object = {
          "error": {
              "type": "SUBSCRIPTION_ERROR",
              "message": "More than one subscription found."
          }
        }     
      }
    } else {
      response_object = {
        "error": {
            "type": "CONNECTION_ID_NOT_FOUND",
            "message": "connection_id was not found or incorrect."
        }
    }
    }


    
 

  return response_object
  },
  async createAirtableUpsert(upsert,fields_to_merge_on,fields,table) {
    //funcion generica que hace upsert en airtable

    let return_object
    let data_to_airtable_db

    //validation of airtable table
    let airtable_table = ""
    if(table == "prod_users") {
      airtable_table = AIRTABLE_PROD_USERS
    } else if (table == "test_users"){
      airtable_table = AIRTABLE_TEST_USERS
    } else if (table == "subscriptions"){
      airtable_table = AIRTABLE_SUBSCRIPTIONS
    } else if (table == "google_users"){
      airtable_table = AIRTABLE_GOOGLE_USERS
    } else {
      return_object = {
        "error": "unsupported table"
      }
      return return_object
    }

    //validation if upsert true

    if(upsert){
      data_to_airtable_db = {
        "performUpsert": {
          "fieldsToMergeOn": fields_to_merge_on
        },
        "records": [
          {
            "fields": fields
          }
        ]
      } //end subs_data_to_airtable_db
    } else {
      data_to_airtable_db = {
        "records": [
          {
            "fields": fields
          }
        ]
      } //end subs_data_to_airtable_db
    }



    console.log(JSON.stringify(data_to_airtable_db))
    var airtable_upsert = {
      method: 'PATCH',
      headers: {
        "Authorization": "Bearer " + AIRTABLE_ACCESS_TOKEN,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data_to_airtable_db),
      redirect: 'follow'
    }

    try {
      console.log("https://api.airtable.com/v0/"+ AIRTABLE_BASE_ID + "/" + airtable_table)
      const airtabe_response = await fetch("https://api.airtable.com/v0/"+ AIRTABLE_BASE_ID + "/" + airtable_table, airtable_upsert)
      console.log(airtabe_response)
      if (airtabe_response.status === 200) {
        // Process the data when the status code is 200
        var data = await airtabe_response.json();
        response_object = {
          "status": "success",
          "response_status":airtabe_response.status 
        }
      } else {
        response_object = {
          "error": "error while saving data",
          "response_status": airtabe_response.status
        }
      }
    } catch (error) {
      return_object = {
        "error_message": "unable to acces db",
        "error": error
      }
    }
    //en el return devolver un objecto que sea el status de la suscripcion
    return response_object;
  },
  getUserToken(connection_id){
    //a futuro agregar un servicio que para cualquier plataforma te traiga el access token del usuario
  }
};

module.exports = mainService;