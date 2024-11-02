class DeleteCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const { commentId, ownerId } = useCasePayload;
    await this._commentRepository.checkAvailabilityComment(commentId);
    await this._commentRepository.verifyCommentOwner(commentId, ownerId);

    return this._commentRepository.deleteCommentById(commentId);
  }
}

module.exports = DeleteCommentUseCase;
