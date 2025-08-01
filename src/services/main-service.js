// ***** Global requires *****
const path = require("path");
const fs = require("fs");
const crypto = require('crypto');
const bodyParser = require('body-parser');

const paymentService = require("../services/payment-service")

const { shopifyApi, LATEST_API_VERSION } = require('@shopify/shopify-api');
const { default: shopifyApiNodeAdapter } = require('@shopify/shopify-api/adapters/node');

//SHOPIFY CREDENTIALS PROD
const sh_client_id = process.env.SH_CLIENT_ID
const sh_client_secret = process.env.SH_CLIENT_SECRET
const scopes = 'read_products,write_products,read_customers,read_orders,read_inventory,write_inventory'
const host = process.env.HOST || 'http://localhost:5001';


//AIRTABLE VALUES
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const AIRTABLE_TEST_USERS = process.env.AIRTABLE_TEST_USERS
const AIRTABLE_PROD_USERS = process.env.AIRTABLE_PROD_USERS
const AIRTABLE_ACCESS_TOKEN = process.env.AIRTABLE_ACCESS_TOKEN
const AIRTABLE_SUBSCRIPTIONS = process.env.AIRTABLE_SUBSCRIPTIONS
const AIRTABLE_PAYMENTS = process.env.AIRTABLE_PAYMENTS
const AIRTABLE_GOOGLE_USERS = process.env.AIRTABLE_GOOGLE_USERS
const AIRTABLE_LOGS = process.env.AIRTABLE_LOGS

const SHOPIFY_CLIENT_SECRET = process.env.SH_CLIENT_SECRET


