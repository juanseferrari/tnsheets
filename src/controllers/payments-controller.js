// Requires
const path = require("path");
const fs = require("fs");
const fetch = require('node-fetch');
const url = require('url');

//Services
const mainService = require("../services/main-service");


const paymentsController = {
  paymentsTest: (req,res) => {
    console.log(req.body)
    res.json({
      "data": req.body
    });
  },
  checkSubscription: async (req,res) => {
    let connection_id = req.query.connection_id

    if(!connection_id) {
      res.json({
        "error": {
            "type": "CONNECTION_ID_NOT_FOUND",
            "message": "Please provide query parameter: connection_id"
        }
    })
    } else {
      try {
        let response = await mainService.validatePaymentSubscription(connection_id)
        res.json(response)
      } catch (error) {
        res.json(error)
      }
    }
  },
  notificationController: async (req,res) => {

    if(req.body.type == "checkout.session.completed") {
      // notification on checkout session
      // agregar subscripcion en airtable

      var fields_to_db = {
        "subscription_id": req.body.data.object.subscription,
        "customer_id": req.body.data.object.customer,
        "customer_name": req.body.data.object.customer_details.name,
        "customer_email": req.body.data.object.customer_details.email,
        "client_reference_id": req.body.data.object.client_reference_id,
        "date_created": req.body.data.object.created.toString(),
       // "subscription_status": req.body.data.object.status, --> esto lo sacamos de la subscription
        "payment_link": req.body.data.object.payment_link,
        "internal_product": "tienda_nube_1",
        "test_mode": "true"
      }
      try {
        let response = await mainService.createAirtableUpsert(true,["subscription_id"],fields_to_db,"subscriptions")
        res.json(response)
      } catch (error) {
        res.json(error)
      }


    } else if(req.body.type == "customer.subscription.updated" ) {
      
      var fields_to_db = {
      "subscription_status": req.body.data.object.status,
      "subscription_id": req.body.data.object.id,
      }
      try {
        let response = await mainService.createAirtableUpsert(true,["subscription_id"],fields_to_db,"subscriptions")
        res.json(response)
      } catch (error) {
        res.json(error)
      }


    } else if (req.body.type == "customer.subscription.deleted"){

      var fields_to_db = {
        "subscription_status": req.body.data.object.status,
        "subscription_id": req.body.data.object.id,
        }
        try {
          let response = await mainService.createAirtableUpsert(true,["subscription_id"],fields_to_db,"subscriptions")
          res.json(response)
        } catch (error) {
          res.json(error)
        }

      //A FUTURO: enviar notificacion al usuario que no se cancelo el plan y eliminarle todo.
      
    } else {
      //notification not supported
      res.json({
        "erorr": "Notification not supported"
      })
    }
  },
  cancelSubscription: async (req,res) => {
    //function to cancel the Stripe subscription
  }

}
module.exports = paymentsController;