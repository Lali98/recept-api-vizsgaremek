const {model, Schema} = require('mongoose');

const recipeSchema = new Schema({
    name: String,
    description: String,
    steps: Array(String),
    like: Number,
    save: Number,
    comments: Array(Object),
    createdUserId: String,
    categories: Array(String),
    isEnable: Boolean
}, {timestamps: true});

module.exports = model('recipe', recipeSchema);