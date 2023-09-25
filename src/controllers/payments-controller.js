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

    //add more parameters on the GET request for security: Spreadsheet_id (hardcoded token from the spreadsheet), Email.  

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

    let fields_to_db = {}

    if(req.body.type == "checkout.session.completed") {
      // notification on checkout session
      // agregar subscripcion en airtable

      fields_to_db = {
        "subscription_id": req.body.data.object.subscription,
        "customer_id": req.body.data.object.customer,
        "customer_name": req.body.data.object.customer_details.name,
        "customer_email": req.body.data.object.customer_details.email,
        "client_reference_id": req.body.data.object.client_reference_id,
        "date_created": req.body.data.object.created.toString(),
        //"subscription_status": req.body.data.object.status,  -> Esto viene de subscription status
        "payment_link": req.body.data.object.payment_link,
        "internal_product": "tienda_nube_1",
        "tag": { "id": "usrvCuwmV2hTFySmZ" }
        //"test_mode": "true" //esto sacar una vez que lo pasemos a prod.
      }
      try {
        let response = await mainService.createAirtableUpsert(true,["subscription_id"],fields_to_db,"subscriptions")
        res.json(response)
      } catch (error) {
        res.json(error)
      }


    } else if(req.body.type == "customer.subscription.created" ) {
      
      fields_to_db = {
      "subscription_status": req.body.data.object.status,
      "subscription_id": req.body.data.object.id,
      }
      try {
        let response = await mainService.createAirtableUpsert(true,["subscription_id"],fields_to_db,"subscriptions")
        res.json(response)
      } catch (error) {
        res.json(error)
      }


    } else if(req.body.type == "customer.subscription.updated" ) {

      fields_to_db = {
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

      fields_to_db = {
        "subscription_status": req.body.data.object.status,
        "subscription_id": req.body.data.object.id,
        }
        try {
          let response = await mainService.createAirtableUpsert(true,["subscription_id"],fields_to_db,"subscriptions")
          if(response['response_status'] == 200){
            try {
              let user_downgrade = await mainService.changeUserPlan(req.body.data.object.id,"downgrade")
              console.log("user_downgrade")
              console.log(user_downgrade)
              console.log("user_downgrade")
            } catch (error) {
              console.log("error downgrading user")
              console.log(error)
              console.log("error downgrading user")

            }
          }
          //Downgrade user
 
          res.json(response)
        } catch (error) {
          res.json(error)
        }



    } else {
      //notification not supported
      //Change status code for 400
      res.json({
        "errorr": "Notification not supported"
      })
    }
  },
  cancelSubscription: async (req,res) => {
    //function to cancel the Stripe subscription
    //delete notifications in sheets central and delete properties. 
  }

}
module.exports = paymentsController;