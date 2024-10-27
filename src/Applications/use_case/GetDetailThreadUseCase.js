class GetDetailThreadUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { threadId } = useCasePayload;
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentByThreadId(
      threadId,
    );

    const commentsThread = await Promise.all(
      comments.map(async (comment) => ({
        ...comment,
      })),
    );

    return {
      ...thread,
      comments: commentsThread,
    };
  }
}

module.exports = GetDetailThreadUseCase;
