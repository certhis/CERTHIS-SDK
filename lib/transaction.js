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
     async collection(collection_index,offset_id) {
      return await request
        .get("transaction/collection", { collection_index: collection_index,offset_id:offset_id });
    },

      async nft(nft_id,collection_address,offset_id) {
      return await request
        .get("transaction/nft", { nft_id: nft_id,collection_address:collection_address,offset_id:offset_id });
    },
  };
};
