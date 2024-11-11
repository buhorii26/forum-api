const ReplyCommentRepository = require('../../../Domains/reply-comment/ReplyCommentRepository');
const DeleteReplyCommentUseCase = require('../DeleteReplyCommentUseCase');

describe('DeleteReplyCommentUseCase', () => {
  it('should orchestrating the delete reply action correctly', async () => {
    const mockReplyCommentRepository = new ReplyCommentRepository();

    const mockReply = {
      id: 'reply-123',
    };
    const mockComment = {
      id: 'comment-123',
    };
    const mockThread = {
      id: 'thread-123',
    };
    const mockUser = {
      id: 'user-123',
    };

    mockReplyCommentRepository.checkAvailableReply = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyCommentRepository.verifyReplyOwner = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyCommentRepository.deleteReplyById = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    const deleteReplyUseCase = new DeleteReplyCommentUseCase({
      replyCommentRepository: mockReplyCommentRepository,
    });

    await deleteReplyUseCase.execute(
      mockThread.id,
      mockComment.id,
      mockReply.id,
      mockUser.id,
    );

    expect(mockReplyCommentRepository.checkAvailableReply).toBeCalledWith(
      mockReply.id,
    );
    expect(mockReplyCommentRepository.verifyReplyOwner).toBeCalledWith(
      mockReply.id,
      mockUser.id,
    );
    expect(mockReplyCommentRepository.deleteReplyById).toBeCalledWith(
      mockThread.id,
      mockComment.id,
      mockReply.id,
    );
  });
});
