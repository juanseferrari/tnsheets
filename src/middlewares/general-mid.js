const path = require("path");

const mainService = require("../services/main-service");


const commonVariablesMiddleware = async (req, res, next) => {
    
    let cookie_connections = []
    let amount_of_results = 0
    let navbar_data

    // Tiendanube
    let connection_id = ""
    if (req.cookies.connection_id) {
        connection_id = req.cookies.connection_id
        let user = await mainService.searchUser(connection_id)
        if(!user.error){
            cookie_connections.push({
                "id": user.connection_id,
                "connection": user.connection,
                "user_id": user.user_id,
                "user_name": user.user_name,
                "user_logo": user.user_logo,
                "user_url": user.user_url,
                "country": user.country
              })
              amount_of_results++
        }

    }

    // Drive to Tiendanube
    let dt_connection_id = ""
    if (req.cookies.dt_connection_id) {
        dt_connection_id = req.cookies.dt_connection_id
        let user = await mainService.searchUser(dt_connection_id)
        if(!user.error){
            cookie_connections.push({
                "id": user.connection_id,
                "connection": user.connection,
                "user_id": user.user_id,
                "user_name": user.user_name,
                "user_logo": user.user_logo,
                "user_url": user.user_url,
                "country": user.country
              })
              amount_of_results++
        }
    }

    // Shopify
    let sh_connection_id = ""
    if (req.cookies.sh_connection_id) {
        sh_connection_id = req.cookies.sh_connection_id
        let user = await mainService.searchUser(sh_connection_id)
        if(!user.error){
            cookie_connections.push({
                "id": user.connection_id,
                "connection": user.connection,
                "user_id": user.user_id,
                "user_name": user.user_name,
                "user_logo": user.user_logo,
                "user_url": user.user_url,
                "country": user.country
              })
              amount_of_results++
        }
    }  

    // Woocommerce
    let wo_connection_id = ""
    if (req.cookies.wo_connection_id) {
        wo_connection_id = req.cookies.wo_connection_id
        let user = await mainService.searchUser(wo_connection_id)
        if(!user.error){
            cookie_connections.push({
                "id": user.connection_id,
                "connection": user.connection,
                "user_id": user.user_id,
                "user_name": user.user_name,
                "user_logo": user.user_logo,
                "user_url": user.user_url,
                "country": user.country
              })
              amount_of_results++
        }
    }  

    // Mercado Pago
    let mp_connection_id = ""
    if (req.cookies.mp_connection_id) {
        mp_connection_id = req.cookies.mp_connection_id
        let user = await mainService.searchUser(mp_connection_id)
        if(!user.error){
            cookie_connections.push({
                "id": user.connection_id,
                "connection": user.connection,
                "user_id": user.user_id,
                "user_name": user.user_name,
                "user_logo": user.user_logo,
                "user_url": user.user_url,
                "country": user.country
              })
              amount_of_results++
        }
    
    }

    // Google User
    let google_user_id = ""
    if (req.cookies.google_user_id) {
        google_user_id = req.cookies.google_user_id
    }
    let google_user = await mainService.searchGoogleUser(google_user_id)
    let google_connections = await mainService.getConnectionsByGoogleUser(google_user_id)

    //GOOGLE CONNECTION TEMPLATE
    /**  
    response_object = {
        "amount_of_results": 1,
        "records": [{
          "id": connections_data.id,
          "connection": connections_data.connection,
          "user_id": connections_data.user_id,
          "user_name": connections_data.user_name,
          "user_logo": connections_data.user_logo,
          "user_url": connections_data.user_url,
          "country": connections_data.country
        }]
      }*/

    //NAVBAR DATA
    if(google_user_id !== ''){
        navbar_data = {
            "active": true,
            "name": google_user.name,
            "logo_url": google_user.user_picture_url
        }
    } else if (google_user_id == '' && cookie_connections.length >= 1 ){
        let user_connected = await mainService.searchUser(cookie_connections[0].id)
        let logo_url = user_connected.user_logo
        if(!logo_url){
            logo_url = 'https://www.sheetscentral.com/images/designs/favicon_1.jpg'
        }
        navbar_data = {
            "active": true,
            "name": user_connected.user_name,
            "logo_url": logo_url
        }
    } else {
        navbar_data = {
            "active": false,
            "name": "",
            "logo_url": ""
        }
    }


    let connections = {
      google_connections,
      "cookie_connections": {
        amount_of_results,
        records: cookie_connections
      }
    }


    //Lo que hay que hacer aca es entender que connection tiene el cliente configurado. 

    res.locals = {
        google_user,
        google_user_id,
        connection_id,
        dt_connection_id,
        mp_connection_id,
        sh_connection_id,
        wo_connection_id,
        navbar_data,
        connections
        // Add more variables as needed
    };
    next();
};
module.exports = commonVariablesMiddleware;