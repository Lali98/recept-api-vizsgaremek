const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Recipe = require("../models/Recipe");
const {isValidObjectId} = require("mongoose");
const multer = require("multer");

const DIR = './images/recipes';
const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        const fileName = file.originalname.toLowerCase().split(' ').join('-');
        cb(null,  + Date.now() + '-' + fileName);
    },
    destination: (req, file, cb) => {
        cb(null, DIR);
    }
})
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
});

const router = express.Router();

function validId(id) {
    if (isValidObjectId(id)) {
        return id;
    }
    return "";
}

// Create recipe
router.post("/create", upload.single('recipeImage'), bodyParser.json(), async (req, res) => {
    const url = req.protocol + "://" + req.get('host');
    const createdRecipe = {
        name: req.body.name,
        description: req.body.description,
        steps: [req.body.steps],
        ingredients: [req.body.ingredients],
        createUserId: req.body.createUserId,
        categories: [req.body.categories],
        comments: [],
        isEnable: false,
        imageUrl: req.file ? url + '/images/recipes/' + req.file.filename : ''
    };
    const result = await Recipe.create(createdRecipe);
    res
        .send({
            _id: result._id,
            ...result._doc,
        })
        .status(201);
});

// Get recipes
router.get("/", async (req, res) => {
    const recipes = await Recipe.find();
    res.send(recipes).status(200);
});

// Get recipe by id
router.get("/:id", async (req, res) => {
    const id = validId(req.params.id);
    if (id === "") {
        res.status(404).send({
            message: "Not valid id: " + req.params.id,
        });
        return;
    }
    const recipe = await Recipe.findById(id);
    if (recipe === null) {
        res.status(404).send({
            message: "Not found recipe with id: " + req.params.id,
        });
        return;
    }
    res.send(recipe).status(200);
});

// Get recipes by name
router.get("/search/:name", async (req, res) => {
    const name = req.params.name;
    const recipes = await Recipe.find({name: {$regex: name}, $options: "i"});
    res.send(recipes).status(200);
});

// Get recipes by category
router.get('/category/:category', async (req, res) => {
    const category = req.params.category;
    const recipes = await Recipe.find({categories: {$regex: category}});
    res.send(recipes).status(200);
})

// Update recipe by id
router.put("/:id", upload.single('recipeImage'), bodyParser.json(), async (req, res) => {
    const id = validId(req.params.id);
    if (id === "") {
        res.status(404).send({
            message: "Not valid id: " + req.params.id,
        });
        return;
    }

    const url = req.protocol + "://" + req.get('host');

    const rec = await Recipe.findById(id);
    if (rec === null) {
        res.status(404).send({
            message: "Not found recipe with id: " + req.params.id,
        });
        return;
    }

    const updateRecipe = {
        name: req.body.name,
        description: req.body.description,
        steps: req.body.steps,
        ingredients: req.body.ingredients,
        categories: req.body.categories,
        imageUrl: req.file ? url + '/images/recipes/' + req.file.fileName : rec.imageUrl
    }

    const recipe = await Recipe.findByIdAndUpdate(id, updateRecipe, {new: true});
    if (recipe === null) {
        res.status(404).send({
            message: "Not found recipe with id: " + req.params.id,
        });
        return;
    }
    res.send(recipe).status(200);
});

// Delete recipe by id
router.delete("/:id", async (req, res) => {
    const id = validId(req.params.id);
    if (id === "") {
        res.status(404).send({
            message: "Not valid id: " + req.params.id,
        });
        return;
    }
    const recipe = await Recipe.findByIdAndRemove(id);
    if (recipe === null) {
        res.status(404).send({
            message: "Not found recipe with id: " + req.params.id,
        });
        return;
    }
    res.send().status(204); // HTTP 204 No Content
});

// Enable recipe
router.put("/:id/enable", async (req, res) => {
    const id = validId(req.params.id);
    if (id === "") {
        res.status(404).send({
            message: "Not valid id: " + req.params.id,
        });
        return;
    }
    const recipe = await Recipe.findByIdAndUpdate(
        id,
        {$set: {isEnable: true}},
        {new: true}
    );
    if (recipe === null) {
        res.status(404).send({
            message: "Not found recipe with id: " + req.params.id,
        });
        return;
    }
    res.send(recipe).status(200);
});

// Disable recipe
router.put("/:id/disable", async (req, res) => {
    const id = validId(req.params.id);
    if (id === "") {
        res.status(404).send({
            message: "Not valid id: " + req.params.id,
        });
        return;
    }
    const recipe = await Recipe.findByIdAndUpdate(
        id,
        {$set: {isEnable: false}},
        {new: true}
    );
    if (recipe === null) {
        res.status(404).send({
            message: "Not found recipe with id: " + req.params.id,
        });
        return;
    }
    res.send(recipe).status(200);
});

// Create comment (add id to comment)
router.post("/:id/comment", bodyParser.json(), async (req, res) => {
    const id = validId(req.params.id);
    if (id === "") {
        res.status(404).send({
            message: "Not valid id: " + req.params.id,
        });
        return;
    }
    const newComment = {
        _id: mongoose.Types.ObjectId(),
        text: req.body.text,
        userId: req.body.userId,
        createDate: new Date(),
    };
    const recipe = await Recipe.findByIdAndUpdate(
        id,
        {$push: {comments: newComment}},
        {new: true}
    );
    if (recipe === null) {
        res.status(404).send({
            message: "Not found recipe with id: " + req.params.id,
        });
        return;
    }
    res.send(recipe).status(200);
});

// Delete comment by id
router.delete("/:id/comment/:commentId", async (req, res) => {
    const id = validId(req.params.id);
    if (id === "") {
        res.status(404).send({
            message: "Not valid id: " + req.params.id,
        });
        return;
    }
    const commentId = validId(req.params.commentId);
    if (commentId === "") {
        res.status(404).send({
            message: "Not valid comment id: " + req.params.commentId,
        });
    }

    const recipe = await Recipe.findById(id);
    if (recipe === null) {
        res.status(404).send({
            message: "Not found recipe with id: " + req.params.id,
        });
        return;
    }

    const commentIndex = recipe.comments.findIndex(
        (comment) => comment._id == commentId
    );
    if (commentIndex === -1) {
        res.status(404).send({
            message: "Not found comment with id: " + req.params.commentId,
        });
        return;
    }
    recipe.comments.splice(commentIndex, 1);
    const updateRecipe = await Recipe.findByIdAndUpdate(id, recipe, {
        new: true,
    });
    res.send(updateRecipe).status(200);
});

module.exports = router;
