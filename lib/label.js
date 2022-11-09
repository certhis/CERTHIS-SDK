module.exports = function (request) {
  return {
    async one(label_index) {
      return await request
        .get("label", { label_index: label_index });
    },
    async many(params) {
      return await request
        .get("labels", params);
    }
  };
};
