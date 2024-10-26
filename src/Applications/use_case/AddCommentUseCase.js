const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(threadId, owner, useCasePayload) {
    const newComment = new AddComment(useCasePayload);
    await this._threadRepository.verifyAvailableThread(threadId);

    return this._commentRepository.addComment(threadId, owner, newComment);
  }
}

module.exports = AddCommentUseCase;
