require('dotenv').config();
require('./config/database').connect();

const express = require('express');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth');

const User = require('./model/user');

const app = express();

app.use(express.json());

// Register
app.post('/register', async (req, res) => {
  try {
    // Get user input
    const { first_name, last_name, email, password } = req.body;

    // Validate use input
    if (!(email && password && first_name && last_name)) {
      res.status(400).send('All input is required');
    }

    // Check if user already
    // Validate if user exist in out database
    const userExist = await User.findOne({ email });

    if (userExist) {
      return res.status(409).send('User already exist. Please login');
    }

    // Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      first_name,
      last_name,
      email: email.toLowerCase(),
      password: encryptedPassword,
    });

    // create TOKEN
    const token = jwt.sign(
      {
        user_id: user._id,
        email,
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
app.post('/login', async (req, res) => {
  try {
    // get user input
    const { email, password } = req.body;

    if (!(email && password)) {
      res.status(400).send('All input is required');
    }

    // Validate if user exist in database
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create TOKEN
      const token = jwt.sign(
        {
          user_id: user._id,
          email,
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

app.post('/welcome', auth, (req, res) => {
  res.status(200).send('Welcome to our server!');
});

module.exports = app;
