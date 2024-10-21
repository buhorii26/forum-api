const AddThread = require('../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(owner, useCasePayload) {
    const newThread = new AddThread({ ...useCasePayload, owner });
    return this._threadRepository.addThread(newThread);
  }
}

module.exports = AddThreadUseCase;
