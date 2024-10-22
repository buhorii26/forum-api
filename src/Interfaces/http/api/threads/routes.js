const routes = (handler) => [
  {
    method: 'POST',
    path: '/threads',
    handler: (request, h) => handler.postThreadHandler(request, h),
    options: {
      auth: 'forumapi_jwt',
      payload: {
        allow: 'application/json',
        parse: true,
      },
    },
  },
];

module.exports = routes;
