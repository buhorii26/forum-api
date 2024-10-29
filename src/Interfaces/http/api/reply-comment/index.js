const routes = require('./routes');
const ReplyCommentHandler = require('./handler');

module.exports = {
  name: 'reply',
  register: async (server, { container }) => {
    const replyHandler = new ReplyCommentHandler(container);
    server.route(routes(replyHandler));
  },
};
