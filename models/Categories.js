const {model, Schema} = require('mongoose');

const categoriesSchema = new Schema({
    name: String
});

module.exports = model('category', categoriesSchema);