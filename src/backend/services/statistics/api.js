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
 * GET /api/statistics handler.
 * @param {any} event The API request event
 * @param {any} response The response of the API request
 */
const listStatistics = async (event, response) => {
  console.log(JSON.stringify(event));
  const poolClient = await pool.connect();
  console.log('DB connected successfully');
  try {
    const res = await poolClient.query('SELECT lastSession FROM users');
    // cSpell: disable-next-line
    const lastSessions = res.rows.map((user) => user.lastsession);
    const today = new Date();
    const statistics = {
      statistics: [
        {
          name: 'total-sign-ups',
          value: lastSessions.length,
        },
        {
          name: 'daily-active-users',
          value: lastSessions.filter((time) => {
            const lastSession = new Date(time);
            return lastSession.getDate() === today.getDate() &&
                lastSession.getMonth() === today.getMonth() &&
                lastSession.getFullYear() === today.getFullYear();
          }).length,
        },
        {
          // Average number of active session users in the last 7 days rolling
          name: '7d-active-user-rolling',
          value: (lastSessions.filter((time) => {
            const lastSession = new Date(time);
            return lastSession.getTime() >= today.getTime() - 7 * 24 * 60 * 60 * 1000;
          }).length / 7).toFixed(2),
        },
      ],
    };
    response.statusCode = 200;
    response.body = JSON.stringify(statistics);
  } catch (err) {
    console.log('Unable to list statistics', err);
    response.statusCode = 500;
    return;
  } finally {
    poolClient.release();
  }
};

const listStatisticsHandler = async (event) => (await compose([
  removeAuthToken,
  listStatistics,
])(event));

export {listStatisticsHandler};
