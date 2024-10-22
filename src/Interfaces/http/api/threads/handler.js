const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');

class ThreadHandler {
  constructor(container) {
    this._container = container;
    this.postThreadHandler = this.postThreadHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    try {
      const { title, body } = request.payload;
      const { id: owner } = request.auth.credentials;
      const addThreadUseCase = this._container.getInstance(
        AddThreadUseCase.name,
      );
      const addedThread = await addThreadUseCase.execute({
        title,
        body,
        owner,
      });
      const response = h.response({
        status: 'success',
        data: {
          addedThread,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (
        error.message === 'ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY'
        || error.message === 'ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION'
      ) {
        // Mengembalikan response 400 jika error terkait validasi payload
        return h
          .response({
            status: 'fail',
            message: error.message,
          })
          .code(400);
      }
      // Jika error lainnya, tetap kembalikan error 500
      return h.response({
        status: 'error',
        message: 'An internal server error occurred',
      }).code(500);
    }
  }
}
module.exports = ThreadHandler;
