const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');

class CommentHandler {
  constructor(container) {
    this._container = container;
    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
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
          message: 'THREAD.NOT_AVAILABLE',
        })
        .code(404);
    }
  }

  async deleteCommentHandler(request, h) {
    const deleteCommentUseCase = this._container.getInstance(
      DeleteCommentUseCase.name,
    );
    const { id: owner } = request.auth.credentials;

    const { threadId, commentId } = request.params;

    await deleteCommentUseCase.execute({ threadId, commentId, owner });

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = CommentHandler;
