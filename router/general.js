const express = require('express');

let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const jwt = require('jsonwebtoken');


const doesExist = (username) => {
  let usersWithSameName = users.filter(user => {
    return user.username === username;
  })

  if ( usersWithSameName  > 0) {
    return true;
  } else {
    return false;
  }
}


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if( username && password ) {
    if (!doesExist(username)) {
      users.push( { "username": username, "password": password });
      return res.status(200).json({ message: "User Successfully registered. Now you can login!" })
    } else {
      return res.status(404).json({ message: "User already exists!" })
    }
  }
});

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

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  new Promise((resolve, reject) => {
    resolve(books);
  })
  .then((booksList) => {
    res.status(200).json(booksList);
  })
  .catch((error) => {
    res.status(500).json({ error: 'Failed to retrieve the book list' });
  });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  return res.json(books[req.params.isbn]);
 });
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  new Promise((resolve, reject) => {
    const byAuthor = Object.values(books).filter(o => o.author === req.params.author);
    resolve(byAuthor);
  })
  .then((booksByAuthor) => {
    res.status(200).json({ booksByAuthor });
  })
  .catch((error) => {
    res.status(500).json({ error: 'Failed to retrieve books by the author' });
  });
});

public_users.post("/login", (req,res) => {
  if (authenticatedUser(req.body.username, req.body.password)) {
    let username = req.body.username;
    let accessToken = jwt.sign({
      data: req.body.password
    }, "access", { expiresIn: 60*60 } )

    req.session.authorization = { accessToken, username }
    return res.status(200).json({ message: "User Successfully logged in!" })
  } else {
    return res.status(208).json({message: "Username or password invalid!"});
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  
  const byTitle = Object.values(books).filter(o => o.title == req.params.title)

  return res.status(200).json({ booksByAuthor: byTitle });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  return res.json(books[req.params.isbn].reviews);
});

module.exports.general = public_users;
