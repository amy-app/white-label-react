const functions = require('firebase-functions');
const fetch = require('node-fetch');

// Set in firebase using `firebase functions:config:set amy.x-api-key="****"`
const xApiKey = functions.config().amy['x-api-key'];

async function createUser(userId, email) {
  const response = await fetch('https://api.amy.app/users/create', {
    headers: {
      accept: 'application/json',
      'accept-language': 'en,en-US;q=0.9,de;q=0.8,pl;q=0.7',
      'cache-control': 'no-cache',
      'content-type': 'application/json',
      pragma: 'no-cache',
      'x-api-key': xApiKey,
    },
    referrerPolicy: 'no-referrer',
    body: JSON.stringify({
      language: 'en', userId, email, photoURL: 'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50',
    }),
    method: 'POST',
    mode: 'cors',
  });
  return response;
}

async function createToken(userId) {
  const response = await fetch(`https://api.amy.app/users/${userId}/accessToken`, {
    headers: {
      accept: 'application/json',
      'accept-language': 'en,en-US;q=0.9,de;q=0.8,pl;q=0.7',
      'cache-control': 'no-cache',
      'content-type': 'application/json',
      pragma: 'no-cache',
      'x-api-key': xApiKey,
    },
    referrerPolicy: 'no-referrer',
    body: null,
    method: 'POST',
    mode: 'cors',
  });
  return response.json();
}

exports.createUser = createUser;
exports.createToken = createToken;