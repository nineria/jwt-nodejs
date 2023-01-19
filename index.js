require('dotenv').config();
require('./config/database').connect();
const express = require('express');

const auth = require('./middleware/auth');
const cors = require('cors');
const createError = require('http-errors');
const bodyParser = require('body-parser');

const userRoute = require('./routes/user.routes');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(cors());

// Static directory path
app.use(express.static(path.join(__dirname, 'dist/')));

// Base route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

// API Root
app.use('/api', userRoute);

// PORT
const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log('Listening on port http://localhost:' + port);
});

// 404 Handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  console.error(err.message);
  if (!err.statusCode) err.statusCode = 500;
  res.status(err.statusCode).send(err.message);
});

module.exports = app;
