const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(threadId, ownerId, useCasePayload) {
    const newComment = new AddComment(useCasePayload);
    await this._threadRepository.checkAvailableThread(threadId);

    return this._commentRepository.addComment(threadId, ownerId, newComment);
  }
}

module.exports = AddCommentUseCase;
