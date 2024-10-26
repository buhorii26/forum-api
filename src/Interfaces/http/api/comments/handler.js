const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');

class CommentHandler {
  constructor(container) {
    this._container = container;
    this.postCommentHandler = this.postCommentHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    try {
      const addCommentUseCase = this._container.getInstance(
        AddCommentUseCase.name,
      );
      const { id: owner } = request.auth.credentials;
      const { threadId } = request.params;
      const content = request.payload;

      const addedComment = await addCommentUseCase.execute(
        threadId,
        owner,
        content,
      );

      const response = h.response({
        status: 'success',
        data: { addedComment },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (
        error.message === 'ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY'
        || error.message === 'ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION'
      ) {
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
          status: 'fail',
          message: 'THREAD NOT FOUND',
        })
        .code(404);
    }
  }
}

module.exports = CommentHandler;
