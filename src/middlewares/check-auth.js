
const path = require("path");


const mainService = require("../services/main-service");


const CONST1 = "1234"

const checkTN = async (req, res, next) => {
    console.log("in checkTN")

    let google_user = res.locals.google_user
    let connection_id_cookie = res.locals.connection_id
    let connection_id_param = req.params.connId

    //Aca el usuario tiene el connection_id en cookie, logueo y esta OK para mostrar el dashboard
    if(connection_id_cookie === connection_id_param){
      console.log("connection_id_cookie === connection_id_param")
      return next();
    }

    //Validar que el google_user tenga la connection
    if(google_user.google_user_id){
      let google_connections = await mainService.getConnectionsByGoogleUser(google_user.google_user_id)
      let google_conn_ids = []
      for (let i = 0; i < google_connections.records.length; i++) {
          google_conn_ids.push(google_connections.records[i].connection_id) 
      }
      if (google_conn_ids.includes(connection_id_param)) {
        return next()
      }
    }


    res.redirect('/');
  };
  
const checkDT = async (req, res, next) => {
  console.log("in checkDT")

  let google_user = res.locals.google_user
  let dt_connection_id_cookie = res.locals.dt_connection_id
  let dt_connection_id_param = req.params.connId

  //Aca el usuario tiene el connection_id en cookie, logueo y esta OK para mostrar el dashboard
  if(dt_connection_id_cookie === dt_connection_id_param){
    console.log("dt_connection_id_cookie === dt_connection_id_param")
    return next();
  }

  //Validar que el google_user tenga la connection
  if(google_user.google_user_id){
    let google_connections = await mainService.getConnectionsByGoogleUser(google_user.google_user_id)
    let google_conn_ids = []
    for (let i = 0; i < google_connections.records.length; i++) {
        google_conn_ids.push(google_connections.records[i].connection_id) 
    }
    if (google_conn_ids.includes(dt_connection_id_param)) {
      return next()
    }
  }

    res.redirect('/');
  };

  const checkSH = async (req, res, next) => {
    console.log("in checkSH")
  
    let google_user = res.locals.google_user
    let sh_connection_id_cookie = res.locals.sh_connection_id
    let sh_connection_id_param = req.params.connId
  
    //Aca el usuario tiene el connection_id en cookie, logueo y esta OK para mostrar el dashboard
    if(sh_connection_id_cookie === sh_connection_id_param){
      console.log("sh_connection_id_cookie === sh_connection_id_param")
      return next();
    }
  
    //Validar que el google_user tenga la connection
    if(google_user.google_user_id){
      let google_connections = await mainService.getConnectionsByGoogleUser(google_user.google_user_id)
      let google_conn_ids = []
      for (let i = 0; i < google_connections.records.length; i++) {
          google_conn_ids.push(google_connections.records[i].connection_id) 
      }
      if (google_conn_ids.includes(sh_connection_id_param)) {
        return next()
      }
    }
  
      res.redirect('/');
    };

    const checkMP = async (req, res, next) => {
      console.log("in checkMP")
    
      let google_user = res.locals.google_user
      let mp_connection_id_cookie = res.locals.mp_connection_id
      let mp_connection_id_param = req.params.connId
    
      //Aca el usuario tiene el connection_id en cookie, logueo y esta OK para mostrar el dashboard
      if(mp_connection_id_cookie === mp_connection_id_param){
        console.log("mp_connection_id_cookie === mp_connection_id_param")
        return next();
      }
    
      //Validar que el google_user tenga la connection
      if(google_user.google_user_id){
        let google_connections = await mainService.getConnectionsByGoogleUser(google_user.google_user_id)
        let google_conn_ids = []
        for (let i = 0; i < google_connections.records.length; i++) {
            google_conn_ids.push(google_connections.records[i].connection_id) 
        }
        if (google_conn_ids.includes(mp_connection_id_param)) {
          return next()
        }
      }
    
        res.redirect('/');
      };

module.exports = {
  checkTN: checkTN,
  checkDT: checkDT,
  checkSH: checkSH,
  checkMP: checkMP,

  CONST1: CONST1
};