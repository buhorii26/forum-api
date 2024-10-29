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
      const newThread = new AddThread({
        title: 'Thread title',
        body: 'Thread body',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      await threadRepositoryPostgres.addThread('user-123', newThread);

      const thread = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(thread).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      const newThread = new AddThread({
        title: 'Thread title',
        body: 'Thread body',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      const addedThread = await threadRepositoryPostgres.addThread(
        'user-123',
        newThread,
      );

      expect(addedThread).toStrictEqual(
        new AddedThread({
          id: 'thread-123',
          title: 'Thread title',
          owner: 'user-123',
        }),
      );
    });
  });
});
