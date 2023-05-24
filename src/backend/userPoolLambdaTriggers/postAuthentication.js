import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';
import pg from 'pg';

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

const handler = async (event) => {
  console.log(event);
  const {userName} = event;
  const poolClient = await pool.connect();
  console.log('DB connected successfully');
  try {
    const res = await poolClient.query(`
      UPDATE users SET loginCount = loginCount+1
      WHERE cognitoUserName = $1
      RETURNING *
    `, [userName]);
    console.log(res);
  } catch (err) {
    console.log('Unable to insert user info', err);
  } finally {
    poolClient.release();
  }
  return event;
};

export {handler};
