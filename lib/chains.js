module.exports = function (request) {
    return {
      async many(params) {
        return await request.get("chains", params);
      }
  };
};