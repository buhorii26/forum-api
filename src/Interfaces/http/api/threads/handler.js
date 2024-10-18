const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');

class ThreadHandler {
  constructor(container) {
    this._container = container;
    this.postThreadHandler = this.postThreadHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.id);
    try {
      const addedThread = await addThreadUseCase.execute(
        owner,
        request.payload,
      );
      const response = h.response({
        status: 'success',
        data: {
          addedThread,
        },
      });
      response.code(201);
      return response;
    } catch (err) {
      console.error(err); // Log error detail untuk investigasi
      return h.internalServerError('Terjadi kegagalan pada server kami');
    }
  }
}
module.exports = ThreadHandler;
