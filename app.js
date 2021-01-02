//Dependencies
const express = require('express');
const app = express();
const path = require('path');
const ejsLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const router = require('./routes/register');
require('dotenv').config();

//App config
app.set('view engine', 'ejs');
app.set('layout', path.join('layouts', 'main'));
app.use(ejsLayouts);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: false}));
app.locals.rmWhitespace = true;

app.get('/', (req, res)=> {
  res.redirect('/register');
})

//Route register
const registerRoute = require(path.join(__dirname, 'routes', 'register'));
app.use('/register', registerRoute);

//Mongoose config
const mongoConfig = { 
  useNewUrlParser: true, 
  useUnifiedTopology: true, 
  useCreateIndex: true, 
  autoIndex: true 
}

//Connect to MongoDB
mongoose.connect(process.env.DB_CONNECTION, mongoConfig, 
    (err) => {
      if (err) {
          console.log('Unable to connect to the database:', err.message);
      }
      else {
          console.log('Connected to the database successfully!');
      }
    }
);

//Server start
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log('Server is starting at port: ' + port);
});
