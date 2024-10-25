const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');

class CommentHandler {
  constructor(container) {
    this._container = container;
    this.postCommentHandler = this.postCommentHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    try {
      const { threadId } = request.params;
      const { content } = request.payload;
      const { id: owner } = request.auth.credentials;
      const addCommentUseCase = this._container.getInstance(
        AddCommentUseCase.name,
      );
      const addedComment = await addCommentUseCase.execute({
        threadId,
        content,
        owner,
      });
      const response = h.response({
        status: 'success',
        data: {
          addedComment,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      console.log('ini error dari handler: ', error);
      if (
        error.message === 'ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY'
        || error.message === 'ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION'
      ) {
        // Mengembalikan response 400 untuk error validasi komentar
        return h
          .response({
            status: 'fail',
            message: error.message,
          })
          .code(400);
      } if (error.message === 'THREAD.NOT_AVAILABLE') {
        // Mengembalikan response 404 jika thread tidak tersedia
        return h
          .response({
            status: 'fail',
            message: error.message,
          })
          .code(404);
      }

      // Penanganan error umum, seperti internal server error
      return h
        .response({
          status: 'error',
          message: 'Terjadi kesalahan pada server.',
        })
        .code(500);
    }
  }
}

module.exports = CommentHandler;
