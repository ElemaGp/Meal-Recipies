const User = require('../models/User');
const jwt = require('jsonwebtoken')

//handle errors
const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { email: '', password: '' }; // when there's an error, this "error" variable's value for email or password is updated and sent to the user. 

    //incorrect email
    if (err.message === 'incorrect email') {
        errors.email = 'that email is not registered'; //message for incorrect email
    } 
   
    //incorrect password
    if (err.message === 'incorrect password') {
        errors.password = 'that password is incorrect'; //message for incorrect password
    } 

    //duplicate error code (when the email is not unique)
    if (err.code === 11000) { //"11000" is the error code for this type of duplicate error
      errors.email = "that email is already registered";
      return errors;
    }

    //validation errors
    if (err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message; //updates the email or password that has error with the corresponding error message.
        });
    }

    return errors;
}


const maxAge = 3 * 24 * 60 * 60; //this is 3days (in seconds)
const createToken = (id) => { //creating the function for the json web token. npm install jsonwebtoken. Json web token acts like a sort of api, sending user data between browser and server and useful for authentication. Eg If the input login data it sends from the user on the browser to the server matches what the server sees in the database, the user is logged in.
  return jwt.sign({ id }, 'net ninja secret', { //the first argument is the payload which we used the Id for. The secons is the "Secret" which we used net ninja secret for.
    expiresIn: maxAge  //this is how long the jwt will be valid in the browser (eg if a user logs in, after 3 days, they'll automatically be logged out and have to sign in again).
});
}

module.exports.signup_get = (req, res) => {
    res.render('signup'); //render the "signup" page
}

module.exports.login_get = (req, res) => {
    res.render('login');  //render the "login" page
}

module.exports.signup_post = async (req, res) => {
    const { email, password } = req.body //whenever a user makes a post request to sign up, this grabs the email and password he input (you added email and password in the schema), and uses it for authentication. "req.body" here refers to the body which is the stuff the user input.
    
    try {
      const user = await User.create({email, password}); //creating a new user. The "User" there is the user model which interacts with the database.
      const token = createToken(user._id); //creating a jwt for the user trying to sign up
      res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 }) //Sending the cookie to the frontend. Named the cookie 'jwt', set the cookie's value as the token (jwt), set httponly to true meaning nobody can access the cookie from frontend. Then set the cookie's max age to expire in 3 days, just like the jwt.
      res.status(201).json({user: user._id}); //Sending the status and userid to the frontend.
    }
    catch (err) {
        const errors = handleErrors(err); //calling the handle error function above
        res.status(400).json({ errors });
    }
}

module.exports.login_post = async (req, res) => {
    const { email, password } = req.body //whenever a user makes a post request to log in, this grabs the email and password he input, and uses it for authentication. "req.body" here refers to the body which is the stuff the user input. Note that the function that takes care of how the code cross-checks the email and password to see if it matches any in the database is in the User model folder.
    
    try {
      const user = await User.login(email, password); //if the email and password match, this uses the login fuction you created in the User model, to log him in
      const token = createToken(user._id); //creating a jwt for the user trying to log in
      res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 }) //Sending the cookie to the frontend. Named the cookie 'jwt', set the cookie's value as the token (jwt), set httponly to true meaning nobody can access the cookie from frontend. Then set the cookie's max age to expire in 3 days, just like the jwt.
      res.status(200).json({ user: user._id })
    }
    catch (err) {   //catches the error thrown from User.js
        const errors = handleErrors(err);
        res.status(400).json({errors}); 

    }
}

//for logging out
module.exports.logout_get = (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 }); //Deleting the jwt cookie. Once you click on this route, you'replacing the value of the jwt cookie with an empty string. Then giving it a maxAge of 1 milisecond. You've basically deleted it.
  res.redirect('/'); //redirects them to the homepage
}

