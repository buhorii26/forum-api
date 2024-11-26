const pool = require('../../database/postgres/pool');
const LikesCommentTableTestHelper = require('../../../../tests/LikesCommentTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments/{commentId}/likes endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await LikesCommentTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should response 401 when there is missing authentication', async () => {
      const server = await createServer(container);

      const response = await server.inject({
        method: 'PUT',
        url: '/threads/123/comments/123/likes',
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should reponse 200 and persist like comment', async () => {
      const loginPayload = {
        username: 'dicoding',
        password: 'secret',
      };
      const threadPayload = {
        title: 'My title',
        body: 'The body of thread',
      };
      const commentPayload = {
        content: 'My comment',
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

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should reponse 200 and persist unlike comment', async () => {
      const loginPayload = {
        username: 'dicoding',
        password: 'secret',
      };
      const threadPayload = {
        title: 'My title',
        body: 'The body of thread',
      };
      const commentPayload = {
        content: 'My comment',
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

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const response2 = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const response2Json = JSON.parse(response.payload);

      expect(response2.statusCode).toEqual(200);
      expect(response2Json.status).toEqual('success');
    });
  });
});
