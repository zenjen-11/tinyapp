const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({ name: "session", secret: "conejita" }));
app.set("view engine", "ejs");

///// Functions

const {
  userByEmail, generateRandomString, getCurrentUserID,} = require("./helpers");


  const urlsUser = function(id) {
    let userUrls = {};
  
    for (const shortURL in urlDatabase) {
      if (urlDatabase[shortURL].userID === id) {
        userUrls[shortURL] = urlDatabase[shortURL];
      }
    }
    return userUrls;
  };
  

//// Variables

const urlDatabase = {
  b6UTxQ: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "123",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "456",
  },
};

const tinyURLusers = {
  123: {
    id: "123",
    email: "Johndoe@hotmail.com",
    password: "password",
  },
};

////// ROUTING

// GET

app.get("/", (req, res) => {
  res.send("Welcome to TinyApp");
});

// GET url index page
app.get("/urls", (req, res) => {
  const userID = req.session["user_id"];
  const userUrls = urlsUser(userID);
  const templateVars = {
    urls: userUrls,
    user: tinyURLusers[userID],
    tinyURLusers,
  };
  res.render("urls_index", templateVars);
});

// GET url new page
app.get("/urls/new", (req, res) => {
  const userID = req.session["user_id"];
  const userUrls = urlsUser(userID, urlDatabase);
  if (req.session["user_id"]) {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL],
      userID: getCurrentUserID(req),
      user: tinyURLusers[userID],
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

//GET login page
app.get("/login", (req, res) => {
  const templateVars = { user: null, userID: getCurrentUserID(req) };
  res.render("urls_login", templateVars);
});

// GET url register page
app.get("/register", (req, res) => {
  const templateVars = { user: null, userID: getCurrentUserID(req) };
  res.render("urls_register", templateVars);
});

// GET shortened url page that directs to url_show page
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session["user_id"];
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    userID: getCurrentUserID(req),
    urls: urlDatabase,
    user: tinyURLusers[userID],
  };
  res.render("urls_show", templateVars);
});

// GET from short url to long urls
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL.longURL]) {
    res.redirect(longURL);
  } else {
    const errorMessage = "This short URL does not exist.";
    res
      .status(404)
      .render("urls_error", { user: users[req.session.user_id], errorMessage });
  }
});

app.get("/urls.json", (req, res) => {
  res.send(users);
});

///// POST
// POST urls post page
app.post("/urls", (req, res) => {
  const forShortURL = generateRandomString();

  if (req.session["user_id"]) {
    urlDatabase[forShortURL] = {
      longURL: req.body.longURL,
      userID: req.session["user_id"],
    };
    res.redirect(`/urls/${forShortURL}`); // Respond with 'Ok' (we will replace this)
  } else {
    res.redirect("/login");
  }
});

// POST login page
app.post("/login", (req, res) => {
  const email = req.body.email;
  const user = userByEmail(email, tinyURLusers);

  if (user) {
    if (bcrypt.compareSync(req.body.password, user.password)) {
      req.session.user_id = user.id;
      res.redirect("/urls");
    }
  } else {
    return res.status(403).send("User not found.");
  }
});
// POST logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// POST register page
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  const id = generateRandomString();

  if (!email || !password) {
    return res.status(403).send("Email and password cannot be blank.");
  }
  if (userByEmail(email)) {
    return res
      .status(400)
      .send("A user with that email exists. Use another email.");
  }
  const user = {
    email,
    password,
    id,
  };
  tinyURLusers[id] = user;
  req.session.user_id = id;
  res.redirect("/urls");
});

// POST longURL
// edits the longURL in the database
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session["user_id"] === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = req.body.updatedURL;
  }
  res.redirect(`/urls/${shortURL}`);
});

// POST delete url from database
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.user_id === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;

  if (
    req.session.userID &&
    req.session.userID === urlDatabase[shortURL].userID
  ) {
    urlDatabase[shortURL].longURL = req.body.updatedURL;
    res.redirect(`/urls`);
  } else {
    const errorMessage = "You are not authorized to do that.";
    res
      .status(401)
      .render("urls_error", { user: users[req.session.userID], errorMessage });
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});