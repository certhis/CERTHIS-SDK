module.exports = function (request) {
  return {
    async user(user_address,offset_id) {
      return await request
        .get("transaction/user", { user: user_address,offset_id:offset_id });
    },
     async label(label_index,offset_id) {
      return await request
        .get("transaction/label", { label_index: label_index,offset_id:offset_id });
    },
     async collection(collection_index,offset_id,update = null) {
      return await request
        .get("transaction/collection", { collection_index: collection_index,type,offset_id:offset_id, update: update });
    },

    async collection_v2(params) {
      return await request
        .get("transaction/collection", params);
    },

      async nft(nft_id,collection_address,chain_id, offset_id) {
      return await request
        .get("transaction/nft", { nft_id: nft_id,chain_id: chain_id, collection_address:collection_address,offset_id:offset_id });
    },
  };
};
