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
      title: 'My Title Thread',
      body: 'My Body Thread',
      userId: 'user-123',
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
    it('should persist adding comment and return added comment correctly', async () => {
      const newComment = new AddComment({
        content: 'My comment',
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      await commentRepositoryPostgres.addComment(
        'thread-123',
        'user-123',
        newComment,
      );

      const comment = await CommentsTableTestHelper.findCommentsById(
        'comment-123',
      );
      expect(comment).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      const newComment = new AddComment({
        content: 'My comment',
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      const addedComment = await commentRepositoryPostgres.addComment(
        'thread-123',
        'user-123',
        newComment,
      );
      expect(addedComment).toStrictEqual(
        new AddedComment({
          id: 'comment-123',
          content: 'My comment',
          owner: 'user-123',
        }),
      );
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should return correct comments', async () => {
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        userId: 'user-123',
        content: 'Comment One',
        createdAt: '2024-10-24T16:58:47.174Z',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-456',
        threadId: 'thread-123',
        userId: 'user-123',
        content: 'Comment Two',
        createdAt: '2024-10-24T16:58:59.015Z',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      const comments = await commentRepositoryPostgres.getCommentsByThreadId(
        'thread-123',
      );

      expect(comments).toHaveLength(2);

      expect(comments[0]).toStrictEqual({
        id: 'comment-123',
        username: 'buhori',
        content: 'Comment One',
        is_delete: false,
        created_at: expect.any(Date),
      });

      expect(comments[1]).toStrictEqual({
        id: 'comment-456',
        username: 'buhori',
        content: 'Comment Two',
        is_delete: false,
        created_at: expect.any(Date),
      });
    });

    it('should return empty comments but does not throw error', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      const comments = await commentRepositoryPostgres.getCommentsByThreadId(
        'thread-123',
      );

      expect(Array.isArray(comments)).toBeTruthy();
      expect(comments).toHaveLength(0);
    });
  });

  describe('checkAvailabilityComment function', () => {
    it('should throw error if comment is not found', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(
        commentRepositoryPostgres.checkAvailabilityComment('comment-123'),
      ).rejects.toThrowError(NotFoundError);
    });

    it('should not throw error if comment is available', async () => {
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        userId: 'user-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(
        commentRepositoryPostgres.checkAvailabilityComment('comment-123'),
      ).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('deleteCommentById function', () => {
    it('should be able to delete comment', async () => {
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        userId: 'user-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      commentRepositoryPostgres.deleteCommentById('thread-123', 'comment-123');

      const comments = await commentRepositoryPostgres.getCommentsByThreadId(
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
        userId: 'user-123',
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
        userId: 'user-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await expect(
        commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-123'),
      ).resolves.not.toThrowError(AuthorizationError);
    });
  });
});
