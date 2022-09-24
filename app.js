const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const { requireAuth, checkUser } = require('./middleware/authMiddleware');

const app = express();

// middleware
app.use(express.static('public'));
app.use(express.json()); //parses json data sent from post requests into javascript, so that we can then use get request to get that data
app.use(cookieParser()); //helps the browser parse and access the cookie response from the server. npm install cookie-parser.


// view engine
app.set('view engine', 'ejs');

// database connection
const dbURI = 'mongodb+srv://Gp:elema4@cluster0.4pw9z4h.mongodb.net/node-auth';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true }) //the curly brackets and its contents may cause problems if not removed.
  .then((result) => app.listen(4400))
  .catch((err) => console.log(err));

// routes (for the front-end routing. This is the app.js)
app.get('*', checkUser); //applying the checkUser middleware to every route
app.get('/', (req, res) => res.render('home'));
app.get('/smoothies', requireAuth, (req, res) => res.render('smoothies'));
app.use(authRoutes); //this sort of gives "authRoutes" permission to handle other routings. (authroutes then works with authController).


