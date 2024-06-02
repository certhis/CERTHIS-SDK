module.exports = function (request) {
  var contract_cache = {};

  return {
    async one(contract_id) {
      if (contract_cache[contract_id]) {
        return contract_cache[contract_id];
      }
      contract_cache[contract_id] = await request.get("contract", {
        contract_id: contract_id,
      });
      return contract_cache[contract_id];
    },
    async many(params) {
      return await request.get("contracts", params);
    },
    async latest(chain_id) {
      var response = await request.get("contract", { latest: chain_id });
      contract_cache[response.id] = response;
      return response;
    },
  };
};
