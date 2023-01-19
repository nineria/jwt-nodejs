const mongoose = require('mongoose');

const { MONGODB_URI } = process.env;

exports.connect = () => {
  // Connect to database
  mongoose
    .connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      //   useCreateIndex: true,
      //   useFindAndModify: false,
    })
    .then(console.log('Database connect successfully'))
    .catch((error) => {
      console.log('Error connecting to database');
      console.error(error);
      process.exit(1);
    });
};
