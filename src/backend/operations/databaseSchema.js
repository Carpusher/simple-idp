import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';
import pg from 'pg';

const {Pool} = pg;
const {PG_SECRET_ARN} = process.env;

const QUERY = {
  USERS: {
    CREATE_TABLE: `
      CREATE TABLE users
      (
        cognitoUserName character varying(64) COLLATE "default" NOT NULL,
        email character varying(256) NOT NULL,
        created timestamp(6) without time zone NOT NULL,
        lastSession timestamp(6) without time zone,
        displayname character varying COLLATE "default" NOT NULL DEFAULT '',
        loginCount integer NOT NULL DEFAULT 0,
        CONSTRAINT users_pk PRIMARY KEY (cognitoUserName)
      ) WITH (OIDS = FALSE);
      `,
  },
};

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
  const poolClient = await pool.connect();
  console.log('DB connected successfully');
  try {
    let query = event.query;
    if (query == null) {
      query = QUERY[event.table]?.[event.script];
    }
    if (query == null) return;

    const res = await poolClient.query(query);
    console.log(res);
  } catch (err) {
    console.log('Unable to update DB schema', err);
    throw err;
  } finally {
    poolClient.release();
  }
};

export {handler};
