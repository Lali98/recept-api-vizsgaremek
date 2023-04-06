const {model, Schema} = require('mongoose');

const recipeSchema = new Schema({
    name: String,
    description: String,
    steps: Array(Object),
    ingredients: Array(Object),
    comments: Array(Object),
    createdUserId: String,
    categoriesId: String,
    isEnable: Boolean,
    imageUrl: String
}, {timestamps: true});

module.exports = model('recipe', recipeSchema);