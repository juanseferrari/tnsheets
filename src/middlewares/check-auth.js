
const path = require("path");


const mainService = require("../services/main-service");



const checkAuth = async (req, res, next) => {
    let connection_id = req.params.connId
    let user_connected = await mainService.searchUser(connection_id)
    
    console.log("user_connected 1")
    console.log(user_connected)
    console.log("user_connected 1")

    if(!user_connected.error){
        req.user_connected = user_connected
        return next();
    }

    res.redirect('/');
  };
  
module.exports = checkAuth;