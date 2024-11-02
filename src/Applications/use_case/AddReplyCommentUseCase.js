const AddReplyComment = require('../../Domains/reply-comment/entities/AddReplyComment');

class AddReplyCommentUseCase {
  constructor({ replyCommentRepository, threadRepository, commentRepository }) {
    this._replyCommentRepository = replyCommentRepository;
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(commentId, threadId, ownerId, useCasePayload) {
    const newReply = new AddReplyComment(useCasePayload);
    await this._threadRepository.verifyAvailableThread(threadId);
    await this._commentRepository.checkAvailabilityComment(commentId);

    return this._replyCommentRepository.addReplyComment(ownerId, commentId, newReply);
  }
}

module.exports = AddReplyCommentUseCase;
