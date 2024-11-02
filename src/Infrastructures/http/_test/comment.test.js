const pool = require('../../database/postgres/pool');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

describe('/threads/{threadId}/comments endpoint', () => {
  afterEach(async () => {
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });
  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and added comment', async () => {
      const commentPayload = {
        content: 'ini content',
      };
      const accessToken = await AuthenticationsTableTestHelper.getAccessToken();
      const server = await createServer(container);

      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'title',
          body: 'dummy body',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log(threadResponse);
      const {
        data: {
          addedThread: { id: threadId },
        },
      } = JSON.parse(threadResponse.payload);

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: commentPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data).toBeDefined();
    });
    it('should response 401 when there is missing authentication', async () => {
      const requestPayload = {
        content: 'This is comment',
      };

      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads/xyz/comments',
        payload: requestPayload,
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const loginPayload = {
        username: 'ryananggada',
        password: 'password123',
      };
      const threadPayload = {
        title: 'My title',
        body: 'The body of thread goes here',
      };
      const requestPayload = {};

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: loginPayload.username,
          password: loginPayload.password,
          fullname: 'Ryan Anggada',
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

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat comment baru karena input tidak lengkap!',
      );
    });
    it('should response 400 when request payload has invalid property type', async () => {
      const loginPayload = {
        username: 'dicoding',
        password: 'secret',
      };
      const threadPayload = {
        title: 'My title',
        body: 'My Body',
      };
      const requestPayload = {
        content: true,
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

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat comment baru karena tipe data tidak sesuai!',
      );
    });
  });
  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('it should response 401 when there is missing authentication', async () => {
      const loginPayload = {
        username: 'dicoding',
        password: 'secret',
      };
      const threadPayload = {
        title: 'Superhero',
        body: 'Batman',
      };
      const requestPayload = {
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

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
      });
      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('it should response 403 if not the owner of comment try to delete the comment', async () => {
      const loginPayload = {
        username: 'dicoding',
        password: 'secret',
      };
      const notOwnerPayload = {
        username: 'johndoe',
        password: 'secret',
      };
      const threadPayload = {
        title: 'title john doe',
        body: 'this is body title john doe',
      };
      const requestPayload = {
        content: 'My comment',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: loginPayload.username,
          password: loginPayload.password,
          fullname: 'John Doe',
        },
      });
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: notOwnerPayload.username,
          password: notOwnerPayload.password,
          fullname: 'Buhori',
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
        payload: requestPayload,
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const commentResponse = JSON.parse(comment.payload);
      const commentId = commentResponse.data.addedComment.id;

      const notOwnerAuth = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: notOwnerPayload,
      });
      const notOwnerResponse = JSON.parse(notOwnerAuth.payload);
      const notOwnerToken = notOwnerResponse.data.accessToken;

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: { Authorization: `Bearer ${notOwnerToken}` },
      });
      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'unauthorized, not the owner of comment',
      );
    });

    it('should response 200 when deleting comment successfully', async () => {
      const loginPayload = {
        username: 'dicoding',
        password: 'secret',
      };
      const threadPayload = {
        title: 'My title',
        body: 'My body',
      };
      const requestPayload = {
        content: 'My comment',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: loginPayload.username,
          password: loginPayload.password,
          fullname: 'Ryan Anggada',
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
        payload: requestPayload,
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const commentResponse = JSON.parse(comment.payload);
      const commentId = commentResponse.data.addedComment.id;

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
