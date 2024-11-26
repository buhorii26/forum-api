const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add thread action correctly', async () => {
    const useCasePayload = {
      title: 'Indonesia Rupiah weakens due to inflation',
      body: 'Recently the conversion rate of US dollar to Indonesian Rupiah rises by 5% in this period.',
    };

    const mockUser = {
      id: 'user-123',
    };

    const mockAddedThread = new AddedThread({
      id: 'thread-456',
      title: useCasePayload.title,
      owner: mockUser.id,
    });

    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.addThread = jest.fn(() => Promise.resolve(mockAddedThread));

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    const addedThread = await addThreadUseCase.execute(
      mockUser.id,
      useCasePayload,
    );

    expect(addedThread).toStrictEqual(
      new AddedThread({
        id: 'thread-456',
        owner: mockUser.id,
        title: useCasePayload.title,
      }),
    );

    expect(mockThreadRepository.addThread).toBeCalledWith(
      mockUser.id,
      new AddThread({
        title: useCasePayload.title,
        body: useCasePayload.body,
      }),
    );
  });
});
