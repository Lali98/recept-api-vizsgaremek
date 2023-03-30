const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const recipesApi = require("./router/recipe-routers");
const usersApi = require("./router/user-routers");
const categoriesApi = require("./router/category-routers");
require('dotenv').config();

const app = express();
app.use(logger("dev"));
app.use(cors());

mongoose.connect(`mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@clusterdatabase.l9w4xco.mongodb.net/receptek?retryWrites=true&w=majority`, {useNewUrlParser: true})
    .then(() => {
        console.log("MongoDB Connection successful");
        app.listen(9000, () => {
            console.log("Listening on port 9000");
        });
    });

app.use("/api/recipes", recipesApi);
app.use("/api/users", usersApi);
app.use("/api/categories", categoriesApi);

app.get("/images/recipes/:filename", (req, res) => {
    res.sendFile(__dirname + '/images/recipes/' + req.params.filename);
})
