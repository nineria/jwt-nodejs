const express = require('express');
const app = express();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userRoute = express.Router();
const User = require('../model/user');
const auth = require('../middleware/auth');

// Register
userRoute.route('/register').post(async (req, res) => {
  try {
    // Get user input
    const { username, password } = req.body;

    // Validate use input
    if (!(password && username)) {
      res.status(400).send('All input is required');
    }

    // Check if user already
    // Validate if user exist in out database
    const userExist = await User.findOne({ username });

    if (userExist) {
      return res.status(409).send('User already exist. Please login');
    }

    // Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password: encryptedPassword,
    });

    // create TOKEN
    const token = jwt.sign(
      {
        user_id: user._id,
      },
      process.env.TOKEN_KEY,
      {
        expiresIn: '2h',
      }
    );

    // save user TOKEN
    user.token = token;

    // return new user
    res.status(201).json(user);
  } catch (error) {
    console.error(error);
  }
});

// Login
userRoute.route('/login').post(async (req, res) => {
  try {
    // get user input
    const { username, password } = req.body;

    if (!(username && password)) {
      res.status(400).send('All input is required');
    }

    // Validate if user exist in database
    const user = await User.findOne({ username });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create TOKEN
      const token = jwt.sign(
        {
          user_id: user._id,
          username,
        },
        process.env.TOKEN_KEY,
        {
          expiresIn: '2h',
        }
      );

      // Save token
      user.token = token;

      res.status(200).json(user);
    }

    res.status(400).send('Invalid Credentials');
  } catch (error) {
    console.error(error);
  }
});

// Access token
userRoute.route('/auth').post(auth, (req, res) => {
  res.status(200).send('Welcome to server!');
});

module.exports = userRoute;