const airtableConfig = {
  prod_users: AIRTABLE_PROD_USERS,
  test_users: AIRTABLE_TEST_USERS,
  subscriptions: AIRTABLE_SUBSCRIPTIONS,
  google_users: AIRTABLE_GOOGLE_USERS,
  payments: AIRTABLE_PAYMENTS,
  logs: AIRTABLE_LOGS,
  // Add new tables here as needed
};

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
        "user_email": null,
        "user_logo": null,
        "country": null,
        "user_url": null,
        "connection": null,
        "connection_date": null,
        "spreadsheet_id": null,
        "sheet_version": null,
        "webhook_url": null,
        "active": null,
        "plan": null,
        "subscription_status": null,
        "subscription_customer_email": null,
        "management_url": null
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

      //Response of search user
      response_object = {
        "connection_id": user_data.id,
        "nickname": user_data.fields.nickname,
        "user_id": user_data.fields.user_id,
        "user_name": user_data.fields.user_name,
        "user_email": user_data.fields.user_email,
        "user_logo": user_data.fields.user_logo,
        "country": user_data.fields.country,
        "user_url": user_data.fields.user_url,
        "connection": user_data.fields.connection,
        "connection_date": user_data.fields.connection_date,
        "spreadsheet_id": user_data.fields.spreadsheet_id,
        "sheet_version": user_data.fields.sheet_version,
        "webhook_url": user_data.fields.webhook_url,
        "active": user_data.fields.active,
        "plan": user_data.fields.plan,
        "subscription_status": subscription_status,
        "subscription_customer_email": customer_email,
        "management_url": airtable_payment_status.management_url
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
    const google_user_data = await this.getAirtableData("google_users", google_user_id, "google_user_id")

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

      let logo_url = ""
      if(data?.thumbnail?.picture_url){
        logo_url = data['thumbnail']['picture_url']
      }
      let phone = ""
      if(data?.phone?.number){
        phone = data['phone']['number']
      }

      response_object = {
        "company_name": data['first_name'] + " " + data['last_name'],
        "email": data['email'],
        "country": data['country_id'],
        "logo_url": logo_url,
        "nickname": data['nickname'],
        "phone": phone
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
    } else if (platform == "ml") {
      //MERCADO PAGO
      headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      }
      url = "https://api.mercadolibre.com/users/me"
      var requestOptions = {
        method: 'GET',
        headers: headers
      };

      let response = await fetch(url, requestOptions)
      let data = await response.json();

      let logo_url = ""
      if(data?.thumbnail?.picture_url){
        logo_url = data['thumbnail']['picture_url']
      }

      response_object = {
        "company_name": data['first_name'] + " " + data['last_name'],
        "email": data['email'],
        "country": data['country_id'],
        "logo_url": logo_url,
        "nickname": data['nickname']
      }

    }  else {
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
    let method = "PATCH"
    let airtable_table = airtableConfig[table];
    if (!airtable_table) {
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
      method = "POST"
      data_to_airtable_db = {
        "records": [
          {
            "fields": fields
          }
        ]
      } //end subs_data_to_airtable_db
    }

    //console.log("data_to_airtable_db")
    //console.log(JSON.stringify(data_to_airtable_db))
    //console.log("data_to_airtable_db")


    //console.log(JSON.stringify(data_to_airtable_db))
    var airtable_upsert = {
      method: method,
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
    let airtable_table = airtableConfig[table];

    var get_request_options = {
      method: 'GET',
      headers: {
        "Authorization": "Bearer " + AIRTABLE_ACCESS_TOKEN,
        "Content-Type": "application/json"
      },
      redirect: 'follow'
    };
    let airtable_response = await fetch("https://api.airtable.com/v0/" + AIRTABLE_BASE_ID + "/" + airtable_table + "?filterByFormula={" + filter + "}='" + id + "'", get_request_options)
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

    let airtable_table = airtableConfig[table];
    if (!airtable_table) {
      return_object = {
        "error": "unsupported table"
      }
      return return_object
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

    let airtable_table = airtableConfig[table];
    if (!airtable_table) {
      return_object = {
        "error": "unsupported table"
      }
      return return_object
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
    let response_object

    if (google_user_id === "" || !google_user_id || google_user_id === undefined || google_user_id === null) {
      response_object = {
        "amount_of_results": 0,
        "records": []
      }
    } else {
      let connections_data = await this.getAirtableData("prod_users", google_user_id, "google_user_id")
     
      let records_to_response = []

      //TODO
      //Agregar informacion extra de las conexiones, por ejemplo: Nombre tienda (para multiusuario),
      if (connections_data.error) {
        response_object = {
          "amount_of_results": 0,
          "records": []
        }
      } else if (!connections_data.records) {

        let user = await this.searchUser(connections_data.id)
        response_object = 
        {
          "amount_of_results": 1,
          "records": [user]
        }
      } else {

        for (let i = 0; i < connections_data.records.length; i++) {

          let user = await this.searchUser(connections_data.records[i].id)
          records_to_response.push(user)
        }
        response_object = {
          "amount_of_results": connections_data.amount_of_results,
          "records": records_to_response
        }
      }

    }


    return response_object

  },
  async changeUserPlan(subscription_id, action) {
    let return_object = {}
    let subscription_data = await this.getAirtableData("subscriptions", subscription_id, "subscription_id")
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
  async cloneAndShareSheet(access_token, user_id, user_name, connection_id, email, subfolderName) {
    console.log("cloneAndShareSheet")
    const script_url = "https://script.google.com/macros/s/AKfycbx4i-W3YK5kMrf0mcMehmC6J9bTohr2WTlFuH8OcBYfJWvwuCeTeFtV9r3PzkbylgpxrA/exec"
    let response_object

    let data_to_gas = {
      "access_token": access_token,
      "user_id": user_id.toString(),
      "user_name": user_name,
      "conn_id": connection_id,
      "email": email,
      "connection": subfolderName
    }

    var post_request_options = {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data_to_gas),
      redirect: 'follow'
    };
    let gas_response = await fetch(script_url, post_request_options)
    let sheet_response_data = await gas_response.json();

    if (sheet_response_data.error) {
      //Error al obtener informacion del usuario
      response_object = sheet_response_data
    } else {
      //console.log("amount of records: 1")
      response_object = sheet_response_data
    }
    return response_object
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
  },
  verifyWebhook(data, hmacHeader) {
    try {
      const calculatedHmac = crypto.createHmac('sha256', SHOPIFY_CLIENT_SECRET)
                                    .update(data)
                                    .digest('base64');

      console.log("calculatedHmac: " + calculatedHmac)
      return crypto.timingSafeEqual(Buffer.from(calculatedHmac), Buffer.from(hmacHeader));
   } catch (error) {
      console.error('Error verifying webhook:', error);
      return false; // Return false if an error occurs during verification
    }
  },
  async getPluggyApiKey(){
    var post_request_options = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId: "aae46a59-1e9e-4b95-95e9-c429ee7f8cb9",
        clientSecret: "4ebd5e10-1bc2-48f8-8ec6-08118071980d"
      }),
    }
    let pluggy_response = await fetch("https://api.pluggy.ai/auth", post_request_options)
    let user_response_data = await pluggy_response.json();
    return user_response_data.apiKey
  },
  shopify(){
    shopifyApi({
      apiKey: sh_client_id,
      apiSecretKey: sh_client_secret,
      scopes: scopes.split(','),
      hostName: host.replace(/https?:\/\//, ''),
      apiVersion: LATEST_API_VERSION,
      isEmbeddedApp: true, // Ensures the app is embedded
      adapter: shopifyApiNodeAdapter, // Add the Node.js adapter here

    });
  }
};

module.exports = mainService;