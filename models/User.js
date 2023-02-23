const {model, Schema} = require('mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        default: 'user'
    },
    createdRecipes: Array(String),
    token: {
        type: String,
        required: true
    }
}, {timestamps: true});


module.exports = model('User', userSchema);