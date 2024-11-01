const DetailThread = require('../entities/DetailThread');

describe('DetailThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      id: 'thread-123',
      title: 'Unemployment on the rise',
      body: 'The ministry of Indonesia has reported that Gen Z are struggling to get new jobs.',
      date: '2022-09-09T09:15:30.338Z',
      username: 'user-456',
    };

    expect(() => new DetailThread(payload)).toThrow(
      'DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 'thread-123',
      title: 'Unemployment on the rise',
      body: 'The ministry of Indonesia has reported that Gen Z are struggling to get new jobs.',
      date: '2022-09-09T09:15:30.338Z',
      username: 'user-456',
      comments: 'Nice article!',
    };

    expect(() => new DetailThread(payload)).toThrow(
      'DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create ThreadDetail object correctly', () => {
    const payload = {
      id: 'thread-123',
      title: 'Unemployment on the rise',
      body: 'The ministry of Indonesia has reported that Gen Z are struggling to get new jobs.',
      date: '2022-09-09T09:15:30.338Z',
      username: 'user-456',
      comments: [],
    };

    const {
      id, title, body, date, username, comments,
    } = new DetailThread(
      payload,
    );

    expect(id).toEqual(payload.id);
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(date).toEqual(payload.date);
    expect(username).toEqual(payload.username);
    expect(comments).toEqual(payload.comments);
  });
});
