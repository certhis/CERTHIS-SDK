module.exports = function (request) {
  return {
    async one(address) {
      return await request
        .get("user", {wallet:address});
    }
  };
};
