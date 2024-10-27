class DeleteCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const { commentId, owner } = useCasePayload;
    await this._commentRepository.checkAvailabilityComment(commentId);
    await this._commentRepository.verifyCommentOwner(commentId, owner);

    return this._commentRepository.deleteComment(commentId);
  }
}

module.exports = DeleteCommentUseCase;
