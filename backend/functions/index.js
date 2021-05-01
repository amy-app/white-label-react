const functions = require('firebase-functions');

const { createUser, createToken } = require('./amy');

exports.getAmyToken = functions.region('northamerica-northeast1').https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be authenticated to get the token');
  }
  const { user_id,  email } = context.auth.token;
  const { status } = await createUser(user_id, email);
  if (status !== 200 && status !== 403) {
    throw new functions.https.HttpsError('unknown', 'Could not create/find amy user');
  }

  const { token } = await createToken(user_id);

  return { token };
});