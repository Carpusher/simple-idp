
/**
 * API middleware manager
 * @param {...Function} middlewares
 * @return {Promise}
 */
const compose = (middlewares) => async (event) => {
  const response = {};
  const callByOrder = async (funcs) => {
    let cont;
    const next = () => cont = true;
    for (const func of funcs) {
      cont = false;
      await func(event, response, next);
      console.log(`response: ${response}`);
      if (!cont) {
        break;
      }
    }
  };

  await callByOrder(middlewares);
  return response;
};

/**
 * API middleware that removes token in the request event.
 * @param {Object} event
 * @param {Object} _ response
 * @param {Function} next
 */
const removeAuthToken = (event, _, next) => {
  delete event.headers.Authorization;
  delete event.multiValueHeaders.Authorization;
  next();
};

export {
  compose,
  removeAuthToken,
};