const AddThread = require('../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(owner, useCasePayload) {
    try {
      console.log('useCasePayload:', useCasePayload);
      const newThread = new AddThread({ ...useCasePayload, owner });
      return await this._threadRepository.addThread(newThread);
    } catch (error) {
      throw new Error('Failed to add thread');
    }
  }
}

module.exports = AddThreadUseCase;
