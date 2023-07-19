module.exports = function (request) {
  return {
    async label(label_index) {
      return await request.get("stat/label", { label_index: label_index });
    },
    async user(wallet, mainnet) {
      return await request.get("stat/user", {
        wallet: wallet,
        mainnet: mainnet,
      });
    },
    async collection(collection_index) {
      return await request.get("stat/v2/collection", {
        collection_index: collection_index,
      });
    },

    async collection_graph(collection_index) {
      return await request.get("stat/collection/graph", {
        collection_index: collection_index,
      });
    },


  
  };
};
