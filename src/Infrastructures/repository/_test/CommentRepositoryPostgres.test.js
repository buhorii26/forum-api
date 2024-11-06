const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');

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
      await commentRepositoryPostgres.addComment(
        'thread-123',
        'user-123',
        newComment,
      );

      // Assert
      const comment = await CommentsTableTestHelper.findCommentsById(
        'comment-123',
      );
      expect(comment).toHaveLength(1);
    });
    it('should return added comment correctly', async () => {
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
    it('should return get detail comment by thread id ', async () => {
      // Arrange
      const thId = 'thread-123';
      const commentId = 'comment-123';
      const uid = 'user-123';
      const dataComments = [
        new DetailComment({
          id: commentId,
          username: 'buhori',
          date: '2024-11-01',
          content: 'ini konten',
          is_delete: false,
          replies: [],
        }),
      ];

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId: thId,
        owner: uid,
      });

      // Action
      const comment = (
        await commentRepositoryPostgres.getCommentByThreadId(thId)
      ).map((commentItem) => {
        const { date, ...rest } = commentItem; // Buat salinan tanpa properti `date`
        return rest;
      });

      const dataCommentsWithoutDate = dataComments.map((expectedItem) => {
        const { date, ...rest } = expectedItem; // Buat salinan tanpa properti `date`
        return rest;
      });
      // Assert
      expect(comment).toHaveLength(1);
      expect(comment).toStrictEqual(dataCommentsWithoutDate);
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

  describe('deleteCommentById', () => {
    it('should throw error when comment does not exist', async () => {
      const threadId = 'thread-123';
      const owner = 'user-123';
      const commentId = 'comment-123';

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId,
        owner,
      });

      await expect(commentRepositoryPostgres.deleteCommentById('comment-1'));
    });
    it('delete comment correctly', async () => {
      const threadId = 'thread-123';
      const owner = 'user-123';
      const commentId = 'comment-123';

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId,
        owner,
      });

      // Pengecekan sebelum penghapusan
      const commentBeforeDelete = await CommentsTableTestHelper.findCommentsById(commentId);
      // Memastikan sebelum dihapus, is_delete adalah false
      expect(commentBeforeDelete[0].is_delete).toBe(false);

      // Melakukan penghapusan
      await expect(
        commentRepositoryPostgres.deleteCommentById(commentId),
      ).resolves.not.toThrowError(NotFoundError);

      // Pengecekan setelah penghapusan
      const commentAfterDelete = await CommentsTableTestHelper.findCommentsById(commentId);
      // Memastikan setelah dihapus, is_delete adalah true
      expect(commentAfterDelete[0].is_delete).toBe(true);
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
