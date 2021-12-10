const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser()); // bring in cookie-parser
app.set("view engine", "ejs");

///// Functions

// Generate random string function
const generateRandomString = function () {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";

  while (randomString.length < 6) {
    randomString += chars[Math.floor(Math.random() * chars.length)];
  }

  return randomString;
};

// Store old users and new users function
const userByEmail = function (email, data) {
  for (const userr in data) {
    if (data[userr].email === email) {
      return data[userr];
    }
  }
  return undefined;
};

// store urls for users
const urlsUser = function (id) {
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
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const tinyURLusers = {
  id: "123",
  email: "Johndoe@hotmail.com",
  password: "password",
};

////// ROUTING

// Root GET

app.get("/", (req, res) => {
  // if (req.session.userID) {
  res.redirect("/urls");
  // } else {
  //   res.redirect('/login');
  // }
});

// GET url index page
app.get("/urls", (req, res) => {
  const tinyURLusers = req.cookies["user_id"];
  console.log(tinyURLusers);
  const templateVars = { urls: urlDatabase, tinyURLusers: tinyURLusers };
  res.render("urls_index", templateVars);
});

// GET url new page
app.get("/urls/new", (req, res) => {
  console.log("blah");
  res.render("urls_new");
});ß

// GET url register page

app.get("/register", (req, res) => {
  const templateVars = { tinyURLusers: null };
  res.render("urls_register", templateVars);
});

// GET shortened url page that directs to url_show page
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(longURL);
  } else {
    const errorMessage = "This short URL does not exist.";
    res
      .status(404)
      .render("urls_error", { user: users[req.session.userID], errorMessage });
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});

///// POST
// POST urls post page
app.post("/urls", (req, res) => {
  const forShortURL = generateRandomString();
  urlDatabase[forShortURL] = req.body.longURL;
  const templateVars = { urls: urlDatabase };
  res.redirect(`/urls/${forShortURL}`); // Respond with 'Ok' (we will replace this)
});

// POST login page
app.post("/login", (req, res) => {
  console.log("req.body", req.body);
  const tinyURLusers = req.body.tinyURLusers;
  // happy path
  res.cookie("tinyURLusers", tinyURLusers);
  res.redirect("/urls");

  // res.send('you posted to login')
});
// POST register page
app.post("/register", (req, res) => {
  const tinyURLusers = req.body.tinyURLusers;
  if (!email || !password) {
    return res.status(400).send("email and password cannot be blank. ");
  }

  if (findUserByEmail(email)) {
    return res
      .status(400)
      .send("A user with that email exists. Use another email.");
  }

  const id = "abc"; // TODO: make a function to generate an id
  const user = {
    id,
    email,
    password,
  };
  users[id] = user;
  console.log(users);

  res.cookie("user_id", id);
  res.redirect("/urls");
});

// POST delete url

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;

  if (
    req.session.userID &&
    req.session.userID === urlDatabase[shortURL].userID
  ) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    const errorMessage = "You are not authorized to do that.";
    res
      .status(401)
      .render("urls_error", { user: users[req.session.userID], errorMessage });
  }
});

app.post("/urls/:shortURL/edit", (req, res) => {
  if (
    !checkOwner(
      currentUser(req.session.userId, userDatabase),
      req.params.shortURL,
      urlDatabase
    )
  ) {
    res.send("This id does not belong to you");
  } else {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
