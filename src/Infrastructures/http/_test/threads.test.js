const pool = require('../../database/postgres/pool');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 401 when there is missing authentication', async () => {
      const requestPayload = {
        title: 'Title One',
        body: 'Body One',
      };

      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const loginPayload = {
        username: 'dicoding',
        password: 'secret',
      };

      const requestPayload = {
        title: 'The Missing Body',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: loginPayload.username,
          password: loginPayload.password,
          fullname: 'Dicoding Indonesia',
        },
      });

      const auth = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: loginPayload,
      });
      const authResponse = JSON.parse(auth.payload);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${authResponse.data.accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat thread baru karena input tidak lengkap!',
      );
    });

    it('should response 400 when request payload has invalid property type', async () => {
      const loginPayload = {
        username: 'dicoding',
        password: 'secret',
      };

      const requestPayload = {
        title: 'Body with invalid type',
        body: 12345,
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: loginPayload.username,
          password: loginPayload.password,
          fullname: 'Dicoding Indonesia',
        },
      });

      const auth = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: loginPayload,
      });
      const authResponse = JSON.parse(auth.payload);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${authResponse.data.accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat thread baru karena tipe data tidak sesuai!',
      );
    });

    it('should response 201 and persisted thread', async () => {
      const loginPayload = {
        username: 'dicoding',
        password: 'secret',
      };

      const requestPayload = {
        title: 'Title goes here',
        body: 'My body goes here',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: loginPayload.username,
          password: loginPayload.password,
          fullname: 'Dicoding Indonesia',
        },
      });

      const auth = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: loginPayload,
      });
      const authResponse = JSON.parse(auth.payload);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${authResponse.data.accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread.title).toEqual(requestPayload.title);
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('it should response 404 when thread is not found', async () => {
      const server = await createServer(container);

      const response = await server.inject({
        method: 'GET',
        url: '/threads/123',
      });
      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });

    it('it should return a thread with details', async () => {
      const loginPayload = {
        username: 'dicoding',
        password: 'secret',
      };
      const threadPayload = {
        title: 'Title goes here',
        body: 'My body goes here',
      };
      const commentPayload = {
        content: 'My comment',
      };
      const replyPayload = {
        content: 'My reply',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: loginPayload.username,
          password: loginPayload.password,
          fullname: 'Dicoding Indonesia',
        },
      });

      const auth = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: loginPayload,
      });
      const authResponse = JSON.parse(auth.payload);
      const authToken = authResponse.data.accessToken;

      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: threadPayload,
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const threadResponse = JSON.parse(thread.payload);
      const threadId = threadResponse.data.addedThread.id;

      const comment = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: commentPayload,
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const commentResponse = JSON.parse(comment.payload);
      const commentId = commentResponse.data.addedComment.id;

      await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: replyPayload,
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });
      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread.title).toEqual(threadPayload.title);
      expect(responseJson.data.thread.body).toEqual(threadPayload.body);
      expect(responseJson.data.thread.username).toEqual(loginPayload.username);
      expect(Array.isArray(responseJson.data.thread.comments)).toBe(true);
    });
  });
});
