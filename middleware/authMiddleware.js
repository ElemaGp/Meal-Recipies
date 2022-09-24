const jwt = require('jsonwebtoken');
const User = require('../models/User');

//In this file, we're writiing the function to check if the user has json web token, and if that is the case, we check to ensure it is autenticate. If it is, we give the user access to the page because it means he is logged in. If the authentication fails,  it means he is not logged in so we show him the log in page.

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;

    //check if json web token exists and is verified(authentic)
    if (token) { //"if token exists"
      jwt.verify(token, 'net ninja secret', (err, decodedToken) => {  //Verifying token here. "net ninja secret" is what i had set as the Secret. "err" is there in case the json web token found is not authentic(verified), then the user will be redirected to the log in page.
        if (err) {
            console.log(err.message);
            res.redirect('/login');  //if there's an error verifying the json web token, the user is redirected to the login page.
        } else {
            console.log(decodedToken);
            next(); //if the token exists and is successfully verified, the code moves to the 'next' thing which is to show the page you want to be rendered from the link the user clicked (the render function is usually in app.js).
        }

      })
    }
    else {
        res.redirect('/login'); //if token doesn't exist, redirect to login.
    }
}

//Check current user. The code below checks who the current user is each time he clicks on a link. This helps us do stuff like displaying the user's email at the top of every page he goes to on the website. 
const checkUser = (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
  jwt.verify(token, 'net ninja secret', async (err, decodedToken) => {  //Verifying token here. "net ninja secret" is what i had set as the Secret. "err" is there in case the json web token found is not authentic(verified).
    if (err) {
        console.log(err.message);
        res.locals.user = null;//if there's an error verifying the user's jwt token, he's not logged in so we set their user information to null since we dont have their email.
        next(); //if there's an error, it means the user is not logged in so we don't need to do anything here. He can keep viewing the unprotected pages since he's not logged in.
    } else {
        console.log(decodedToken);
        let user = await User.findById(decodedToken.id); //if the jwt is found, that means the user is logged in. This is how we grab that particular user.
        res.locals.user = user; //this makes that user's data eg email , to be accessible to the "views". So we can eg. output his email on the browser for which page he visits.
        next(); //if the token exists and is successfully verified, the code moves to the 'next' thing
    }
  })
}
else {
  res.locals.user = null;//if there's no jwt token, it means the user is not logged in so we set their user information to null since we dont have their email.
  next();
}
}



module.exports = { requireAuth, checkUser }; //Exporting this module. Next, we'll import this middleware inside the app.js, and put it in the route where you want to authenticate before a user can have access to view it.

//Note: to check if a user has "jwt" on browser, right click, go to "inspect" and go to "Application".
//This "requireAuth" function module we created is amazing. Any route i put it before it now on the app.js, that route will require authentication(that the user logs in to have their own jwt) before they can access it. Else they're taken to the login page.