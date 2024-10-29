const DetailThread = require('../../Domains/threads/entities/DetailThread');
const DetailComment = require('../../Domains/comments/entities/DetailComment');

class GetDetailThreadUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    await this._threadRepository.verifyAvailableThread(useCasePayload.threadId);
    const thread = await this._threadRepository.getThreadById(useCasePayload.threadId);
    const comments = await this._commentRepository.getAllCommentsInThread(useCasePayload.threadId);


    return thread;
  }
}

module.exports = GetDetailThreadUseCase;
