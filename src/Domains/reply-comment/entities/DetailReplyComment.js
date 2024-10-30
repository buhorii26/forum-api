class ReplyDetailComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, content, date, username,
    } = this._remapPayload(payload);

    this.id = id;
    this.content = content;
    this.date = date;
    this.username = username;
  }

  _verifyPayload({
    id, content, date, username,
  }) {
    if (!id || !content || !date || !username) {
      throw new Error('REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string'
        || typeof content !== 'string'
        || typeof date !== 'string'
        || typeof username !== 'string'
    ) {
      throw new Error('REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  _remapPayload({
    id, content, date, username, isDelete,
  }) {
    return {
      id,
      content: isDelete ? '**balasan telah dihapus**' : content,
      date,
      username,
    };
  }
}

module.exports = ReplyDetailComment;
