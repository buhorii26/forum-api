const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const GetDetailThreadUseCase = require('../../../../Applications/use_case/GetDetailThreadUseCase');

class ThreadHandler {
  constructor(container) {
    this._container = container;
    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadHandler = this.getThreadHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    try {
      const addThreadUseCase = this._container.getInstance(
        AddThreadUseCase.name,
      );
      const { id: owner } = request.auth.credentials;

      const addedThread = await addThreadUseCase.execute(
        owner,
        request.payload,
      );

      const response = h.response({
        status: 'success',
        data: { addedThread },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (
        error.message === 'ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY'
        || error.message === 'ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION'
      ) {
        // Penanganan 404 Not found error
        return h
          .response({
            status: 'fail',
            message: error.message,
          })
          .code(400);
      }
      // Penanganan 404 Not found error
      return h
        .response({
          status: 'error',
          message: error.message,
        })
        .code(500);
    }
  }

  async getThreadHandler(request, h) {
    const { threadId } = request.params;
    const getDetailThreadUseCase = this._container.getInstance(
      GetDetailThreadUseCase.name,
    );
    const thread = await getDetailThreadUseCase.execute(threadId);

    const response = h.response({
      status: 'success',
      data: {
        thread,
      },
    });
    response.code(200);
    return response;
  }
}
module.exports = ThreadHandler;
