const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

describe('/threads endpoint', () => {
  afterEach(async () => {
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });
  describe('when POST /threads', () => {
    it('should response 201 and added thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'title',
        body: 'dummy body',
      };
      const server = await createServer(container);
      const accessToken = await AuthenticationsTableTestHelper.getAccessToken();

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.title).toEqual(requestPayload.title);
    });
    it('should response 401 if no authorization', async () => {
      // Arrange
      const server = await createServer(container);
      const requestPayload = {
        title: 'First Thread',
        body: 'This is first thread',
      };
      const accessToken = 'wrongtoken';

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toStrictEqual(401);
      expect(responseJson.error).toStrictEqual('Unauthorized');
    });
    it('should response 400 if bad payload', async () => {
      // Arrange
      const server = await createServer(container);
      const requestPayload = {
        title: 'First Thread',
      };
      // Add account
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      const login = {
        username: 'dicoding',
        password: 'secret',
      };
      // login
      const auth = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: login,
      });

      const {
        data: { accessToken },
      } = JSON.parse(auth.payload);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toStrictEqual(400);
      expect(responseJson.status).toStrictEqual('fail');
      expect(responseJson.message).toStrictEqual(
        'cannot make a new thread, payload not correct',
      );
    });
  });
});
