const AddReplyCommentUseCase = require('../../../../Applications/use_case/AddReplyCommentUseCase');
const DeleteReplyCommentUseCase = require('../../../../Applications/use_case/DeleteReplyCommentUseCase');

class ReplyCommentHandler {
  constructor(container) {
    this._container = container;

    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyByIdHandler = this.deleteReplyByIdHandler.bind(this);
  }

  async postReplyHandler(request, h) {
    try {
      const addReplyUseCase = this._container.getInstance(AddReplyCommentUseCase.name);

      const { id: userId } = request.auth.credentials;
      const { threadId, commentId } = request.params;

      const addedReply = await addReplyUseCase.execute(
        commentId,
        threadId,
        userId,
        request.payload,
      );

      const response = h.response({
        status: 'success',
        data: { addedReply },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (
        error.message === 'ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY'
        || error.message === 'ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION'
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

  async deleteReplyByIdHandler(request, h) {
    const deleteReplyUseCase = this._container.getInstance(
      DeleteReplyCommentUseCase.name,
    );

    const { id: userId } = request.auth.credentials;
    const { threadId, commentId, replyId } = request.params;

    await deleteReplyUseCase.execute(threadId, commentId, replyId, userId);

    const response = h.response({
      status: 'success',
    });
    return response;
  }
}

module.exports = ReplyCommentHandler;
