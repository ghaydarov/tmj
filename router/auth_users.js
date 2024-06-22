const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{
  username: "user",
  password: "password"
}];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{
  let validUsers = users.filter((user) => {
    return (user.username === username && user.password === password);
  })

  if (validUsers.length > 0){
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  if (authenticatedUser(req.body.username, req.body.password)) {
    let username = req.body.username;
    let accessToken = jwt.sign({
      data: req.body.password
    }, "access", { expiresIn: 60*60 } )

    req.session.authorization = { accessToken, username }

    console.log(accessToken)
    return res.status(200).json({ message: "User Successfully logged in!" })
  } else {
    return res.status(208).json({message: "Username or password invalid!"});
  }
});
// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {

  const isbn = req.params.isbn
  let book = books[isbn]
  if(book) {
    book.reviews = req.query.review
    return res.status(200).json({ message: "Review for the book with ISBN " + isbn + " has been added/updated!" })
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {

  const isbn = req.params.isbn
  let book = books[isbn]
  if(book) {
    delete book.reviews
    return res.status(200).json({ message: "Review for the ISBN " + isbn + " posted by user: " + req.body.username +  " has been deleted!" })
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
