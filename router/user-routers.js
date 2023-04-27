const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { isValidObjectId } = require("mongoose");
require("dotenv").config();
const multer = require('multer');

const upload = multer();

const router = express.Router();

function validId(id) {
  if (isValidObjectId(id)) {
    return id;
  }
  return "";
}

// Create a new user
router.post("/register", upload.none(), async (req, res) => {
  const oldUser = await User.findOne({ email: req.body.email });
  if (oldUser) {
    res.status(400).send({ message: "User already exists" });
    return;
  }
  let encryptedPassword = await bcrypt.hash(req.body.password, 10);
  const newUser = new User({
    username: req.body.username,
    email: req.body.email.toLowerCase(),
    password: encryptedPassword,
  });
  const token = jwt.sign({ user_id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
  newUser.token = token;
  const result = await newUser.save();
  res.status(201).send(result);
});

// Login a user
router.post("/login", upload.none(), async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    res.status(400).send({ message: "User does not exist" });
    return;
  }
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) {
    res.status(400).send({ message: "Invalid password" });
    return;
  }
  const token = jwt.sign({ user_id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
  user.token = token;
  const result = await user.save();
  res.status(200).send(result);
});

// Update a user
router.put("/update", upload.none(), async (req, res) => {
  const token = jwt.sign(
    { user_id: req.body.user_id },
    process.env.JWT_SECRET,
    {
      expiresIn: "24h",
    }
  );
  const result = await User.findOneAndUpdate(
    { email: req.body.email }, {
    username: req.body.username,
    email: req.body.email.toLowerCase(),
    role: req.body.role,
    token: token
  }, { new: true }
  );
  res.status(200).send(result);
});

// Delete a user
router.delete('/delete/:id', async (req, res) => {
  const id = validId(req.params.id);
  if (id === "") {
    res.status(404).send({ message: "Not valid id: " + req.params.id });
    return;
  }
  const result = await User.findByIdAndDelete(id);
  if (!result) {
    res.status(404).send({ message: 'User not found' });
    return;
  }
  res.status(204).send();
});

// Get user by id
router.get("/:id", async (req, res) => {
  const id = validId(req.params.id);
  if (id === "") {
    res.status(404).send({ message: "Not valid id: " + req.params.id });
    return;
  }
  const result = await User.findById(id);
  if (!result) {
    res.status(404).send({ message: 'User not found' });
    return;
  }
  res.status(200).send(result);
});

//Get all user
router.get('/', async (req, res) => {
  const result = await User.find();
  res.status(200).send(result);
})

module.exports = router;
