// ***** Global requires *****
const path = require("path");
const fs = require("fs");


//AIRTABLE VALUES
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const AIRTABLE_TEST_USERS = process.env.AIRTABLE_TEST_USERS
const AIRTABLE_ACCESS_TOKEN = process.env.AIRTABLE_ACCESS_TOKEN
const AIRTABLE_SUBSCRIPTIONS = process.env.AIRTABLE_SUBSCRIPTIONS
const AIRTABLE_PAYMENTS = process.env.AIRTABLE_PAYMENTS

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

  //agregar aca todos los servicios asociados con los pagos:
  //changeUserPlan
  //getSubscriptionData
};

module.exports = paymentService;