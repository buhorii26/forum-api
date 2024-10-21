const AddedThread = require('../entities/AddedThread');

describe('a AddedThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange

    const payload = {
      id: 'thread-123',
      title: 'This is title',
    };

    // Action and Assert
    expect(() => new AddedThread(payload)).toThrow(
      'ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload property did not meet data type needed', () => {
    // Arrange

    const payload = {
      id: 'thread-123',
      title: 'This is title',
      owner: 123,
    };

    // Action and Assert
    expect(() => new AddedThread(payload)).toThrow(
      'ADDED_THREAD.PROPERTY_NOT_MEET_DATA_TYPE_NEEDED',
    );
  });

  it('should create addedThread object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'This is title',
      owner: 'user-123',
    };

    // Action
    const addedThread = new AddedThread(payload);

    // Assert
    expect(addedThread.id).toStrictEqual(payload.id);
    expect(addedThread.title).toStrictEqual(payload.title);
    expect(addedThread.owner).toStrictEqual(payload.owner);
  });
});
