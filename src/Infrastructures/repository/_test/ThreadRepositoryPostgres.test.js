const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  // Pre-requisite
  const owner = 'user-123';

  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: owner });
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist adding thread and return added thread correctly', async () => {
      // Arrange
      const newThread = new AddThread({
        title: 'Thread title',
        body: 'Thread body',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(
        'user-123',
        newThread,
      );

      // Assert
      const thread = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(thread).toHaveLength(1);
      expect(addedThread).toStrictEqual(
        new AddedThread({
          id: 'thread-123',
          title: 'Thread title',
          owner: 'user-123',
        }),
      );
    });
  });
  describe('getThreadById function', () => {
    it('should throw NotFoundError if thread is not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      await expect(
        threadRepositoryPostgres.getThreadById('thread-123'),
      ).rejects.toThrowError(NotFoundError);
    });

    it('should return correct thread', async () => {
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Thread title',
        body: 'Content of a thread',
        owner: 'user-123',
        date: '2024-10-11T02:15:46.336Z',
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      const thread = await threadRepositoryPostgres.getThreadById('thread-123');

      expect(thread).toStrictEqual({
        id: 'thread-123',
        title: 'Thread title',
        body: 'Content of a thread',
        username: 'dicoding',
        date: expect.any(String),
      });
    });
  });
  describe('checkAvailableThread function', () => {
    it('should not throw error if thread is available', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Thread title',
        body: 'Content of a thread',
        owner: 'user-123',
        date: '2024-10-11T02:15:46.336Z',
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert

      await expect(
        threadRepositoryPostgres.checkAvailableThread('thread-123'),
      ).resolves.not.toThrowError(NotFoundError);
    });
    it('should throw NotFoundError if thread is not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        threadRepositoryPostgres.checkAvailableThread('thread-123'),
      ).rejects.toThrowError(NotFoundError);
    });
  });
});
