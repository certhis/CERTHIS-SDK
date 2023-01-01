module.exports = function (request) {
  return {
    async one(nft_id,collection_address,chain_id) {
      return await request
        .get("nft", { nft_id: nft_id, chain_id:chain_id, collection_address:collection_address });
    },
    
    async many(params) {
      return await request
        .get("nfts", params);
    }
  };
};
