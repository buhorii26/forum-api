const autoBind = require('auto-bind');
const AddReplyCommentUseCase = require('../../../../Applications/use_case/AddReplyCommentUseCase');
const DeleteReplyCommentUseCase = require('../../../../Applications/use_case/DeleteReplyCommentUseCase');

class ReplyCommentHandler {
  constructor(container) {
    this._container = container;

    autoBind(this);
  }

  async postReplyHandler(request, h) {
    const addReplyUseCase = this._container.getInstance(AddReplyCommentUseCase.name);

    const { id: ownerId } = request.auth.credentials;
    const { threadId, commentId } = request.params;

    const addedReply = await addReplyUseCase.execute(
      commentId,
      threadId,
      ownerId,
      request.payload,
    );

    const response = h.response({
      status: 'success',
      data: { addedReply },
    });
    response.code(201);
    return response;
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
