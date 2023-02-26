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
    }
})

module.exports = mongoose.model('mp_users', usersMPSchema)