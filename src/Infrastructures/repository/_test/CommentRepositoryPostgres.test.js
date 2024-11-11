const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({
      id: 'user-123',
      username: 'buhori',
    });
    await ThreadsTableTestHelper.addThread({
      id: 'thread-123',
      title: 'Title goes here',
      body: 'My content filled here',
      owner: 'user-123',
    });
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist add comment and return added comment correctly', async () => {
      // Arrange
      const newComment = new AddComment({
        content: 'My comment',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(
        'thread-123',
        'user-123',
        newComment,
      );

      // Assert
      const comment = await CommentsTableTestHelper.findCommentsById(
        'comment-123',
      );
      expect(comment).toHaveLength(1);
      expect(addedComment).toStrictEqual(
        new AddedComment({
          id: 'comment-123',
          content: 'My comment',
          owner: 'user-123',
        }),
      );
    });
  });

  describe('getCommentByThreadId', () => {
    it('should return correct comments', async () => {
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
        content: 'Comment One',
        date: '2024-10-24T16:58:47.174Z',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-456',
        threadId: 'thread-123',
        owner: 'user-123',
        content: 'Comment Two',
        date: '2024-10-24T16:58:59.015Z',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      const comments = await commentRepositoryPostgres.getCommentByThreadId(
        'thread-123',
      );

      expect(comments).toHaveLength(2);

      expect(comments[0]).toStrictEqual({
        id: 'comment-123',
        username: 'buhori',
        content: 'Comment One',
        is_delete: false,
        date: expect.any(String),
      });
      expect(comments[1]).toStrictEqual({
        id: 'comment-456',
        username: 'buhori',
        content: 'Comment Two',
        is_delete: false,
        date: expect.any(String),
      });
    });

    it('should return empty comments but does not throw error', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      const comments = await commentRepositoryPostgres.getCommentByThreadId(
        'thread-123',
      );

      expect(Array.isArray(comments)).toBeTruthy();
      expect(comments).toHaveLength(0);
    });
  });

  describe('checkAvailableComment function', () => {
    it('should return all fields of comment if comment is available', async () => {
      // Arrange
      const expectedComment = {
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
        content: 'This is a test comment',
        isDelete: false,
      };

      await CommentsTableTestHelper.addComment({
        id: expectedComment.id,
        threadId: expectedComment.threadId,
        owner: expectedComment.owner,
        content: expectedComment.content,
        isDelete: expectedComment.isDelete,
      });

      // Action & Assert
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await expect(
        commentRepositoryPostgres.checkAvailableComment('comment-123'),
      ).resolves.not.toThrowError(NotFoundError);
    });
    it('should throw error if comment is not found', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(
        commentRepositoryPostgres.checkAvailableComment('comment-123'),
      ).rejects.toThrowError(NotFoundError);
    });
  });

  describe('deleteCommentById', () => {
    it('should be able to delete comment', async () => {
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      commentRepositoryPostgres.deleteCommentById('thread-123', 'comment-123');

      const comments = await commentRepositoryPostgres.getCommentByThreadId(
        'thread-123',
      );
      expect(comments[0].is_delete).toEqual(true);
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw AuthorizationError if not the owner of comment', async () => {
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await expect(
        commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-456'),
      ).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw error if user is the owner of comment', async () => {
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await expect(
        commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-123'),
      ).resolves.not.toThrowError(AuthorizationError);
    });
  });
});
