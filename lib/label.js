module.exports = function (request) {
  return {
    async create(web3, contract, wallet, label_object) {
      var generate_receipt = false;
      var current_hash = null;
      var load_contract = new web3.eth.Contract(
        JSON.parse(contract.certhis_abi),
        contract.contract_address
      );
      var manage_label = load_contract.methods.manage_label(
        false,
        label_object
      );
      const functionGasFees = await manage_label.estimateGas({
        from: wallet,
      });

      var balance = await web3.eth.getBalance(wallet);
      if (functionGasFees > balance) {
        return "Insufficient fund on " + wallet;
      } else {
        var error = false;
        var label_id = null;

        try {
          await manage_label
            .send({ from: wallet, gasLimit: functionGasFees })
            .on("transactionHash", function (hash) {
              current_hash = hash;
            })
            .on("receipt", function (receipt) {
              if (generate_receipt == false) {
                generate_receipt = true;
                label_id =
                  receipt.events.return_label_id.returnValues._label_id;
              }
            })
            .catch(() => {
              error = "error sending transaction hash";
            })
            .then(() => {
              return true;
            });

          return {
            error: error,
            label_id: label_id,
            transactionHash: current_hash,
          };
        } catch (e) {
          return e;
        }
      }
    },
    async one(label_index) {
      return await request.get("label", { label_index: label_index });
    },
    async many(params) {
      return await request.get("labels", params);
    },
  };
};
