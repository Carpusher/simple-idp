import {useState, useEffect} from 'react';
import {
  CognitoUserPool,
  CookieStorage,
} from 'amazon-cognito-identity-js';

import COGNITO from '../constants/cognito';

/**
 * Handle facebook login callback url with '#_=_'.
 * @return {string} location hash
 */
const getEffectiveLocationHash = () => (
  window.location.hash === '#_=_' ? '' : window.location.hash
);

/**
 * Location hash that listens to changes.
 * @return {string} location hash
 */
const useLocationHash = () => {
  const [hash, setHash] = useState(getEffectiveLocationHash());
  const listenToPopstate = () => {
    setHash(getEffectiveLocationHash);
  };
  useEffect(() => {
    window.addEventListener('popstate', listenToPopstate);
    return () => {
      window.removeEventListener('popstate', listenToPopstate);
    };
  }, []);
  return hash;
};

/**
 * Get CognitoUser with session.
 * @return {CognitoUser} cognitoUser
 */
const useCognitoUser = () => {
  const [cognitoUser, setCognitoUser] = useState();

  useEffect(() => {
    const userPool = new CognitoUserPool({
      UserPoolId: COGNITO.USER_POOL_ID,
      ClientId: COGNITO.CLIENT_ID,
      Storage: new CookieStorage({domain: '.simple-idp.click'}),
    });
    const currentUser = userPool.getCurrentUser();
    if (currentUser != null) { // local dev mode will not have session
      currentUser.getSession((err) =>{
        if (err) {
          alert(err.message || JSON.stringify(err));
          return;
        }
      });
    }
    setCognitoUser(currentUser);
  }, []);
  return cognitoUser;
};

export {
  useLocationHash,
  useCognitoUser,
};
