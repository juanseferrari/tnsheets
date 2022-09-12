const mongoose = require('mongoose')

const usersSchema = mongoose.Schema({
    access_token: {
        type: String,
        required: true
    },
    store_id: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('users', usersSchema)