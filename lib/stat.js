module.exports = function (request) {
  return {
    async label(label_index) {
      return await request
        .get("stat/label", { label_index: label_index });
    },
     async user(wallet) {
      return await request
        .get("stat/user", { wallet: wallet });
    },
     async collection(collection_index) {
      return await request
        .get("stat/collection", { collection_index: collection_index });
    },
  };
};
