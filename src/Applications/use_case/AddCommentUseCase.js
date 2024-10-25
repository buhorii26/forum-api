const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const newComment = new AddComment(useCasePayload);
    console.log('ini payload newComment', newComment); // debugging
    // verify thread availability
    await this._threadRepository.verifyAvailableThread(newComment);

    return this._commentRepository.addComment(newComment);
  }
}

module.exports = AddCommentUseCase;
