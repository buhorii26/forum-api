const ReplyCommentRepository = require('../../../Domains/reply-comment/ReplyCommentRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const DetailReplyComment = require('../../../Domains/reply-comment/entities/DetailReplyComment');

describe('GetDetailThreadUseCase', () => {
  it('should return thread with comments and replies when comments and replies exist', async () => {
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyCommentRepository = new ReplyCommentRepository();

    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const replyId = 'reply-123';

    // Simulasi data balasan menggunakan instance DetailReplyComment
    const mockReplies = [
      new DetailReplyComment({
        id: replyId,
        content: 'Example reply',
        date: '2023-10-10',
        username: 'user456',
        is_delete: false,
      }),
    ];

    /* Simulasi data komentar menggunakan instance DetailComment,
    dengan replies yang berisi instance DetailReplyComment */
    const mockComments = [
      new DetailComment({
        id: commentId,
        username: 'user123',
        date: '2023-10-10',
        content: 'Example comment',
        is_delete: false,
        replies: mockReplies,
      }),
    ];

    // Simulasi data thread
    const mockThread = new DetailThread({
      id: threadId,
      title: 'Example Thread',
      body: 'This is an example thread',
      date: '2023-10-10',
      username: 'user123',
      comments: mockComments,
    });

    // Mock implementation
    mockThreadRepository.getThreadById = jest
      .fn()
      .mockResolvedValue(mockThread);
    mockCommentRepository.getCommentByThreadId = jest
      .fn()
      .mockResolvedValue(mockComments);
    mockReplyCommentRepository.getRepliesByCommentId = jest
      .fn()
      .mockResolvedValue(mockReplies);

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyCommentRepository: mockReplyCommentRepository,
    });

    const result = await getDetailThreadUseCase.execute(threadId);

    // Assert
    expect(result).toBeInstanceOf(DetailThread);
    expect(result.comments).toHaveLength(1);
    expect(result.comments[0].replies).toHaveLength(1); // Ensure there is 1 reply
    expect(result).toStrictEqual(mockThread);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentByThreadId).toBeCalledWith(threadId);
    expect(mockReplyCommentRepository.getRepliesByCommentId).toBeCalledWith(commentId);
  });

  it('should return thread with comments but no replies when no replies exist', async () => {
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyCommentRepository = new ReplyCommentRepository();

    const threadId = 'thread-123';
    const commentId = 'comment-123';

    // Simulasi data tanpa balasan
    const mockComments = [
      new DetailComment({
        id: commentId,
        username: 'user123',
        date: '2023-10-10',
        content: 'Example comment',
        is_delete: false,
        replies: [], // No replies here
      }),
    ];

    // Simulasi data thread
    const mockThread = new DetailThread({
      id: threadId,
      title: 'Example Thread',
      body: 'This is an example thread',
      date: '2023-10-10',
      username: 'user123',
      comments: mockComments,
    });

    // Mock implementation
    mockThreadRepository.getThreadById = jest
      .fn()
      .mockResolvedValue(mockThread);
    mockCommentRepository.getCommentByThreadId = jest
      .fn()
      .mockResolvedValue(mockComments);
    mockReplyCommentRepository.getRepliesByCommentId = jest
      .fn()
      .mockResolvedValue([]); // No replies returned

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyCommentRepository: mockReplyCommentRepository,
    });

    const result = await getDetailThreadUseCase.execute(threadId);

    // Assert
    expect(result).toBeInstanceOf(DetailThread);
    expect(result.comments).toHaveLength(1);
    expect(result.comments[0].replies).toHaveLength(0); // No replies
    expect(result).toStrictEqual(mockThread);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentByThreadId).toBeCalledWith(threadId);
    expect(mockReplyCommentRepository.getRepliesByCommentId).toBeCalledWith(commentId);
  });

  it('should return thread with no comments when no comments exist', async () => {
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyCommentRepository = new ReplyCommentRepository();

    const threadId = 'thread-123';

    // Simulasi thread tanpa komentar
    const mockThread = new DetailThread({
      id: threadId,
      title: 'Example Thread',
      body: 'This is an example thread',
      date: '2023-10-10',
      username: 'user123',
      comments: [],
    });

    // Mock implementation
    mockThreadRepository.getThreadById = jest
      .fn()
      .mockResolvedValue(mockThread);
    mockCommentRepository.getCommentByThreadId = jest
      .fn()
      .mockResolvedValue([]); // No comments returned
    mockReplyCommentRepository.getRepliesByCommentId = jest
      .fn()
      .mockResolvedValue([]);

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyCommentRepository: mockReplyCommentRepository,
    });

    const result = await getDetailThreadUseCase.execute(threadId);

    // Assert
    expect(result).toBeInstanceOf(DetailThread);
    expect(result.comments).toHaveLength(0); // No comments
    expect(result).toStrictEqual(mockThread);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentByThreadId).toBeCalledWith(threadId);
  });
});
