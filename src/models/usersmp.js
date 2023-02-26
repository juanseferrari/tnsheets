const mongoose = require('mongoose')

const usersMPSchema = mongoose.Schema({
    mp_access_token: {
        type: String,
        required: true
    },
    mp_user_id: {
        type: String,
        required: true 
    },
    mp_refresh_token: {
        type: String,
        required: true      
    },
    conection_date: {
        type: Date,
        required: true   
    },
    company_name: {
        type: String,
        required: false  
    }
})

module.exports = mongoose.model('mp_users', usersMPSchema)