// ***** Global requires *****
const path = require("path");
const fs = require("fs");

const User = require('../models/users');



const mainService = {
  viajes() {
    return {
      "viajes": "viajes"
    };
  },
  equipamiento() {
      return {
        "equipamiento": "equipamiento"
      };
  },
  findByStore(store_id){
    let return_object = {
    }
    let values = User.find({store_id: store_id},(error,data) => {
      if(error){
        console.log(error)
        return_object += {
          status: 400
        }
      } else {
        console.log(data[0]['_id'].toString())
        return_object += {
          status: 200,
          id: data[0]['_id'].toString()
        }
      }
    })
    return return_object

  }
};

module.exports = mainService;