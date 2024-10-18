const AddThread = require('../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    try {
      const newThread = new AddThread(useCasePayload);
      return await this._threadRepository.addThread(newThread);
    } catch (error) {
      // Handle specific error types if needed
      console.error('Error adding thread:', error);
      throw new Error('Failed to add thread');
    }
  }
}

module.exports = AddThreadUseCase;
