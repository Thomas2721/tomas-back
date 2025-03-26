const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");
const sendVerificationEmail = require("../services/emailservice.js");


const router = express.Router();

router.post("/signup", async (request, response) => {
  try {
    const { username, password, email } = request.body;
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return response
        .status(400)
        .json({ message: "username or email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      const verificationToken = jwt.sign(
        { id: newUser._id },
        process.env.SECRET_KEY,
        { expiresIn: "1h" }
      );

      await sendVerificationEmail(newUser.email, verificationToken);

      response.status(201).json({
        message:
          "User registered. Please verify your email to activate your account.",
      });
    } else {
      return response.status(400).json({
        message: "Invalid user data",
      });
    }
  } catch (error) {
    response.status(500).send({ message: error.message });
  }
});

router.post("/signin", async (request, response) => {
  try {
    const { username, password } = request.body;
    const user = await User.findOne({ username });

    if (!user) {
      return response.status(401).json({ message: "user not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return response.status(401).json({ message: "invalid password" });
    }

    if (!user.isVerified) {
      return response.status(400).json({
        message: "Please verify your email before logging in.",
      });
    }

    const token = jwt.sign({ userId: user._id, islogged: true }, process.env.SECRET_KEY, {
      expiresIn: "5hr",
    });
    return response.status(200).json({ token, username: user.username });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

router.get("/verify-email", async (request, response) => {
  try {
    const { token } = request.query;

    if (!token) {
      return response.status(400).json({
        message: "Invalid or missing token.",
      });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const user = await User.findById(decoded.id);
    if (!user) {
      return response.status(400).json({
        message: "User not found.",
      });
    }

    if (user.isVerified) {
      return response.status(400).json({
        message: "Email is already verified.",
      });
    }

    user.isVerified = true;
    await user.save();

    response.status(200).json({
      message: "Email successfully verified. You can now log in.",
    });
  } catch (error) {
    console.error(error);
    console.log(error);
    response.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
