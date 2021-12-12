// Store old users and new users function
const userByEmail = function(email, data) {
  console.log("Hello I am testing user by email", email, data);
  for (const userr in data) {
    if (data[userr].email === email) {
      return data[userr];
    }
  }
  return undefined;
};

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

// Checks if url belongs to user in database
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


const urlsUser = function(id) {
  let userUrls = {};

  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
};


const getCurrentUserID = function(req) {
  let userID = null;
  if (!req.session["user_id"]) {
    userID = null;
  } else {
    userID = req.session["user_id"];
  }
  return userID;
};


module.exports = {userByEmail, generateRandomString, getCurrentUserID};