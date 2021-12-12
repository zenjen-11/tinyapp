const assert = require('chai').assert;

const { userByEmail, urlsUser } = require('../helpers');

// userByEmail Test
const testUsers = {
  'abc': {
    id: 'abc',
    email: 'jen@example.com',
    password: 'chocolate'
  },
  'xyz': {
    id: 'xyz',
    email: 'milo@example.com',
    password: 'jelly-beans'
  }
};

describe('#userByEmail', () => {
  it('should return a user with a valid email', () => {
    const user = userByEmail('milo@example.com', testUsers);
    assert.equal(user, testUsers.xyz);
  });

  it('should return undefined when looking for a non-existent email', () => {
    const user = userByEmail('ghostperson@example.com', testUsers);
    assert.equal(user, undefined);
  });
});

// urlUser Test
const testUrls = {
  'abcd': {
    longURL: 'http://www.google.com',
    userID: 'jen'
  },
  'xywz': {
    longURL: 'http://www.yahoo.com',
    userID: 'milo'
  },
  'jfkd': {
    longURL: 'http://www.facebook.com',
    userID: 'jen'
  }
};

describe('#urlUser', () => {
  it('should return the corresponding urls for a valid user', () => {
    const userUrls = urlsForUser('jen', testUrls);
    const expectedResult = {
      'abcd': {
        longURL: 'http://www.google.com',
        userID: 'jen'
      },
      'jfkd': {
        longURL: 'http://www.facebook.com',
        userID: 'jen'
      }
    };

    assert.deepEqual(userUrls, expectedResult);
  });

  it('should return an empty object for a non-existent user', () => {
    const userUrls = urlsForUser('crystal', testUrls);
    assert.deepEqual(userUrls, {});
  });
});
