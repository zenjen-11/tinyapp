const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const bcrypt = require('bcryptjs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({name: 'session', secret: 'conejita'}));
app.set("view engine", "ejs");

///// Functions

// Generate random string function
const generateRandomString = function() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";

  while (randomString.length < 6) {
    randomString += chars[Math.floor(Math.random() * chars.length)];
  }

  return randomString;
};

// Store old users and new users function
const userByEmail = function(email, data) {
  console.log('Hello', email, data)
  for (const userr in data) {
    if (data[userr].email === email) {
      return data[userr];
    }
  }
  return undefined;
};

// store urls for users
const urlsUser = function(id) {
  let userUrls = {};

  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].user_id === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
};

const getCurrentUserID = function(req) {
  let userID = null
  if (!req.session['user_id']) {
    userID = null
  } else {
    userID = req.session['user_id']
  }
return userID
}

//// Variables

// const urlDatabase = {}

const urlDatabase = {
  b6UTxQ: {
     longURL: "http://www.lighthouselabs.ca",
     userID: "123"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "456"
  }
};

const tinyURLusers = {
  123: {
    id: "123",
    email: "Johndoe@hotmail.com",
    password: "password",
  },
};

////// ROUTING

// Root GET

app.get("/", (req, res) => {
  res.redirect("/urls");

});

// GET url index page
app.get("/urls", (req, res) => {
  const userID = req.session['user_id']
  const userUrls = urlsUser(userID);
  const templateVars = { urls: userUrls, user: tinyURLusers[userID], tinyURLusers };
  res.render("urls_index", templateVars);
});

// GET url new page
app.get("/urls/new", (req, res) => {
  const userID = req.session['user_id']
  const userUrls = urlsUser(userID, urlDatabase,);
if (req.session['user_id']) {
  let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL], userID: getCurrentUserID(req),
      user: null
    };
  res.render('urls_new', templateVars);
} else {
  res.redirect('/login');
}
});

//GET login page
app.get("/login", (req, res) => {
  const templateVars = { user: null, userID: getCurrentUserID(req)};
  // const userUrls = urlsUser(user_id, urlDatabase);
  res.render("urls_login", templateVars);
  res.redirect('/urls/new');
});

// GET url register page

app.get("/register", (req, res) => {
  const templateVars = { user: null, userID: getCurrentUserID(req)};
  res.render("urls_register", templateVars);
});

// GET shortened url page that directs to url_show page
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session['user_id']
  const userUrls = urlsUser(userID, urlDatabase);
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL], userID: getCurrentUserID(req),
    urls: urlDatabase, user: null
  };
  res.render("urls_show", templateVars);
});

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
  // urlDatabase[forShortURL] = req.body.longURL;

  if (req.session['user_id']) {
    urlDatabase[forShortURL] = {
      longURL: req.body.longURL,
      userID: req.session['user_id']
    };
    res.redirect(`/urls/${forShortURL}`); // Respond with 'Ok' (we will replace this)

    
  } else {
    res.redirect('/login');
  }
});

// POST login page
app.post("/login", (req, res) => {
  console.log("req.body", req.body);
  // const password = req.body.password;
  const email = req.body.email;
  const user = userByEmail(email, tinyURLusers);
  console.log('popcorn', user)

  if(user) {
    if (bcrypt.compareSync(req.body.password, user.password)) {
      req.session.user_id = user.id
      res.redirect("/urls");
    }

  } else {
    return res.status(403).send("User not found.")
  }

});
// logout 
app.post('/logout', (req, res) => {
  req.session = null
  res.redirect('/urls');
})

// POST register page
app.post("/register", (req, res) => {
  const email = req.body.email;
  // const password = req.body.password;
  const password = bcrypt.hashSync(req.body.password, 10);
  const id = generateRandomString()
  console.log(id, "This is id")

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
  console.log(tinyURLusers);
  req.session.user_id = id
  res.redirect("/urls");
});

// POST longURL
// LongURL in the database
app.post('/urls/:shortURL', (req, res) => {
  if (req.session['user_id'] === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = req.body.updatedURL;
  }
  res.redirect(`/urls/${shortURL}`);
});


// POST delete url
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;

  if (
    req.session.user_id &&
    req.session.user_id === urlDatabase[shortURL].user_id
  ) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    const errorMessage = "You are not authorized to do that.";
    res
      .status(401)
      .render("urls_error", { user: users[req.session.user_id], errorMessage });
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