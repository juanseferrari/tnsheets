// ***** Global requires *****
const path = require("path");
const fs = require("fs");

const paymentService = require("../services/payment-service")


//AIRTABLE VALUES
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const AIRTABLE_TEST_USERS = process.env.AIRTABLE_TEST_USERS
const AIRTABLE_PROD_USERS = process.env.AIRTABLE_PROD_USERS
const AIRTABLE_ACCESS_TOKEN = process.env.AIRTABLE_ACCESS_TOKEN
const AIRTABLE_SUBSCRIPTIONS = process.env.AIRTABLE_SUBSCRIPTIONS
const AIRTABLE_PAYMENTS = process.env.AIRTABLE_PAYMENTS
const AIRTABLE_GOOGLE_USERS = process.env.AIRTABLE_GOOGLE_USERS

// ***** Database folder *****
const projectsFilePath = path.join(__dirname, "../db/projects.json");
const projects = JSON.parse(fs.readFileSync(projectsFilePath, "utf-8"));

const mainService = {
  projectos() {
    return projects
  },
  async searchUser(connection_id) {
    let response_object

    if (!connection_id) {
      response_object = {
        "connection_id": null,
        "nickname": null,
        "user_id": null,
        "user_name": null,
        "user_logo": null,
        "country": null,
        "user_url": null,
        "connection": null,
        "connection_date": null,
        "spreadsheet_id": null,
        "sheet_version": null,
        "webhook_url": null,
        "active": null,
        "subscription_status": null,
        "subscription_customer_email": null
      }
      return response_object
    }

    var get_request_options = {
      method: 'GET',
      headers: {
        "Authorization": "Bearer " + AIRTABLE_ACCESS_TOKEN,
        "Content-Type": "application/json"
      },
      redirect: 'follow'
    };
    //Get information about payment subscription
    const airtable_payment_status = await paymentService.validatePaymentSubscription(connection_id)


    if (airtable_payment_status.subscription_status) {
      var subscription_status = airtable_payment_status.subscription_status
      var customer_email = airtable_payment_status.subscription_customer_email
    } else {
      var subscription_status = "no subscription"
      var customer_email = "no email"
    }

    //Get information about Airtable user
    const airtable_user_response = await fetch("https://api.airtable.com/v0/" + AIRTABLE_BASE_ID + "/" + AIRTABLE_PROD_USERS + "/" + connection_id, get_request_options)
    if (airtable_user_response.status === 200) {
      let user_data = await airtable_user_response.json();

      //console.log("user_data")
      //console.log(user_data)
      //console.log("user_data")

      //Response of search user
      response_object = {
        "connection_id": user_data.id,
        "nickname": user_data.fields.nickname,
        "user_id": user_data.fields.user_id,
        "user_name": user_data.fields.user_name,
        "user_logo": user_data.fields.user_logo,
        "country": user_data.fields.country,
        "user_url": user_data.fields.user_url,
        "connection": user_data.fields.connection,
        "connection_date": user_data.fields.connection_date,
        "spreadsheet_id": user_data.fields.spreadsheet_id,
        "sheet_version": user_data.fields.sheet_version,
        "webhook_url": user_data.fields.webhook_url,
        "active": user_data.fields.active,
        "subscription_status": subscription_status,
        "subscription_customer_email": customer_email
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
  async searchGoogleUser(google_user_id) {
    let response_object = {
      "google_user_id": null,
      "email": null,
      "name": null,
      "given_name": null,
      "family_name": null,
      "user_picture_url": null,
      "message": "no google_user_id added"
    }

    if (!google_user_id) {
      return response_object
    }

    //Get information about Airtable user
    const google_user_data = await this.getAirtableData(AIRTABLE_GOOGLE_USERS, google_user_id, "google_user_id")

    if (google_user_data['error']) {
      response_object.message = "Error obtaining google_user. Message: " + google_user_data['error']['message']
      return response_object
    } else {
      //Response of search user
      response_object = {
        "google_user_id": google_user_id,
        "email": google_user_data.email,
        "name": google_user_data.name,
        "given_name": google_user_data.given_name,
        "family_name": google_user_data.family_name,
        "user_picture_url": google_user_data.user_picture_url,
        "message": "google_user found"
      }
      return response_object

    }
  },
  async validateUserExists(connection_id) {
    let response
    var get_request_options = {
      method: 'GET',
      headers: {
        "Authorization": "Bearer " + AIRTABLE_ACCESS_TOKEN,
        "Content-Type": "application/json"
      },
      redirect: 'follow'
    };
    const airtable_user_response = await fetch("https://api.airtable.com/v0/" + AIRTABLE_BASE_ID + "/" + AIRTABLE_PROD_USERS + "/" + connection_id, get_request_options)
    if (airtable_user_response.status === 200) {
      response = true
    } else {
      //user not found
      response = false
    }
    return response
  },
  async getAccountInfo(user_id, token, platform) {
    let response_object = {}
    let headers = {}
    let url = ""
    if (platform == "mp") {
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
        "logo_url": data['thumbnail']['picture_url']
      }

    } else if (platform == "tn") {
      // TIENDA NUBE
      headers = {
        "Content-Type": "application/json",
        "Authentication": token,
        "User-Agent": "Sheets Central"
      }
      url = "https://api.tiendanube.com/v1/" + user_id + "/store"

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
  async createAirtableUpsert(upsert, fields_to_merge_on, fields, table) {
    //funcion generica que hace upsert en airtable

    let return_object
    let data_to_airtable_db

    //validation of airtable table
    let airtable_table = ""
    if (table == "prod_users") {
      airtable_table = AIRTABLE_PROD_USERS
    } else if (table == "test_users") {
      airtable_table = AIRTABLE_TEST_USERS
    } else if (table == "subscriptions") {
      airtable_table = AIRTABLE_SUBSCRIPTIONS
    } else if (table == "google_users") {
      airtable_table = AIRTABLE_GOOGLE_USERS
    } else if (table == "payments") {
      airtable_table = AIRTABLE_PAYMENTS

    } else {
      return_object = {
        "error": "unsupported table"
      }
      return return_object
    }

    //validation if upsert true

    if (upsert) {
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

    //console.log("data_to_airtable_db")
    //console.log(data_to_airtable_db)
    //console.log("data_to_airtable_db")


    //console.log(JSON.stringify(data_to_airtable_db))
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
      //console.log("https://api.airtable.com/v0/"+ AIRTABLE_BASE_ID + "/" + airtable_table)
      const airtabe_response = await fetch("https://api.airtable.com/v0/" + AIRTABLE_BASE_ID + "/" + airtable_table, airtable_upsert)
      //console.log(airtabe_response)
      var data = await airtabe_response.json();
      //console.log("airtable data response")
      //console.log(data)
      //console.log("airtable data response")

      if (airtabe_response.status === 200) {
        // Process the data when the status code is 200
        response_object = {
          "status": "success",
          "response_status": airtabe_response.status,
          "id": data['records'][0]['id']
          //necesito mandar el id de cierta forma. 
        }
      } else {
        console.log(data)
        response_object = data
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
  async getAirtableData(table, id, filter) {
    let response_object
    var get_request_options = {
      method: 'GET',
      headers: {
        "Authorization": "Bearer " + AIRTABLE_ACCESS_TOKEN,
        "Content-Type": "application/json"
      },
      redirect: 'follow'
    };
    let airtable_response = await fetch("https://api.airtable.com/v0/" + AIRTABLE_BASE_ID + "/" + table + "?filterByFormula={" + filter + "}='" + id + "'", get_request_options)
    let user_response_data = await airtable_response.json();

    if (user_response_data.error) {
      response_object = user_response_data
    } else {
      if (user_response_data.records.length == 0) {
        //usuario existe pero no tiene suscripcion. Si esta en plan free, todo piola. Sino, rechazar conexion. 
        console.log("amount of records: 0")
        response_object = {
          "error": {
            "type": "NO_DATA_FOUND",
            "message": "No record found with that id on that table."
          }
        }
      } else if (user_response_data.records.length == 1) {
        //console.log("amount of records: 1")
        response_object = {
          "id": user_response_data.records[0]['id'],
          ...user_response_data.records[0]['fields']
        }
        //console.log("user_response_data.records[0]['fields']")
        //console.log(user_response_data.records[0]['fields'])
        //console.log("user_response_data.records[0]['fields']")

      } else {
        //console.log("amount of records: more")
        response_object = {
          "amount_of_results": user_response_data.records.length,
          "records": user_response_data.records
        }
      }

    }



    return response_object
  },
  async getAirtableDataById(connection_id, table) {
    console.log("getAirtableDataById")
    let response_object

    let airtable_table = ""
    if (table == "prod_users") {
      airtable_table = AIRTABLE_PROD_USERS
    } else if (table == "test_users") {
      airtable_table = AIRTABLE_TEST_USERS
    } else if (table == "subscriptions") {
      airtable_table = AIRTABLE_SUBSCRIPTIONS
    } else if (table == "google_users") {
      airtable_table = AIRTABLE_GOOGLE_USERS
    } else if (table == "payments") {
      airtable_table = AIRTABLE_PAYMENTS
    } else {
      response_object = {
        "error": "unsupported table"
      }
      return response_object
    }

    var get_request_options = {
      method: 'GET',
      headers: {
        "Authorization": "Bearer " + AIRTABLE_ACCESS_TOKEN,
        "Content-Type": "application/json"
      },
      redirect: 'follow'
    };
    let airtable_response = await fetch("https://api.airtable.com/v0/" + AIRTABLE_BASE_ID + "/" + airtable_table + "/" + connection_id, get_request_options)
    let user_response_data = await airtable_response.json();
    console.log("user_response_data")
    console.log(user_response_data)
    console.log("user_response_data")

    if (user_response_data.error) {
      //Error al obtener informacion del usuario
      response_object = {
        "error": {
          "type": "INVALID_CONNECTION_ID",
          "message": "No record found with that connection_id."
        }
      }
    } else {
      //console.log("amount of records: 1")
      response_object = user_response_data
      console.log("user_response_data")
      console.log(user_response_data)
      console.log("user_response_data")

    }
    return response_object
  },
  async editAirtableDataById(id, table, fields) {
    console.log("editAirtableDataById")
    let response_object

    let airtable_table = ""
    if (table == "prod_users") {
      airtable_table = AIRTABLE_PROD_USERS
    } else if (table == "test_users") {
      airtable_table = AIRTABLE_TEST_USERS
    } else if (table == "subscriptions") {
      airtable_table = AIRTABLE_SUBSCRIPTIONS
    } else if (table == "google_users") {
      airtable_table = AIRTABLE_GOOGLE_USERS
    } else if (table == "payments") {
      airtable_table = AIRTABLE_PAYMENTS
    } else {
      response_object = {
        "error": "unsupported table"
      }
      return response_object
    }

    var data_to_airtable = {
      "fields": fields
    }

    var patch_request_options = {
      method: 'PATCH',
      headers: {
        "Authorization": "Bearer " + AIRTABLE_ACCESS_TOKEN,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data_to_airtable),
      redirect: 'follow'
    };
    let airtable_response = await fetch("https://api.airtable.com/v0/" + AIRTABLE_BASE_ID + "/" + airtable_table + "/" + id, patch_request_options)
    let user_response_data = await airtable_response.json();

    if (user_response_data.error) {
      //Error al obtener informacion del usuario
      response_object = user_response_data
    } else {
      //console.log("amount of records: 1")
      response_object = user_response_data
    }
    return response_object
  },
  async getConnectionsByGoogleUser(google_user_id) {
    console.log("getConnectionsByGoogleUser")
    let response_object

    if (google_user_id === "" || !google_user_id || google_user_id === undefined || google_user_id === null) {
      response_object = {
        "error": {
          "type": "NO GOOGLE_USER PROVIDED",
          "message": "You need to add a google_user_id to return information"
        }
      }
    } else {
      let connections_data = await this.getAirtableData(AIRTABLE_PROD_USERS, google_user_id, "google_user_id")

      let records_to_response = []

      //TODO
      //Agregar informacion extra de las conexiones, por ejemplo: Nombre tienda (para multiusuario),
      if (connections_data.error) {
        response_object = {
          "amount_of_results": 0,
          "records": []
        }
      } else if (!connections_data.records) {
        response_object = {
          "amount_of_results": 1,
          "records": [{
            "id": connections_data.id,
            "connection": connections_data.connection
          }]
        }
      } else {

        for (let i = 0; i < connections_data.records.length; i++) {
          let record_object = {
            "id": connections_data.records[i].id,
            "connection": connections_data.records[i].fields.connection
          }
          records_to_response.push(record_object)

        }
        response_object = {
          "amount_of_results": connections_data.amount_of_results,
          "records": records_to_response
        }
      }



    }

    console.log("response_object")
    console.log(response_object)
    console.log("response_object")

    return response_object

  },
  async changeUserPlan(subscription_id, action) {
    let return_object = {}
    let subscription_data = await this.getAirtableData(AIRTABLE_SUBSCRIPTIONS, subscription_id, "subscription_id")
    let user_data = await this.searchUser(subscription_data['client_reference_id'])

    console.log("webhook_url")
    console.log(user_data['webhook_url'])
    console.log("webhook_url")


    let json_to_sc = {
      "action": action
    }
    console.log("json_to_sc")
    console.log(json_to_sc)
    console.log("json_to_sc")

    var sheetscentral_post = {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(json_to_sc),
      redirect: 'follow'
    }

    try {
      var sc_response = await fetch(user_data['webhook_url'], sheetscentral_post)
      let sc_response_json = await sc_response.json();

      console.log("sc_response")
      console.log(sc_response_json)
      console.log("sc_response")

      if (sc_response.status === 200) {
        // Process the data when the status code is 200
        return_object = {
          "status": "success",
          "response_status": sc_response.status
        }
      } else {
        console.log(sc_response)
        response_object = data
      }

    } catch (error) {
      return_object = {
        "error": {
          "type": "UNABLE_TO_CHANGE_USER_PLAN",
          "message": "It was not possible to change the user plan."
        }
      }

    }
    return return_object

  },
  async getSubscriptionData(subscription_id) {

  },
  getUserToken(connection_id) {
    //a futuro agregar un servicio que para cualquier plataforma te traiga el access token del usuario
    //este servicio tiene que manejar la gestion del refresh token tambien de alguna forma. 
  },
  refreshToken(connection_id) {
    //a futuro hacer una funcion para refreshear el access token. 
  },
  async hashValues(value1, value2, value3) {
    const encoder = new TextEncoder();
    const data = encoder.encode(value1 + value2 + value3);

    const buffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(buffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

    return hashHex;
  }
};

module.exports = mainService;