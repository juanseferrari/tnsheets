// Requires
const path = require("path");
const fs = require("fs");
const fetch = require('node-fetch');
const url = require('url');

//Services
const mainService = require("../services/main-service");
const paymentsService = require("../services/payment-service");
const { response } = require("express");


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
        let response = await paymentsService.validatePaymentSubscription(connection_id)
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


      //Check if payment link is ones of Drive to Tiendanube: test250, test1000, prod250, prod1000
      var DTPaymentLinks = ["plink_1Nw1TvAg6dy5e6eQA5Tf7y5e", "plink_1ONhYRAg6dy5e6eQfclNcahl", "plink_1ONhuqAg6dy5e6eQTNCUMuzo" , "plink_1ONhsLAg6dy5e6eQP6wqmMMP"];
      
      if(DTPaymentLinks.includes(req.body.data.object.payment_link)){
        console.log("is a DT payment")
        let credit_quantity = 0
        if(req.body.data.object.payment_link == "plink_1ONhYRAg6dy5e6eQfclNcahl" || req.body.data.object.payment_link == "plink_1ONhsLAg6dy5e6eQP6wqmMMP"){
          credit_quantity = 1000 
        } else {
          credit_quantity = 250 
        }
       
        fields_to_db = {
          "client_reference_id": req.body.data.object.client_reference_id,
          "customer_name": req.body.data.object.customer_details.name,
          "customer_email": req.body.data.object.customer_details.email,
          "mode": req.body.data.object.mode, //determina si es un payment o un subscription
          "date_created": new Date().toISOString(),
          "payment_link": req.body.data.object.payment_link,
          "payment_intent_id": req.body.data.object.payment_intent,
          "payment_status": req.body.data.object.payment_status,
          "redeemed": "false",
          credit_quantity,
          "internal_product": "DT-"+credit_quantity,
          "tag": { "id": "usrOsqwIYk4a2tZsg" },
          "test_mode": req.query.test_mode ? req.query.test_mode : "false"
        }
        try {
          let response = await mainService.createAirtableUpsert(true,["payment_intent_id"],fields_to_db,"payments")
          res.json(response)
        } catch (error) {
          res.json(error)
        }
      
      } else {

      
        let field_to_merge = []
        if(req.body.data.object.mode == "payment"){
          field_to_merge.push("payment_intent_id")
        } else if (req.body.data.object.mode == "subscription"){
          field_to_merge.push("subscription_id")
        }
        fields_to_db = {
          "subscription_id": req.body.data.object.subscription,
          "payment_intent_id": req.body.data.object.payment_intent,
          "customer_id": req.body.data.object.customer,
          "customer_name": req.body.data.object.customer_details.name,
          "customer_email": req.body.data.object.customer_details.email,
          "client_reference_id": req.body.data.object.client_reference_id,
          "mode": req.body.data.object.mode, //determina si es un payment o un subscription
          "date_created": new Date().toISOString(),
          "payment_link": req.body.data.object.payment_link,
          "tag": { "id": "usrOsqwIYk4a2tZsg" },
          "test_mode": req.query.test_mode ? req.query.test_mode : "false"
        }
        try {
          let response = await mainService.createAirtableUpsert(true,field_to_merge,fields_to_db,"subscriptions")
          res.json(response)
        } catch (error) {
          res.json(error)
        }

    }

    } else if(req.body.type == "customer.subscription.created" ) {

      var trial_end = new Date(req.body.data.object.trial_end * 1000);
      let coupon_code = ""
      if(req.body.data.object.discount){
        coupon_code =  req.body.data.object.discount.coupon.name
      }
 
      fields_to_db = {
      "subscription_status": req.body.data.object.status,
      "subscription_id": req.body.data.object.id,
      "trial_end_date": trial_end.toISOString(),
      coupon_code,
      "test_mode": req.query.test_mode ? req.query.test_mode : "false"
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
      "test_mode": req.query.test_mode ? req.query.test_mode : "false"

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
        "test_mode": req.query.test_mode ? req.query.test_mode : "false"
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
  redeemPayment: async (req,res) => {

    var connection_id = req.body.connection_id
    var redeem_user_email = req.body.redeem_user_email
    console.log("connection_id: "+ connection_id)

    let response_object = {}

    let payment_response = await paymentsService.getPaymentsByConnId(connection_id)
    //GET ALL PAYMENTS BY CONNECTION_ID
    console.log("payment_response")
    console.log(payment_response)
    console.log("payment_response")
    if(payment_response.error){
      response_object = {
        error: {
          type: 'NO_DATA_FOUND',
          message: 'No payment found for connection_id: ' + connection_id
        }
      }
    } else if (payment_response.id){
      //User has only payments to redeem:
      let fields_to_db = {
        "redeemed": "true",
        "redeemed_date": new Date().toISOString(),
        redeem_user_email
      }
      try {
        let response = await mainService.editAirtableDataById(payment_response.id, "payments", fields_to_db)
          response_object = {
            "connection_id": response.fields.client_reference_id,
            "redeemed": response.fields.redeemed,
            "redeemed_date": response.fields.redeemed_date,
            "credit_quantity": response.fields.credit_quantity
          }
      
        } catch (error) {
          response_object = response_object = {
            error: {
              type: 'ERROR_WHILE_REDEMPTION',
              message: 'There was an error while trying to save redemption.',
              error
            }
          }
        
        }

    } else if (payment_response.records.length > 0){
      const unredeemedRecords = payment_response.records.filter(record => record.fields.redeemed == "false");
      let credit_quantity = 0
      console.log("unredeemedRecords")
      console.log(unredeemedRecords)
      console.log("unredeemedRecords")
      if(unredeemedRecords.length === 0){
        response_object = {
          error: {
            type: 'NO_PAYMENTS_TO_REDEEM',
            message: 'All the payments of the user have been redeemed.'
          }
        }
      } else {


      for(let i = 0; i<unredeemedRecords.length; i++){
        console.log("unredeemedRecords");
        console.log(unredeemedRecords[i]);
        console.log("unredeemedRecords");

        //Edit Airtable data to make the redeemed.

        let fields_to_db = {
          "redeemed": "true",
          "redeemed_date": new Date().toISOString(),
          "redeem_user_email": redeem_user_email
        }
        try {
          let response = await mainService.editAirtableDataById(unredeemedRecords[i].id, "payments", fields_to_db)
          credit_quantity = credit_quantity + response.fields.credit_quantity
          console.log(credit_quantity)
        
          } catch (error) {
            response_object = response_object = {
              error: {
                type: 'ERROR_WHILE_REDEMPTION',
                message: 'There was an error while trying to save redemption.',
                error
              }
            }
          
          }
          
      }
      response_object = {
        "connection_id": connection_id,
        "redeemed": "true",
        "redeemed_date": new Date().toISOString(),
        credit_quantity
      }

    }


      
    } else {
      response_object = {
        error: {
          type: 'INTERNAL_ERROR',
          message: 'There was en error while obtaining the data'
        }
      }
    }



    res.json(response_object)

  },

  cancelSubscription: async (req,res) => {
    //function to cancel the Stripe subscription
    //delete notifications in sheets central and delete properties. 
  }

}
module.exports = paymentsController;