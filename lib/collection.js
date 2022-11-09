module.exports = function (request) {
  return {
    async one(collection_index) {
      return await request
        .get("collection", { collection_index: collection_index });
    },
    async attributes(collection_index) {
      return await request
        .get("collection/attributes", { collection_index: collection_index });
    },
     async minted(collection_index) {
      return await request
        .get("collection/minted", { collection_index: collection_index });
    },
    async many(params) {
      return await request
        .get("collections", params);
    }
  };
};
