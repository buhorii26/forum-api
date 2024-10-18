const AddThread = require("../entities/AddThread");

describe("a Add Thread entities", () => {
  it("should throw error when payload did not contain needed property", () => {
    // Arrange
    const payload = {
      title: "abc",
    };

    // Action and Assert
    expect(() => new AddThread(payload)).toThrowError(
      "ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });
  it("should throw error when payload did not meet data type specification", () => {
    // Arrange
    const payload = {
      title: "A Thread",
      body: true,
    };
    // Action and Assert
    expect(() => new AddThread(payload)).toThrowError(
      "ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it('should create Add Thread entities correctly', () => {
    // Arrange
    const payload = {
      title: 'A thread',
      body: 'A long thread',
    };

    // Action
    const newThread = new AddThread(payload);

    // Assert
    expect(newThread).toBeInstanceOf(AddThread);
    expect(newThread.title).toEqual(payload.title);
    expect(newThread.body).toEqual(payload.body);
  });
});
