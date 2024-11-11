const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const pool = require('../../database/postgres/pool');
const AddReplyComment = require('../../../Domains/reply-comment/entities/AddReplyComment');
const ReplyCommentRepositoryPostgres = require('../ReplyCommentRepositoryPostgres');
const AddedReplyComment = require('../../../Domains/reply-comment/entities/AddedReplyComment');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('ReplyRepositoryPostgres', () => {
  const userId = 'user-123';
  const threadId = 'thread-123';
  const commentId = 'comment-123';

  beforeAll(async () => {
    await UsersTableTestHelper.addUser({
      id: 'user-123',
      username: 'buhori',
    });
    await ThreadsTableTestHelper.addThread({ id: threadId, userId });
    await CommentsTableTestHelper.addComment({
      id: commentId,
      threadId,
      userId,
    });
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addReplyComment function', () => {
    it('should persist adding reply and return added reply correctly', async () => {
      const newReply = new AddReplyComment({
        content: 'My reply',
      });
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyCommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      await replyRepositoryPostgres.addReplyComment(
        'user-123',
        'comment-123',
        newReply,
      );

      const reply = await RepliesTableTestHelper.findRepliesById('reply-123');
      expect(reply).toHaveLength(1);
    });

    it('should return added reply correctly', async () => {
      const newReply = new AddReplyComment({
        content: 'My reply',
      });
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyCommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      const addedReply = await replyRepositoryPostgres.addReplyComment(
        'user-123',
        'comment-123',
        newReply,
      );
      expect(addedReply).toStrictEqual(
        new AddedReplyComment({
          id: 'reply-123',
          content: 'My reply',
          owner: 'user-123',
        }),
      );
    });
  });

  describe('getRepliesByCommentId function', () => {
    it('shoud return correct replies', async () => {
      await RepliesTableTestHelper.addReplyComment({
        id: 'reply-123',
        commentId: 'comment-123',
        threadId: 'thread-123',
        userId: 'user-123',
        content: 'Reply One',
      });
      await RepliesTableTestHelper.addReplyComment({
        id: 'reply-456',
        commentId: 'comment-123',
        threadId: 'thread-123',
        userId: 'user-123',
        content: 'Reply Two',
      });

      const replyRepositoryPostgres = new ReplyCommentRepositoryPostgres(pool, {});

      const replies = await replyRepositoryPostgres.getRepliesByCommentId(
        'comment-123',
      );

      expect(replies).toHaveLength(2);

      expect(replies[0]).toEqual(expect.objectContaining({
        id: 'reply-123',
        username: 'buhori',
        content: 'Reply One',
        is_delete: false,
        date: expect.any(String),
      }));
      expect(replies[1]).toStrictEqual({
        id: 'reply-456',
        username: 'buhori',
        content: 'Reply Two',
        is_delete: false,
        date: expect.any(String),
      });
    });

    it('should return empty replies but does not throw error', async () => {
      const replyRepositoryPostgres = new ReplyCommentRepositoryPostgres(pool, {});

      const replies = await replyRepositoryPostgres.getRepliesByCommentId(
        'comment-123',
      );

      expect(Array.isArray(replies)).toBeTruthy();
      expect(replies).toHaveLength(0);
    });
  });

  describe('checkAvailableReply function', () => {
    it('should not throw error if reply is available', async () => {
      // Arrange
      await RepliesTableTestHelper.addReplyComment({
        id: 'reply-123',
        content: 'Nice article!',
        comment_id: 'comment-123',
        owner: 'user-123',
        is_delete: false,
        date: '2024-10-11T02:15:46.336Z',
      });

      // Action & Assert
      const replyRepositoryPostgres = new ReplyCommentRepositoryPostgres(pool, {});
      await expect(
        replyRepositoryPostgres.checkAvailableReply('reply-123'),
      ).resolves.not.toThrowError(NotFoundError);
    });
    it('should throw error if reply is not found', async () => {
      const replyRepositoryPostgres = new ReplyCommentRepositoryPostgres(pool, {});

      await expect(
        replyRepositoryPostgres.checkAvailableReply('reply-123'),
      ).rejects.toThrowError(NotFoundError);
    });
  });

  describe('deleteReplyById function', () => {
    it('should be able to delete reply', async () => {
      await RepliesTableTestHelper.addReplyComment({
        id: 'reply-123',
        commentId: 'comment-123',
        threadId: 'thread-123',
        userId: 'user-123',
      });

      const replyRepositoryPostgres = new ReplyCommentRepositoryPostgres(pool, {});
      replyRepositoryPostgres.deleteReplyById(
        'thread-123',
        'comment-123',
        'reply-123',
      );

      const replies = await replyRepositoryPostgres.getRepliesByCommentId(
        'comment-123',
      );
      expect(replies[0].is_delete).toEqual(true);
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should throw AuthorizationError if not the owner of reply', async () => {
      await RepliesTableTestHelper.addReplyComment({
        id: 'reply-123',
        commentId: 'comment-123',
        threadId: 'thread-123',
        userId: 'user-123',
      });

      const replyRepositoryPostgres = new ReplyCommentRepositoryPostgres(pool, {});
      await expect(
        replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-456'),
      ).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw error if user is the owner of reply', async () => {
      await RepliesTableTestHelper.addReplyComment({
        id: 'reply-123',
        commentId: 'comment-123',
        threadId: 'thread-123',
        userId: 'user-123',
      });

      const replyRepositoryPostgres = new ReplyCommentRepositoryPostgres(pool, {});
      await expect(
        replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-123'),
      ).resolves.not.toThrowError(AuthorizationError);
    });
  });
});
