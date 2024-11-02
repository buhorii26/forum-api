const autoBind = require('auto-bind');
const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');

class CommentHandler {
  constructor(container) {
    this._container = container;

    autoBind(this);
  }

  async postCommentHandler(request, h) {
    const addCommentUseCase = this._container.getInstance(
      AddCommentUseCase.name,
    );
    const { id: ownerId } = request.auth.credentials;
    const { threadId } = request.params;
    const content = request.payload;

    const addedComment = await addCommentUseCase.execute(
      threadId,
      ownerId,
      content,
    );

    const response = h.response({
      status: 'success',
      data: { addedComment },
    });
    response.code(201);
    return response;
  }

  async deleteCommentHandler(request, h) {
    const deleteCommentUseCase = this._container.getInstance(
      DeleteCommentUseCase.name,
    );
    const { id: ownerId } = request.auth.credentials;

    const { threadId, commentId } = request.params;

    await deleteCommentUseCase.execute({ threadId, commentId, ownerId });

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = CommentHandler;
