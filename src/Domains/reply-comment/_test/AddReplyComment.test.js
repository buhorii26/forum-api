const AddReplyComment = require('../entities/AddReplyComment');

describe('AddReplyComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {};

    expect(() => new AddReplyComment(payload)).toThrow(
      'ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      content: true,
    };

    expect(() => new AddReplyComment(payload)).toThrow(
      'ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create NewReply object correctly', () => {
    const payload = {
      content: 'Nice article!',
    };

    const { content } = new AddReplyComment(payload);

    expect(content).toEqual(payload.content);
  });
});
