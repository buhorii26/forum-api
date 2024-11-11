class DeleteReplyCommentUseCase {
  constructor({ replyCommentRepository }) {
    this._replyCommentRepository = replyCommentRepository;
  }

  async execute(threadId, commentId, replyId, ownerId) {
    await this._replyCommentRepository.checkAvailableReply(replyId);
    await this._replyCommentRepository.verifyReplyOwner(replyId, ownerId);

    return this._replyCommentRepository.deleteReplyById(threadId, commentId, replyId);
  }
}

module.exports = DeleteReplyCommentUseCase;
