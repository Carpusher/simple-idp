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
 * GET /api/users handler.
 * @param {any} event The API request event
 * @param {any} response The response of the API request
 */
const listUsers = async (event, response) => {
  console.log(JSON.stringify(event));
  const poolClient = await pool.connect();
  console.log('DB connected successfully');
  try {
    const res = await poolClient.query('SELECT * FROM users');
    console.log(res);
    response.statusCode = 200;
    response.body = JSON.stringify({
      users: res.rows.map((user) => ({
        // cSpell: disable
        id: user.cognitousername,
        lastSession: user.lastsession.toISOString(),
        loginCount: user.logincount,
        // cSpell: enable
        email: user.email,
        displayName: user.displayname,
        created: user.created.toISOString(),
      })),
    });
  } catch (err) {
    console.log('Unable to describe profile', err);
    response.statusCode = 500;
  } finally {
    poolClient.release();
  }
};

const listUsersHandler = async (event) => (await compose([
  removeAuthToken,
  listUsers,
])(event));


export {
  listUsersHandler,
};
