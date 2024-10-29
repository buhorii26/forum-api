class DeleteReplyCommentUseCase {
  constructor({ replyCommentRepository }) {
    this._replyCommentRepository = replyCommentRepository;
  }

  async execute(threadId, commentId, replyId, userId) {
    await this._replyCommentRepository.checkAvailabilityReply(replyId);
    await this._replyCommentRepository.verifyReplyOwner(replyId, userId);

    return this._replyCommentRepository.deleteReplyById(threadId, commentId, replyId);
  }
}

module.exports = DeleteReplyCommentUseCase;
