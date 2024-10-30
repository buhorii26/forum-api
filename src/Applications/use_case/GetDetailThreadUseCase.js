const DetailThread = require('../../Domains/threads/entities/DetailThread');
const DetailComment = require('../../Domains/comments/entities/DetailComment');
const DetailReplyComment = require('../../Domains/reply-comment/entities/DetailReplyComment');

class GetDetailThreadUseCase {
  constructor({
    threadRepository,
    userRepository,
    commentRepository,
    replyCommentRepository,
  }) {
    this._threadRepository = threadRepository;
    this._userRepository = userRepository;
    this._commentRepository = commentRepository;
    this._replyCommentRepository = replyCommentRepository;
  }

  async execute(threadId) {
    const threadFromId = await this._threadRepository.getThreadById(threadId);

    const thread = new DetailThread({
      id: threadFromId.id,
      title: threadFromId.title,
      body: threadFromId.body,
      date: threadFromId.date,
      username: threadFromId.username,
      comments: [],
    });

    const commentsInThread = await this._commentRepository.getCommentByThreadId(
      threadId,
    );

    if (commentsInThread.length > 0) {
      const commentDetails = await Promise.all(
        commentsInThread.map(async (comment) => {
          const commentDetail = new DetailComment({
            id: comment.id,
            username: comment.username,
            date: comment.date,
            content: comment.content,
            replies: [],
            isDelete: comment.is_delete,
          });

          const repliesInComment = await this._replyCommentRepository.getRepliesByCommentId(
            comment.id,
          );

          if (repliesInComment.length > 0) {
            const replyDetails = await Promise.all(
              repliesInComment.map(
                async (reply) => new DetailReplyComment({
                  id: reply.id,
                  content: reply.content,
                  date: reply.date,
                  username: reply.username,
                  isDelete: reply.is_delete,
                }),
              ),
            );

            commentDetail.replies.push(...replyDetails);
          }

          return commentDetail;
        }),
      );

      thread.comments.push(...commentDetails);
    }

    return thread;
  }
}

module.exports = GetDetailThreadUseCase;
