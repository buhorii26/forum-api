const AddThread = require('../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(ownerId, useCasePayload) {
    const newThread = new AddThread(useCasePayload);
    return this._threadRepository.addThread(ownerId, newThread);
  }
}

module.exports = AddThreadUseCase;
