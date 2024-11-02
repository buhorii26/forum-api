const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');

describe('/threads/{threadId}/comments/{commentId}/replies endpoint', () => {
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

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 401 when there is missing authentication', async () => {
      const requestPayload = {
        content: 'This is reply',
      };

      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads/123/comments/234/replies',
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
      const threadPayload = {
        title: 'My title',
        body: 'The body of thread',
      };
      const commentPayload = {
        content: 'My comment',
      };
      const requestPayload = {};

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
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat reply comment baru karena input tidak lengkap!',
      );
    });

    it('should response 400 when request payload has invalid property type', async () => {
      const loginPayload = {
        username: 'ryananggada',
        password: 'password123',
      };
      const threadPayload = {
        title: 'My title',
        body: 'The body of thread',
      };
      const commentPayload = {
        content: 'My comment',
      };
      const requestPayload = {
        content: 456,
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
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat reply comment baru tipe data tidak sesuai!',
      );
    });

    it('should response 201 and persisted reply', async () => {
      const loginPayload = {
        username: 'ryananggada',
        password: 'password123',
      };
      const threadPayload = {
        title: 'My title',
        body: 'The body of thread',
      };
      const commentPayload = {
        content: 'My comment',
      };
      const requestPayload = {
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

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply.content).toEqual(
        requestPayload.content,
      );
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('it should response 401 when there is missing authentication', async () => {
      const loginPayload = {
        username: 'dicoding',
        password: 'secret',
      };
      const threadPayload = {
        title: 'Title Two',
        body: 'Body Two',
      };
      const commentPayload = {
        content: 'My comment',
      };
      const requestPayload = {
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

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
      });
      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 403 if not the owner of reply try to delete the reply', async () => {
      const loginPayload = {
        username: 'dicoding',
        password: 'secret',
      };
      const notOwnerPayload = {
        username: 'buhori',
        password: 'secret',
      };
      const threadPayload = {
        title: 'My title',
        body: 'The body of thread',
      };
      const commentPayload = {
        content: 'My comment',
      };
      const requestPayload = {
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
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: notOwnerPayload.username,
          password: notOwnerPayload.password,
          fullname: 'John Doe',
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

      const reply = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const replyResponse = JSON.parse(reply.payload);
      const replyId = replyResponse.data.addedReply.id;

      const notOwnerAuth = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: notOwnerPayload,
      });
      const notOwnerResponse = JSON.parse(notOwnerAuth.payload);
      const notOwnerToken = notOwnerResponse.data.accessToken;

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: { Authorization: `Bearer ${notOwnerToken}` },
      });
      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'unauthorized, not the owner of reply',
      );
    });

    it('should response 200 when deleting reply successfully', async () => {
      const loginPayload = {
        username: 'johndoe',
        password: 'secret',
      };
      const threadPayload = {
        title: 'My title',
        body: 'The body of thread',
      };
      const commentPayload = {
        content: 'My comment',
      };
      const requestPayload = {
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

      const reply = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const replyResponse = JSON.parse(reply.payload);
      const replyId = replyResponse.data.addedReply.id;

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const responseJson = JSON.parse(response.payload);
      console.log(responseJson);

      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
