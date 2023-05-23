import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';
import pg from 'pg';

import {compose, removeAuthToken} from '../../common/apiMiddlewares.js';

const {Pool} = pg;
const {PG_SECRET_ARN} = process.env;

const secretClient = new SecretsManagerClient();
const secret = JSON.parse((await secretClient.send(
    new GetSecretValueCommand({SecretId: PG_SECRET_ARN})
)).SecretString);

const pool = new Pool({
  user: secret.username,
  password: secret.password,
});

/**
 * GET /api/profile handler.
 * @param {any} event The API request event
 * @param {any} response The response of the API request
 */
const describeProfile = async (event, response) => {
  console.log(JSON.stringify(event));
  const poolClient = await pool.connect();
  console.log('DB connected successfully');
  const cognitoUserName = event
      .requestContext
      ?.authorizer
      ?.claims
      ?.['cognito:username'];
  if (cognitoUserName == null) {
    response.statusCode = 500;
    console.log('Unable to locate cognito user name');
    return;
  }
  try {
    const res = await poolClient.query(`
      SELECT email, displayName FROM users WHERE cognitoUserName = $1::text
    `, [cognitoUserName]);
    console.log(res);
    response.statusCode = 200;
    const {email, displayname} = res.rows[0];
    response.body = JSON.stringify({
      email,
      displayName: displayname,
    });
  } catch (err) {
    console.log('Unable to describe profile', err);
    response.statusCode = 500;
  } finally {
    poolClient.release();
  }
};

const updateProfile = async (event, response) => {
  console.log(JSON.stringify(event));
  const poolClient = await pool.connect();
  console.log('DB connected successfully');
  const cognitoUserName = event
      .requestContext
      ?.authorizer
      ?.claims
      ?.['cognito:username'];
  if (cognitoUserName == null) {
    response.statusCode = 500;
    console.log('Unable to locate cognito user name');
    return;
  }
  const {displayName} = JSON.parse(event.body);
  if (displayName == null) {
    response.statusCode = 400;
    response.body = JSON.stringify({
      message: 'Missing required attribute in body: displayName',
    });
    return;
  }
  try {
    const res = await poolClient.query(`
      UPDATE users SET displayName=$1 WHERE cognitoUserName = $2::text
      RETURNING *
    `, [displayName, cognitoUserName]);
    console.log(res);
    response.statusCode = 200;
    const {email, displayname} = res.rows[0];
    response.body = JSON.stringify({
      email,
      displayName: displayname,
    });
  } catch (err) {
    console.log('Unable to update profile', err);
    response.statusCode = 500;
  } finally {
    poolClient.release();
  }
};

const describeProfileHandler = async (event) => (await compose([
  removeAuthToken,
  describeProfile,
])(event));

const updateProfileHandler = async (event) => (await compose([
  removeAuthToken,
  updateProfile,
])(event));

export {
  describeProfileHandler,
  updateProfileHandler,
};
