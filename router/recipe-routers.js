const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Recipe = require("../models/Recipe");
const { isValidObjectId } = require("mongoose");
const multer = require("multer");

const storage = multer.diskStorage({
  filename: (req, file, cb) =>{
    const filename = file.originalname;
    cb(null, filename);
  },
  destination: (req, file, cb) => {
    cb(null, '../images/recipes');
  }
})
const upload = multer({storage: storage});

const router = express.Router();

function validId(id) {
  if (isValidObjectId(id)) {
    return id;
  }
  return "";
}

// Create recipe
router.post("/create", upload.single('recipeImage'), bodyParser.json(), async (req, res) => {
  const createdRecipe = {
    name: req.body.name,
    description: req.body.description,
    steps: [req.body.steps],
    ingredients: [req.body.ingredients],
    like: 0,
    save: 0,
    createUserId: req.body.createUserId,
    categories: [],
    comments: [],
    isEnable: false,
    imageUrl: req.file
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
  const recipes = await Recipe.find({ name: { $regex: name }, $options: "i" });
  res.send(recipes).status(200);
});

// Update recipe by id
router.put("/:id", upload.single('recipeImage'), bodyParser.json(), async (req, res) => {
  const id = validId(req.params.id);
  if (id === "") {
    res.status(404).send({
      message: "Not valid id: " + req.params.id,
    });
    return;
  }

  const updateRecipe = {
    name: req.body.name,
    description: req.body.description,
    steps: [req.body.steps],
    ingredients: [req.body.ingredients],
    imageUrl: [req.file]
  }

  const recipe = await Recipe.findByIdAndUpdate(id, null, { new: true });
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

// Like recipe
router.put("/:id/like", async (req, res) => {
  const id = validId(req.params.id);
  if (id === "") {
    res.status(404).send({
      message: "Not valid id: " + req.params.id,
    });
    return;
  }
  const recipe = await Recipe.findByIdAndUpdate(
    id,
    { $inc: { like: 1 } },
    { new: true }
  );
  if (recipe === null) {
    res.status(404).send({
      message: "Not found recipe with id: " + req.params.id,
    });
    return;
  }
  res.send(recipe).status(200);
});

// Save recipe
router.put("/:id/save", async (req, res) => {
  const id = validId(req.params.id);
  if (id === "") {
    res.status(404).send({
      message: "Not valid id: " + req.params.id,
    });
    return;
  }
  const recipe = await Recipe.findByIdAndUpdate(
    id,
    { $inc: { save: 1 } },
    { new: true }
  );
  if (recipe === null) {
    res.status(404).send({
      message: "Not found recipe with id: " + req.params.id,
    });
    return;
  }
  res.send(recipe).status(200);
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
    { $set: { isEnable: true } },
    { new: true }
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
    { $set: { isEnable: false } },
    { new: true }
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
    { $push: { comments: newComment } },
    { new: true }
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

// Add category to recipe
router.put("/:id/category", bodyParser.json(), async (req, res) => {
  const id = validId(req.params.id);
  if (id === "") {
    res.status(404).send({
      message: "Not valid id: " + req.params.id,
    });
    return;
  }
  const recipe = await Recipe.findByIdAndUpdate(
    id,
    { $set: { categories: req.body.category } },
    { new: true }
  );
  if (recipe === null) {
    res.status(404).send({
      message: "Not found recipe with id: " + req.params.id,
    });
    return;
  }
  res.send(recipe).status(200);
});

module.exports = router;
