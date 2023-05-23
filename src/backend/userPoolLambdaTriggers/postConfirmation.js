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
  const {triggerSource, request: {userAttributes}, userName} = event;
  if (triggerSource === 'PostConfirmation_ConfirmSignUp') {
    const displayName =
      userAttributes['cognito:user_status'] === 'EXTERNAL_PROVIDER' ?
      userAttributes.name :
      userAttributes.email.split('@')[0];
    console.log(`Display name: ${displayName}`);

    const poolClient = await pool.connect();
    console.log('DB connected successfully');
    try {
      const res = await poolClient.query(`
        INSERT INTO users(cognitoUserName, email, created, displayname)
        VALUES($1, $2, $3, $4)
        RETURNING *
      `, [userName, userAttributes.email, new Date(), displayName]);
      console.log(res);
    } catch (err) {
      console.log('Unable to insert user info', err);
    } finally {
      poolClient.release();
    }
  }
  return event;
};

export {handler};
