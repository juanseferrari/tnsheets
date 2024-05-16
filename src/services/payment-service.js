// ***** Global requires *****
const path = require("path");
const fs = require("fs");


//AIRTABLE VALUES
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const AIRTABLE_TEST_USERS = process.env.AIRTABLE_TEST_USERS
const AIRTABLE_ACCESS_TOKEN = process.env.AIRTABLE_ACCESS_TOKEN
const AIRTABLE_SUBSCRIPTIONS = process.env.AIRTABLE_SUBSCRIPTIONS
const AIRTABLE_PAYMENTS = process.env.AIRTABLE_PAYMENTS


const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN
const TEST_MP_ACCESS_TOKEN = process.env.MP_TEST_AT

// ***** Database folder *****
const projectsFilePath = path.join(__dirname, "../db/projects.json");
const projects = JSON.parse(fs.readFileSync(projectsFilePath, "utf-8"));

const paymentService = {
  projectos() {
    return projects
  },
  async validatePaymentSubscription(connection_id) {
    const mainService = require("../services/main-service");

    //TODO cambiarlo todo esto, esta atado con alambres horrible

    //validar que el usuario esta pago OK
    //en el return devolver un objecto que sea el status de la suscripcion
    let response_object


    //validar si el usuario existe
    let user_exists = await mainService.validateUserExists(connection_id)
    if (user_exists) {
      var get_request_options = {
        method: 'GET',
        headers: {
          "Authorization": "Bearer " + AIRTABLE_ACCESS_TOKEN,
          "Content-Type": "application/json"
        },
        redirect: 'follow'
      };
      //TODO MIGRATE TO getAirtableData
      let airtable_subs_response = await fetch("https://api.airtable.com/v0/" + AIRTABLE_BASE_ID + "/" + AIRTABLE_SUBSCRIPTIONS + "?filterByFormula={client_reference_id}='" + connection_id + "'", get_request_options)
      let user_subs_data = await airtable_subs_response.json();
      //console.log(user_subs_data)
      if (user_subs_data.records.length == 0) {
        //usuario existe pero no tiene suscripcion. Si esta en plan free, todo piola. Sino, rechazar conexion. 
        // console.log("amount of records: 0")
        response_object = {
          "connection_id": connection_id,
          "subscription": false,
          "subscription_status": "no subscription",
          "subscription_customer_email": null,
          "management_url": null,
          "payment_status": false,
          "expiration_date": false,
          "message": "Connection do not have any current subscription or payment."
        }
      } else if (user_subs_data.records.length == 1) {
        //console.log("amount of records: 1")
        console.log(user_subs_data.records[0].fields)
        response_object = {
          "connection_id": connection_id,
          "subscription": true,
          "subscription_status": user_subs_data.records[0].fields.subscription_status,
          "subscription_customer_email": user_subs_data.records[0].fields.customer_email,
          "management_url": user_subs_data.records[0].fields.management_url,
          "payment_status": (user_subs_data.records[0].fields.payment_status) ? user_subs_data.records[0].fields.payment_status : false,
          "expiration_date": (user_subs_data.records[0].fields.expiration_date) ? user_subs_data.records[0].fields.expiration_date : false,
          "message": "subscription or payment found."
        }
        //Agregar algun log o cambio en airtable para saber que lo canjearon
      } else {
        //console.log("amount of records: more")
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
  async getPaymentsByConnId(connection_id) {
    const mainService = require("../services/main-service");

    try {
      const payments_data = await mainService.getAirtableData(AIRTABLE_PAYMENTS, connection_id, "client_reference_id")
      return payments_data
    } catch (error) {
      return error
    }

  },
  async unredeemedPayments(connection_id) {
    console.log(connection_id)
    const mainService = require("../services/main-service");

    let response_object
    let credit_quantity = 0
    try {
      const payments_data = await mainService.getAirtableData(AIRTABLE_PAYMENTS, connection_id, "client_reference_id")


      if (payments_data.id && payments_data.redeemed == "false") {
        response_object = {
          "to_redeem": true,
          "amount": payments_data.credit_quantity
        }
      } else if (payments_data.records) {
        const unredeemedRecords = payments_data.records.filter(record => record.fields.redeemed == "false");

        if (unredeemedRecords.length === 0) {
          response_object = {
            "to_redeem": false,
            "amount": 0
          }
        } else {
          for (let i = 0; i < unredeemedRecords.length; i++) {
            credit_quantity = credit_quantity + unredeemedRecords[i].fields.credit_quantity
          }
          response_object = {
            "to_redeem": true,
            "amount": credit_quantity
          }
        }

      } else {
        response_object = {
          "to_redeem": false,
          "amount": 0
        }
      }

      return response_object
    } catch (error) {
      return error
    }
  },
  async createSubscription(connection_id, user_email, country) {
    console.log({connection_id, user_email, country})
    let return_object
    if (country == "AR") {
      //ARGENTINA LLEVARLO A MP
      let subscription_object = {
        "auto_recurring": {
          "frequency": 1,
          "currency_id": "ARS",
          "transaction_amount": 7000.0,
          "frequency_type": "months",
          "free_trial": {
            "frequency": 10,
            "frequency_type": "days"
          }
        },
        "back_url": "https://www.sheetscentral.com/tiendanube/config",
        "external_reference": "tn-" + connection_id,
        "payer_email": user_email,
        "reason": "Sheets Central",
        "status": "pending"
      }

      console.log(JSON.stringify(subscription_object))

      var post_request_options = {
        method: 'POST',
        headers: {
          "Authorization": "Bearer " + MP_ACCESS_TOKEN,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(subscription_object),
        redirect: 'follow'
      };

      let subsription_response = await fetch("https://api.mercadopago.com/preapproval", post_request_options)
      if (subsription_response.status === 201) {
        let subsription_json = await subsription_response.json();

        return_object = {
          "url": subsription_json.init_point,
          "status": subsription_json.status
        }

      } else {
        console.log(await subsription_response.json())
        return_object = {
          "error": {
            "type": "UNABLE_TO_CREATE_SUBSCRIPTION_PLAN",
            "message": "There was an error while creating the subscription plan."
          }
        }
      }
    } else {
      //OTHER COUNTRIES
      let redirect_url = 'https://buy.stripe.com/3cscQkbqI8rRae4cMN?utm_source=tn_config&client_reference_id=' + connection_id
      return_object = {
        "url": redirect_url,
        "status": "pending"
      }
    }

    return return_object
  },
  async getMPSubcriptionData(preapproval_id) {

    let return_object

    var get_request_options = {
      method: 'GET',
      headers: {
        "Authorization": "Bearer " + MP_ACCESS_TOKEN,
        "Content-Type": "application/json"
      },
      redirect: 'follow'
    };
    //TODO MIGRATE TO getAirtableData
    let subscription_response = await fetch("https://api.mercadopago.com/preapproval/" + preapproval_id, get_request_options)
    if (subscription_response.status === 200) {
      let subscription_json = await subscription_response.json();

      return_object = subscription_json

    } else {
      return_object = {
        "error": {
          "type": "UNABLE_TO_RETURN_SUBSCRIPTION_DATA",
          "message": "We couldn't retrieve the information of MP Subscription.",
          "error": await subscription_response.json()
        }
      }
    }

    return return_object

  }

  //agregar aca todos los servicios asociados con los pagos:
  //changeUserPlan
  //getSubscriptionData
};

module.exports = paymentService;