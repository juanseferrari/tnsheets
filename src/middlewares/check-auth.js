
const path = require("path");


const mainService = require("../services/main-service");


const CONST1 = "1234"

const checkTN = async (req, res, next) => {
     let google_user = res.locals.google_user
    if(google_user.google_user_id){
      let connection_id = req.params.connId
      let user_connected = await mainService.searchUser(connection_id)
       if(!user_connected.error){
        req.user_connected = user_connected
        return next();
        }

    }


    res.redirect('/');
  };
  
const checkDT = async (req, res, next) => {
  let google_user = res.locals.google_user
  if(google_user.google_user_id){
    let dt_connection_id = req.params.connId
    let user_connected = await mainService.searchUser(dt_connection_id)
     if(!user_connected.error){
      req.user_connected = user_connected
      return next();
      }

  }

    res.redirect('/');
  };
module.exports = {
  checkTN: checkTN,
  checkDT: checkDT,
  CONST1: CONST1
};