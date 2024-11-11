const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ReplyCommentRepository = require('../../Domains/reply-comment/ReplyCommentRepository');
const AddedReplyComment = require('../../Domains/reply-comment/entities/AddedReplyComment');

class ReplyCommentRepositoryPostgres extends ReplyCommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReplyComment(userId, commentId, newReplyComment) {
    const { content } = newReplyComment;
    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: `
            INSERT INTO reply_comment
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, content, owner
          `,
      values: [id, content, commentId, userId, false, date],
    };

    const result = await this._pool.query(query);
    return new AddedReplyComment({
      id: result.rows[0].id,
      content: result.rows[0].content,
      owner: result.rows[0].owner,
    });
  }

  async getRepliesByCommentId(commentId) {
    const query = {
      text: `
        SELECT reply_comment.id, reply_comment.date, users.username, reply_comment.is_delete, reply_comment.content
        FROM reply_comment
        INNER JOIN users ON users.id = reply_comment.owner
        WHERE reply_comment.comment_id = $1
        ORDER BY reply_comment.date ASC
        `,
      values: [commentId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async checkAvailableReply(id) {
    const query = {
      text: 'SELECT * FROM reply_comment WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('reply not found');
    }
  }

  async deleteReplyById(threadId, commentId, replyId) {
    const query = {
      text: `
        UPDATE reply_comment r
        SET is_delete = true
        FROM comments c
        INNER JOIN threads t ON c.thread_id = t.id
        WHERE r.comment_id = c.id
          AND t.id = $1
          AND r.comment_id = $2
          AND r.id = $3
      `,
      values: [threadId, commentId, replyId],
    };

    await this._pool.query(query);
  }

  async verifyReplyOwner(replyId, userId) {
    const query = {
      text: 'SELECT * FROM reply_comment WHERE id = $1 AND owner = $2',
      values: [replyId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError('unauthorized, not the owner of reply');
    }
  }
}

module.exports = ReplyCommentRepositoryPostgres;
