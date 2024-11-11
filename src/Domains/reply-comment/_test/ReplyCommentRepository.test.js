const ReplyCommentRepository = require('../ReplyCommentRepository');

describe('ReplyCommentRepository interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    const replyCommentRepository = new ReplyCommentRepository();

    await expect(replyCommentRepository.addReplyComment('', '', {})).rejects.toThrow(
      'REPLY_COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
    await expect(replyCommentRepository.getRepliesByCommentId('')).rejects.toThrow(
      'REPLY_COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
    await expect(replyCommentRepository.deleteReplyById('')).rejects.toThrow(
      'REPLY_COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
    await expect(replyCommentRepository.verifyReplyOwner('', '')).rejects.toThrow(
      'REPLY_COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
    await expect(
      replyCommentRepository.checkAvailableReply(''),
    ).rejects.toThrow('REPLY_COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
