module.exports = function (request, Web3, params) {
  var nonce_array = [];

  const { multiplyBigIntByFloat, decodeLogsUntilEventName } =
    require("./extra")(Web3);

  var format_label = function (obj, contract_id = 0) {
    if (contract_id < 35) {
      return {
        label_id: obj.label_id == undefined ? BigInt(0) : BigInt(obj.label_id),
        label_tax: obj.label_tax == undefined ? 0 : obj.label_tax,
        label_payout:
          obj.label_payout == undefined
            ? "0x0000000000000000000000000000000000000000"
            : obj.label_payout,
        label_tax_mint:
          obj.label_tax_mint == undefined ? 0 : obj.label_tax_mint,
        label_payout_mint:
          obj.label_payout_mint == undefined
            ? "0x0000000000000000000000000000000000000000"
            : obj.label_payout_mint,
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
        label_id: obj.label_id == undefined ? BigInt(0) : BigInt(obj.label_id),
        label_tax: obj.label_tax == undefined ? 0 : obj.label_tax,
        label_payout:
          obj.label_payout == undefined
            ? "0x0000000000000000000000000000000000000000"
            : obj.label_payout,
        label_tax_mint:
          obj.label_tax_mint == undefined ? 0 : obj.label_tax_mint,
        label_payout_mint:
          obj.label_payout_mint == undefined
            ? "0x0000000000000000000000000000000000000000"
            : obj.label_payout_mint,
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
    async create({
      web3: web3,
      contract_id: contract_id,
      label_object: label_object,
      force_balance: force_balance = null,
      mulParam: mulParam = 1,
    }) {
      try {
        current_address = web3.eth.accounts.wallet[0].address;
      } catch (e) {
        [current_address] = await web3.eth.getAccounts();
      }

      const Contract = require("./contract")(request);

      return new Promise(async (resolve, reject) => {
        if (contract_id != null) {
          var contract = await Contract.one(contract_id);
        } else {
          var chain = await web3.eth.getChainId();
          var contract = await Contract.latest(chain);
        }

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
          maxFeePerGas: web3.utils.toWei("2", "ether"),
        };

        const currentGasPrice = await web3.eth.getGasPrice();
        obj_trans.gasLimit = multiplyBigIntByFloat(functionGasFees, mulParam);
        obj_trans.gas = functionGasFees;
        obj_trans.gasPrice = multiplyBigIntByFloat(currentGasPrice, 1);

        try {
          var nonce = Number(
            await web3.eth.getTransactionCount(current_address, "pending")
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

        obj_trans.nonce = BigInt(nonce_array[current_address + "_" + nonce]);

        var error = false;
        var label_id = null;

        var conf = 0;
        let confirmationFlag = false;
        obj_trans.data = manage_label.encodeABI();

        try {
          const signedTransaction = await web3.eth.accounts.signTransaction(
            {
              from: current_address,
              to: contract.contract_address,
              nonce: BigInt(nonce_array[current_address + "_" + nonce]),
              gas: functionGasFees,
              gasPrice: multiplyBigIntByFloat(currentGasPrice, mulParam),
              gasLimit: multiplyBigIntByFloat(functionGasFees, mulParam),
              data: manage_label.encodeABI(),
            },
            web3.eth.accounts.wallet[0].privateKey
          );

          await web3.eth
            .sendSignedTransaction(signedTransaction.rawTransaction)
            .on(
              "confirmation",
              async ({ confirmations, receipt, latestBlockHash }) => {
                if (confirmations >= params.confirm_need && !confirmationFlag) {
                  confirmationFlag = true;
                  //sign with wallet
                  var label_id = decodeLogsUntilEventName(
                    receipt.logs,
                    JSON.parse(contract.certhis_abi),
                    "return_label_id",
                    "_label_id"
                  );

                  label_id = label_id[0];
                  var label_object = await one(null, label_id, contract.id);
                  return resolve({
                    label_object: label_object,
                    transactionHash: receipt.transactionHash,
                  });
                }
              }
            )
            .on("error", (err) => {
              nonce_array[current_address + "_" + nonce] =
                nonce_array[current_address + "_" + nonce] - 1;
              return reject({ err: "Error transaction 1" + err });
            })
            .catch((err) => {
              nonce_array[current_address + "_" + nonce] =
                nonce_array[current_address + "_" + nonce] - 1;
              return reject({ err: "error sending transaction hash" });
            });
        } catch (e) {
          nonce_array[current_address + "_" + nonce] =
            nonce_array[current_address + "_" + nonce] - 1;
          return reject({ err: "error sending transaction hash" });
        }
      });
    },
    one,
    async many(params) {
      return await request.get("labels", params);
    },
  };
};
