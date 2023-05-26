import {jest} from '@jest/globals';
import {compose, removeAuthToken} from './apiMiddlewares';

describe('compose', () => {
  it('calls all middlewares if all are successful', async () => {
    const givenMiddlewares = [
      jest.fn((event, response, next) => next()),
      jest.fn((event, response, next) => next()),
      jest.fn((event, response, next) => next()),
    ];
    await compose(givenMiddlewares)({});
    expect(givenMiddlewares[0]).toHaveBeenCalled();
    expect(givenMiddlewares[1]).toHaveBeenCalled();
    expect(givenMiddlewares[2]).toHaveBeenCalled();
  });

  it('stops calling middlewares if one of them fails or doesn\'t call next()',
      async () => {
        const givenMiddlewares = [
          jest.fn((event, response, next) => next()),
          jest.fn((event, response, next) => {}),
          jest.fn((event, response, next) => next()),
        ];
        await compose(givenMiddlewares)({});
        expect(givenMiddlewares[0]).toHaveBeenCalled();
        expect(givenMiddlewares[1]).toHaveBeenCalled();
        expect(givenMiddlewares[2]).not.toHaveBeenCalled();
      });

  it('composes response by order', async () => {
    const givenMiddlewares = [
      jest.fn((event, response, next) => {
        response.a = 1;
        next();
      }),
      jest.fn((event, response, next) => {
        response.b = 2;
        next();
      }),
      jest.fn((event, response, next) => {
        response.a = 3;
        next();
      }),
    ];
    const response = await compose(givenMiddlewares)({});
    expect(response).toEqual({a: 3, b: 2});
  });

  it('manipulates event by order', async () => {
    const givenMiddlewares = [
      jest.fn((event, response, next) => {
        delete event.a;
        next();
      }),
      jest.fn((event, response, next) => {
        event.b = 2;
        next();
      }),
      jest.fn((event, response, next) => {
        event.b = 3;
        next();
      }),
    ];
    const givenEvent = {
      a: 1,
      b: 1,
    };
    await compose(givenMiddlewares)(givenEvent);
    expect(givenEvent).toEqual({b: 3});
  });
});

describe('removeAuthToken', () => {
  const givenEvent = {
    headers: {
      Authorization: 'token',
    },
    multiValueHeaders: {
      Authorization: ['token'],
    },
  };
  const givenResponse = {};
  const givenNext = jest.fn();

  it('should remove token from event', () => {
    removeAuthToken(givenEvent, givenResponse, givenNext);
    expect(givenEvent.headers.Authorization).toBeUndefined();
    expect(givenEvent.multiValueHeaders.Authorization).toBeUndefined();
    expect(givenResponse).toEqual({});
    expect(givenNext).toHaveBeenCalled();
  });
});
