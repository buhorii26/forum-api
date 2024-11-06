const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const DetailComment = require('../../Domains/comments/entities/DetailComment');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(threadId, owner, newComment) {
    const { content } = newComment;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: `
        INSERT INTO comments
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, content, owner
      `,
      values: [id, threadId, content, date, owner, false],
    };

    const result = await this._pool.query(query);
    return new AddedComment({
      id: result.rows[0].id,
      content: result.rows[0].content,
      owner: result.rows[0].owner,
    });
  }

  async checkAvailabilityComment(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }
  }

  async verifyCommentOwner(commentId, owner) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1 AND owner = $2',
      values: [commentId, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError('unauthorized, not the owner of comment');
    }
  }

  async deleteCommentById(commentId) {
    const isDelete = true;

    const query = {
      text: 'UPDATE comments SET is_delete = $1 WHERE id = $2 returning id',
      values: [isDelete, commentId],
    };

    await this._pool.query(query);
  }

  async getCommentByThreadId(threadId) {
    const query = {
      text: `SELECT comments.id, users.username, comments.date, comments.is_delete, comments.content
        FROM comments
        INNER JOIN users ON comments.owner = users.id
        WHERE comments.thread_id = $1
        ORDER BY comments.date ASC`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows.map(
      (row) => new DetailComment({
        ...row,
        isDelete: row.is_delete,
        replies: row.replies || [], // Jika replies tidak ada, atur ke array kosong
      }),
    );
  }
}

module.exports = CommentRepositoryPostgres;
