const AddComment = require('../entities/AddComment');

describe('a Comment entities', () => {
  it('should throw errror when thradId is not available', () => {
    // Arrange
    const payload = {
      content: 'ini content',
      owner: 'ini owner',
    };

    // Action and Assert
    expect(() => new AddComment(payload)).toThrowError('THREAD.NOT_AVAILABLE');
  });

  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      threadId: 'thread-123',
      content: 'ini content',
    };

    // Action and Assert
    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      threadId: 123,
      content: 123,
      owner: {},
    };

    // Action and assert
    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create newComment object correctly', () => {
    // Arrange
    const payload = {
      threadId: 'thread-123',
      content: 'ini content',
      owner: 'user-123',
    };

    // Action
    const { threadId, content, owner } = new AddComment(payload);

    // Assert
    expect(threadId).toEqual(payload.threadId);
    expect(content).toEqual(payload.content);
    expect(owner).toEqual(payload.owner);
  });
});
