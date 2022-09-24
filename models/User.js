const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Please enter an email"], //The first item in the square bracket says that "required" is "true". The second item in the square bracket is the error message that is sent if an email isn't entered, since it's required.
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email'] //This validates what the user puts as email to ensure it actually looks like an email (we used npm install validator for this. Then import(require) it. Then put "isEmail" in the square bracket). 
    },
    password: {
        type: String,
        required: [true, "Please enter a password"],
        minlength: [6, 'Minimum password length is 6 characters']
    },
})

// fire a function after doc(data) saved to db (Mongoose hook)
userSchema.post('save', function (doc, next) {  //the "post" doesn't refer to post request.  It refers to something happening after an event, just like postpaid meter. In this case, that function will fire after we save data to database
  console.log('new user was created & saved', doc);
  next();
}) ;

// fire a function before doc (data) saved to db (Mongoose hook)
userSchema.pre('save', async function (next) { //the "pre" refers to something happening after an even, just like prepaid meter. In this case, that function will fire before saving data to database
  const salt = await bcrypt.genSalt();       //for hashing passwords, i used bcrypt. npm install bcrypt. Then "required" it. Here, i created the "salt" which i'll use in the next line to put on the password and while hashing it.
  this.password = await bcrypt.hash(this.password, salt);              
  next();
});

// static method to login user
userSchema.statics.login = async function(email, password) { //creating user login funtion
  const user = await this.findOne({ email }); //checks the database if there's an email that matches the one input by the user
  if (user) {
    const auth = await bcrypt.compare(password, user.password); //bcrypt compares the password entered by user and the password in the database (hashed) to see if they match
    if (auth) {
      return user;  //if the password matches, this function 'returns' the user
    }
    throw Error('incorrect password');
  }
  throw Error('incorrect email');
}

const User = mongoose.model('user', userSchema); //"user" is the singular form of our Users database collection, userSchema is the name of our schema.

module.exports = User;