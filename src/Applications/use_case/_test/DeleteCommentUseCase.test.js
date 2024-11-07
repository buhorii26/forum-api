const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should orchestrating the delete comment action correctly', async () => {
    const mockCommentRepository = new CommentRepository();

    const mockComment = {
      id: 'comment-123',
    };
    const mockUser = {
      ownerId: 'user-123',
    };

    mockCommentRepository.checkAvailabilityComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteCommentById = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    await deleteCommentUseCase.execute({
      commentId: mockComment.id,
      ownerId: mockUser.ownerId,
    });

    expect(mockCommentRepository.checkAvailabilityComment).toBeCalledWith(
      mockComment.id,
    );
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(
      mockComment.id,
      mockUser.ownerId,
    );
    expect(mockCommentRepository.deleteCommentById).toBeCalledWith(
      mockComment.id,
    );
  });
});