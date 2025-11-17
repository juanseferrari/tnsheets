const path = require("path");
const url = require('url');

const mainService = require("../services/main-service");
const langService = require("../services/lang-service");
const linksService = require("../services/links-service");


const commonVariablesMiddleware = async (req, res, next) => {

    //GENERAL VARIABLES
    let amount_of_results = 0
    let navbar_data
    let connections = []
    let lang_object
    let links = linksService.links()

    //LANGUAGE VARIABLES
    if(req.cookies.sc_lang){
        console.log("sc_lang: " + req.cookies.sc_lang)
        lang_object = await langService.language(req.cookies.sc_lang)
    } else {
        lang_object = await langService.language("es")
    }

    // GOOGLE USER
    let google_user_id = ""
    if (req.cookies.google_user_id) {
        google_user_id = req.cookies.google_user_id
    }
    let google_user = await mainService.searchGoogleUser(google_user_id)






    // Google CONNECTIONS

    let google_connections = await mainService.getConnectionsByGoogleUser(google_user_id)

    let google_conn_ids = []


    for (let i = 0; i < google_connections.records.length; i++) {
        google_conn_ids.push(google_connections.records[i].connection_id)
        let record = google_connections.records[i];
        record.conn_method = "google";
        connections.push(record);

    }
    console.log("google_conn_ids")
    console.log(google_conn_ids)
    console.log("google_conn_ids")



    // Tiendanube
    let connection_id = ""
    if (req.cookies.connection_id) {
        connection_id = req.cookies.connection_id
        if (!google_conn_ids.includes(connection_id)) {
            console.log('Did not find connection_id in the array.');
            let user = await mainService.searchUser(connection_id)
            if (!user.error) {
                let record = user
                record.conn_method = "cookie";
                connections.push(record);
                amount_of_results++
            }
        } else {
            console.log('connection_id is in the array.');
        }


    }

    // Drive to Tiendanube
    let dt_connection_id = ""
    if (req.cookies.dt_connection_id) {
        dt_connection_id = req.cookies.dt_connection_id
        if (!google_conn_ids.includes(dt_connection_id)) {
            console.log('Did not find dt_connection_id in the array.');
            let user = await mainService.searchUser(dt_connection_id)
            if (!user.error) {
                let record = user
                record.conn_method = "cookie";
                connections.push(record);
                amount_of_results++
            }
        } else {
            console.log('dt_connection_id is in the array.');
        }
    }

    // Shopify
    let sh_connection_id = ""
    if (req.cookies.sh_connection_id) {
        sh_connection_id = req.cookies.sh_connection_id
        if (!google_conn_ids.includes(sh_connection_id)) {
            console.log('Did not find sh_connection_id in the array.');
            let user = await mainService.searchUser(sh_connection_id)
            if (!user.error) {
                let record = user
                record.conn_method = "cookie";
                connections.push(record);
                amount_of_results++
            }
        } else {
            console.log('sh_connection_id is in the array.');
        }
    }

    // Woocommerce
    let wo_connection_id = ""
    if (req.cookies.wo_connection_id) {
        wo_connection_id = req.cookies.wo_connection_id
        if (!google_conn_ids.includes(wo_connection_id)) {
            console.log('Did not find wo_connection_id in the array.');
            let user = await mainService.searchUser(wo_connection_id)
            if (!user.error) {
                let record = user
                record.conn_method = "cookie";
                connections.push(record);
                amount_of_results++
            }
        } else {
            console.log('wo_connection_id is in the array.');
        }
    }

    // Mercado Pago
    let mp_connection_id = ""
    if (req.cookies.mp_connection_id) {
        mp_connection_id = req.cookies.mp_connection_id
        if (!google_conn_ids.includes(mp_connection_id)) {
            console.log('Did not find mp_connection_id in the array.');
            let user = await mainService.searchUser(mp_connection_id)
            if (!user.error) {
                let record = user
                record.conn_method = "cookie";
                connections.push(record);
                amount_of_results++
            }
        } else {
            console.log('mp_connection_id is in the array.');
        }

    }


    //NAVBAR DATA
    if (google_user.google_user_id) {
        navbar_data = {
            "active": true,
            "name": google_user.name,
            "logo_url": google_user.user_picture_url
        }
    } else if (!google_user.google_user_id && connections.length >= 1) {
        let user_connected = await mainService.searchUser(connections[0].connection_id)
        let logo_url = user_connected.user_logo
        if (!logo_url) {
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


    //LINKS





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
        connections,
        lang_object,
        links
        // Add more variables as needed
    };
    next();
};
module.exports = commonVariablesMiddleware;