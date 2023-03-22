const express = require('express');
const Category = require('../models/Categories');
const bodyParser = require('body-parser');

const routes = express.Router();

// Get categories
routes.get('/', async (req, res) => {
    const categories = await Category.find();
    res.send(categories).status(200);
});

// Create categories
routes.post('/', bodyParser.json(), async (req, res) => {
    const createCategory = {
        name: req.body.name
    }
    const result = await Category.create(createCategory);
    res.send(result).status(201);
})

module.exports = routes;
