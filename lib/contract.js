module.exports = function (request) {
  return {
    async one(contract_id) {
      return await request
        .get("contract", { contract_id: contract_id });
    },
    async many(params) {
      return await request
        .get("contracts", params);
    }
  };
};
