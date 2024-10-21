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
    it('should persist added thread ', async () => {
      // Arrange
      const newThread = new AddThread({
        title: 'First thread',
        body: 'This is a new thread',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      await threadRepositoryPostgres.addThread(newThread, owner);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');

      expect(threads).toHaveLength(1);
    });

    it('should return thread correctly', async () => {
      // Arrange

      const newThread = new AddThread({
        title: 'First thread',
        body: 'This is a new thread',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(
        newThread,
        owner,
      );

      // Assert

      expect(addedThread).toStrictEqual(
        new AddedThread({
          id: 'thread-123',
          title: 'First thread',
          owner: 'user-123',
        }),
      );
    });
  });
});
