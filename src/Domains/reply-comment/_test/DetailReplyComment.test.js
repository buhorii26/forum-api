const DetailReplyComment = require('../entities/DetailReplyComment');

describe('DetailReplyComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      id: 'reply-123',
      content: 'Nice article!',
      username: 'dicoding',
    };

    expect(() => new DetailReplyComment(payload)).toThrow(
      'REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 'reply-123',
      content: 'Nice article!',
      date: {},
      username: 'johncena',
    };

    expect(() => new DetailReplyComment(payload)).toThrow(
      'REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create ReplyDetail object correctly when isDelete is false', () => {
    const payload = {
      id: 'reply-123',
      content: 'Nice article!',
      date: '2024-11-01T06:23:37.871Z',
      username: 'dicoding',
      isDelete: false,
    };

    const {
      id, content, date, username,
    } = new DetailReplyComment(payload);

    expect(id).toEqual(payload.id);
    expect(content).toEqual(payload.content);
    expect(date).toEqual(payload.date);
    expect(username).toEqual(payload.username);
  });

  it('should create ReplyDetail object correctly when isDelete is true', () => {
    const payload = {
      id: 'reply-123',
      content: 'Nice article!',
      date: '2024-11-01T06:23:37.871Z',
      username: 'dicoding',
      isDelete: true,
    };

    const {
      id, content, date, username,
    } = new DetailReplyComment(payload);

    expect(id).toEqual(payload.id);
    expect(content).toEqual('**balasan telah dihapus**');
    expect(date).toEqual(payload.date);
    expect(username).toEqual(payload.username);
  });
});
