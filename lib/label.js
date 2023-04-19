module.exports = function (request) {
  var nonce_array = [];

  var format_label = function (obj, contract_id = 0) {
    if (contract_id < 35) {
      return {
        label_id: obj.label_id == undefined ? 0 : obj.label_id,
        label_tax: obj.label_tax == undefined ? 0 : obj.label_tax,
        label_payout: obj.label_payout,
        label_tax_mint:
          obj.label_tax_mint == undefined ? 0 : obj.label_tax_mint,
        label_payout_mint: obj.label_payout_mint,
        creator_address:
          obj.creator_address == undefined
            ? "0x0000000000000000000000000000000000000000"
            : obj.creator_address,
        affiliation:
          obj.affiliation == undefined
            ? "0x0000000000000000000000000000000000000000"
            : obj.affiliation,
      };
    } else {
      return {
        label_id: obj.label_id == undefined ? 0 : obj.label_id,
        label_tax: obj.label_tax == undefined ? 0 : obj.label_tax,
        label_payout: obj.label_payout,
        label_tax_mint:
          obj.label_tax_mint == undefined ? 0 : obj.label_tax_mint,
        label_payout_mint: obj.label_payout_mint,
        creator_address:
          obj.creator_address == undefined
            ? "0x0000000000000000000000000000000000000000"
            : obj.creator_address,
        affiliation:
          obj.affiliation == undefined
            ? "0x0000000000000000000000000000000000000000"
            : obj.affiliation,
        affiliation_tax: 0,
        affiliation_tax_mint: 0,
      };
    }
  };

  var one = async function (
    label_index = null,
    label_id = null,
    contract_id = null
  ) {
    if (label_id != null) {
      return await request.get("label", {
        label_id: label_id,
        contract_id: contract_id,
      });
    } else {
      return await request.get("label", { label_index: label_index });
    }
  };
  return {
    format_label,
    async create(web3, contract_id, label_object, force_balance = null, mulParam = 1) {
      try {
        var accounts = web3.eth.accounts.wallet[0];
        var current_address = accounts.address;
      } catch (e) {
        var accounts = await web3.eth.getAccounts();
        var current_address = accounts[0];
      }

      const Contract = require("./contract")(request);

      return new Promise(async (resolve, reject) => {
        var contract = await Contract.one(contract_id);

        var load_contract = new web3.eth.Contract(
          JSON.parse(contract.certhis_abi),
          contract.contract_address
        );

        if (label_object.label_payout == undefined) {
          label_object.label_payout = current_address;
        }

        if (label_object.label_payout_mint == undefined) {
          label_object.label_payout_mint = current_address;
        }

        var manage_label = load_contract.methods.manage_label(
          false,
          format_label(label_object, contract.id)
        );

        try {
          var functionGasFees = await manage_label.estimateGas({
            from: current_address,
          });
        } catch (e) {
          return reject({ err: e });
        }

        var obj_trans = {
          from: current_address,
        };

        web3.eth.defaultOptions = {
          maxFeePerGas: web3.utils.toWei('2', 'ether')
        };

        
        const currentGasPrice = await web3.eth.getGasPrice();
        obj_trans.gasLimit = Math.ceil(functionGasFees * mulParam);
        obj_trans.gas = functionGasFees;
        obj_trans.gasPrice = Math.ceil(currentGasPrice);

        try {
          var nonce = await web3.eth.getTransactionCount(
            current_address,
            "pending"
          );
        } catch (e) {
          var nonce = 1;
        }

        if (nonce_array[current_address + "_" + nonce] == undefined) {
          nonce_array[current_address + "_" + nonce] = nonce;
        } else {
          nonce_array[current_address + "_" + nonce] =
            nonce_array[current_address + "_" + nonce] + 1;
        }
        obj_trans.nonce = nonce_array[current_address + "_" + nonce];

        var balance = await web3.eth.getBalance(current_address);

        balance = web3.utils.fromWei(String(balance));

        var humaingf = web3.utils.toWei(String(BigInt(functionGasFees)), "wei");
        var gasPriceInWei = web3.utils.toWei(
          String(BigInt(currentGasPrice)),
          "wei"
        );
        humaingf = BigInt(humaingf) * BigInt(gasPriceInWei);
        humaingf = web3.utils.fromWei(String(humaingf), "ether");

        if (humaingf > balance && force_balance == null) {
          nonce_array[current_address + "_" + nonce] =
          nonce_array[current_address + "_" + nonce] - 1;
          return reject({ err: "Insuffisant funds " });
        } else {
          var error = false;
          var label_id = null;

          var conf = 0;
          let confirmationFlag = false;

          try {
          await manage_label
            .send(obj_trans)
            .on("confirmation", async function (confirmation, receipt) {
              conf = conf + 1;
              if (conf > 3  && !confirmationFlag) {
                confirmationFlag = true;
                var label_id =
                  receipt.events.return_label_id.returnValues._label_id;
                var label_object = await one(null, label_id, contract_id);
                return resolve({
                  label_object: label_object,
                  transactionHash: receipt.transactionHash,
                });
              }
            })
            .catch((err) => {
              nonce_array[current_address + "_" + nonce] =
              nonce_array[current_address + "_" + nonce] - 1;
              return reject({ err: "error sending transaction hash" });
            });
          }
          catch (e) {
            nonce_array[current_address + "_" + nonce] =
            nonce_array[current_address + "_" + nonce] - 1;
            return reject({ err: "error sending transaction hash" });
          }

        }
      });
    },
    one,
    async many(params) {
      return await request.get("labels", params);
    },
  };
};
