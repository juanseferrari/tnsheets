// ***** Global requires *****
const path = require("path");
const fs = require("fs");


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

const paymentService = {
  projectos() {
    return projects
  }
  //agregar aca todos los servicios asociados con los pagos:
  //validatePaymentSubscription
  //changeUserPlan
  //getSubscriptionData
};

module.exports = paymentService;