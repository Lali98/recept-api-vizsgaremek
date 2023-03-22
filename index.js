const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const recipesApi = require("./router/recipe-routers");
const usersApi = require("./router/user-routers");
const categoriesApi = require("./router/category-routers");

const app = express();
app.use(logger("dev"));

mongoose.connect("mongodb://127.0.0.1:27017/recipe-api", {useNewUrlParser: true})
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
