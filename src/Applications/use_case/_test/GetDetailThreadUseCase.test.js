const ReplyCommentRepository = require('../../../Domains/reply-comment/ReplyCommentRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const UserRepository = require('../../../Domains/users/UserRepository');
const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');

describe('GetdetailThreadUseCase', () => {
  it('should orchestrating the get thread detail action with comments and replies correctly', async () => {
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyCommentRepository = new ReplyCommentRepository();
    const mockUserRepository = new UserRepository();

    const mockThreadData = {
      id: 'thread-123',
      title: 'My thread',
      body: 'Thread content goes here',
      date: '2024-10-04T10:24:47.551Z',
      username: 'johndoe',
    };

    const mockCommentData = [
      {
        id: 'comment-123',
        username: 'buhori',
        date: '2024-10-07T01:58:38.808Z',
        is_delete: false,
        content: 'Test comment one',
      },
      {
        id: 'comment-456',
        username: 'johndoe',
        date: '2024-10-07T02:54:10.771Z',
        is_delete: true,
        content: '**komentar telah dihapus**',
      },
    ];

    const mockReplyData = [
      {
        id: 'reply-123',
        username: 'johndoe',
        date: '2024-10-07T02:54:38.565Z',
        is_delete: false,
        content: 'Reply goes here',
      },
      {
        id: 'reply-456',
        username: 'buhori',
        date: '2024-10-07T02:55:46.810Z',
        is_delete: true,
        content: '**balasan telah dihapus**',
      },
    ];

    mockThreadRepository.getThreadById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockThreadData));
    mockCommentRepository.getCommentByThreadId = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockCommentData));
    mockReplyCommentRepository.getRepliesByCommentId = jest
      .fn()
      .mockImplementation((commentId) => {
        if (commentId === 'comment-123') {
          return Promise.resolve(mockReplyData);
        }

        return Promise.resolve([]);
      });

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      userRepository: mockUserRepository,
      commentRepository: mockCommentRepository,
      replyCommentRepository: mockReplyCommentRepository,
    });

    const detailThread = await getDetailThreadUseCase.execute('thread-123');

    expect(mockThreadRepository.getThreadById).toBeCalledWith('thread-123');
    expect(mockCommentRepository.getCommentByThreadId).toBeCalledWith(
      'thread-123',
    );
    expect(mockReplyCommentRepository.getRepliesByCommentId).toBeCalledWith(
      'comment-123',
    );

    expect(detailThread).toMatchObject({
      id: 'thread-123',
      title: 'My thread',
      body: 'Thread content goes here',
      username: 'johndoe',
    });

    expect(detailThread.comments).toHaveLength(2);

    expect(detailThread.comments[0]).toMatchObject({
      id: 'comment-123',
      username: 'buhori',
      content: 'Test comment one',
    });

    expect(detailThread.comments[1]).toMatchObject({
      id: 'comment-456',
      username: 'johndoe',
      content: '**komentar telah dihapus**',
    });

    expect(detailThread.comments[0].replies).toHaveLength(2);

    expect(detailThread.comments[0].replies[0]).toMatchObject({
      id: 'reply-123',
      username: 'johndoe',
      content: 'Reply goes here',
    });

    expect(detailThread.comments[0].replies[1]).toMatchObject({
      id: 'reply-456',
      username: 'buhori',
      content: '**balasan telah dihapus**',
    });

    expect(detailThread.comments[1].replies).toHaveLength(0);
  });

  it('should orchestrating the get thread detail action without comments and replies correctly', async () => {
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyCommentRepository = new ReplyCommentRepository();
    const mockUserRepository = new UserRepository();

    const mockThreadData = {
      id: 'thread-123',
      title: 'My thread',
      body: 'Thread content goes here',
      date: '2024-10-04T10:24:47.551Z',
      username: 'johndoe',
    };

    mockThreadRepository.getThreadById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockThreadData));
    mockCommentRepository.getCommentByThreadId = jest
      .fn()
      .mockImplementation(() => Promise.resolve([]));
    mockReplyCommentRepository.getRepliesByCommentId = jest
      .fn()
      .mockImplementation(() => Promise.resolve([]));

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      userRepository: mockUserRepository,
      commentRepository: mockCommentRepository,
      replyCommentRepository: mockReplyCommentRepository,
    });

    const detailThread = await getDetailThreadUseCase.execute('thread-123');

    expect(mockThreadRepository.getThreadById).toBeCalledWith('thread-123');
    expect(mockCommentRepository.getCommentByThreadId).toBeCalledWith('thread-123');
    expect(mockReplyCommentRepository.getRepliesByCommentId).toBeCalledTimes(0);

    expect(detailThread).toMatchObject({
      id: 'thread-123',
      title: 'My thread',
      body: 'Thread content goes here',
      username: 'johndoe',
    });
    expect(detailThread.comments).toHaveLength(0);
  });
});
