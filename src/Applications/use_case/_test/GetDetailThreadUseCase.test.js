const ReplyCommentRepository = require('../../../Domains/reply-comment/ReplyCommentRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');

describe('GetDetailThreadUseCase', () => {
  it('should orchestrate the get detail thread action correctly', async () => {
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyCommentRepository = new ReplyCommentRepository();

    // Simulasi data thread
    const mockThread = {
      id: 'thread-123',
      title: 'Example Thread',
      body: 'This is an example thread',
      date: '2023-10-10',
      username: 'user123',
    };

    // Simulasi data komentar dan balasan
    const mockComments = [
      {
        id: 'comment-123',
        username: 'user123',
        date: '2023-10-10',
        content: 'Example comment',
        is_delete: false,
      },
    ];

    const mockReplies = [
      {
        id: 'reply-123',
        content: 'Example reply',
        date: '2023-10-10',
        username: 'user456',
        is_delete: false,
      },
    ];

    // Mock implementation
    mockThreadRepository.getThreadById = jest.fn().mockResolvedValue(mockThread);
    mockCommentRepository.getCommentByThreadId = jest.fn().mockResolvedValue(mockComments);
    mockReplyCommentRepository.getRepliesByCommentId = jest.fn().mockResolvedValue(mockReplies);

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyCommentRepository: mockReplyCommentRepository,
    });

    const result = await getDetailThreadUseCase.execute('thread-123');

    // Verifikasi hasil
    expect(result).toBeInstanceOf(DetailThread);
    expect(result.comments).toHaveLength(1);
    expect(result.comments[0].replies).toHaveLength(1);
  });
});
