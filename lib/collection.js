module.exports = function (request, Web3, params) {
  var nonce_array = [];
  const { multiplyBigIntByFloat, decodeLogsUntilEventName } =
    require("./extra")(Web3);
  var format_collection = function (obj, contract_id = null, v2 = null) {
    var return_obj = {
      label_id: obj.label_id == undefined ? 0 : obj.label_id,
      collection_id: obj.collection_id == undefined ? 0 : obj.collection_id,
      collection_address:
        obj.collection_address == undefined
          ? "0x0000000000000000000000000000000000000000"
          : obj.collection_address,
      creator_address: obj.creator_address,
      collection_uri: obj.collection_uri == undefined ? "" : obj.collection_uri,
      collection_type:
        obj.collection_type == undefined ? 0 : obj.collection_type,
      collection_tax: obj.collection_tax == undefined ? 0 : obj.collection_tax,
      collection_payout: obj.collection_payout,
      mintable_activate:
        obj.mintable_activate == undefined ? 0 : obj.mintable_activate,
      currency_for_mint:
        obj.currency_for_mint == undefined
          ? "0x0000000000000000000000000000000000000000"
          : obj.currency_for_mint,
      price_for_mint: obj.price_for_mint == undefined ? 0 : obj.price_for_mint,
      collection_payout_mint: obj.collection_payout_mint,
      collection_full:
        obj.collection_full == undefined ? 0 : obj.collection_full,
      root:
        obj.root == undefined
          ? "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"
          : obj.root,
      root_price:
        obj.root_price == undefined
          ? "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"
          : obj.root_price,
      mint_start: obj.mint_start == undefined ? 0 : obj.mint_start,
      mint_end: obj.mint_end == undefined ? 0 : obj.mint_end,
      sell_id: obj.sell_id == undefined ? 0 : obj.sell_id,
      max_mint: obj.max_mint == undefined ? 0 : obj.max_mint,
      max_mint_sell: obj.max_mint_sell == undefined ? 0 : obj.max_mint_sell,
      max_supply: obj.max_supply == undefined ? 0 : obj.max_supply,
      affiliation: obj.affiliation == undefined ? 0 : obj.affiliation,
      share_royalties:
        obj.share_royalties == undefined ? 0 : obj.share_royalties,
      tax_descativate:
        obj.tax_descativate == undefined
          ? "0x0000000000000000000000000000000000000000"
          : obj.tax_descativate,
      collection_certhis_tax:
        obj.collection_certhis_tax == undefined
          ? 0
          : obj.collection_certhis_tax,
      collection_certhis_tax_mint:
        obj.collection_certhis_tax_mint == undefined
          ? 0
          : obj.collection_certhis_tax_mint,
    };

    if (contract_id > 50 || contract_id == null) {
      return_obj.check_contract = "0x0000000000000000000000000000000000000000";
    }

    if (v2 != null) {
      return_obj.sbt_contract =
        obj.sbt_contract == undefined ? false : obj.sbt_contract;
      return_obj.burnable = obj.burnable == undefined ? false : obj.burnable;
    }

    return return_obj;
  };

  var one = async function (
    collection_index = null,
    collection_id = null,
    contract_id = null,
    update = null
  ) {
    //check if collection_index is object
    if (typeof collection_index == "object") {
      return await request.get("collection", collection_index);
    } else if (collection_id != null) {
      return await request.get("collection", {
        collection_id: collection_id,
        contract_id: contract_id,
        update: update,
      });
    } else {
      return await request.get("collection", {
        collection_index: collection_index,
        update: update,
      });
    }
  };

  var update_collection = async function (
    web3,
    collection_object,
    collection_index = null,
    collection_id = null,
    contract_id = null,
    custom_sign = null,
    mulParam = 1
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        var accounts = web3.eth.accounts.wallet[0];
        var current_address = accounts.address;
      } catch (e) {
        var accounts = await web3.eth.getAccounts();
        var current_address = accounts[0];
      }
      var signature = "";
      if (custom_sign != null) {
        signature = custom_sign;
      } else {
        const Sign = require("./sign")(request);

        var get_signature = await Sign.sign(current_address);

        try {
          signature = await web3.eth.sign(
            get_signature.signature,
            current_address
          );
        } catch (error) {
          signature = await web3.eth.personal.sign(
            get_signature.signature,
            current_address
          );
        }
      }

      if (collection_index != null) {
        var collection = await one(collection_index);
        contract_id = collection.contract_id;
        collection_id = collection.collection_id;
      }

      collection_object.collection_id = collection_id;
      collection_object.contract_id = contract_id;
      collection_object.wallet = current_address;
      collection_object.sign_message = signature;
      collection_object.wallet_match = current_address;
      var collection_post = await request.post("collection", collection_object);
      return resolve(collection_post);
    });
  };

  var update_whitelist = async function (
    web3,
    whitelist,
    collection_index,
    custom_sign = null,
    mulParam = 1
  ) {
    try {
      var accounts = web3.eth.accounts.wallet[0];
      var current_address = accounts.address;
    } catch (e) {
      var accounts = await web3.eth.getAccounts();
      var current_address = accounts[0];
    }
    var signature = "";
    if (custom_sign != null) {
      signature = custom_sign;
    } else {
      const Sign = require("./sign")(request);

      var get_signature = await Sign.sign(current_address);

      try {
        signature = await web3.eth.sign(
          get_signature.signature,
          current_address
        );
      } catch (error) {
        signature = await web3.eth.personal.sign(
          get_signature.signature,
          current_address
        );
      }
    }
    const { MerkleTree } = require("merkletreejs");
    var collection = await one(collection_index);
    var contract_id = collection.contract_id;
    var collection_id = collection.collection_id;

    const Contract = require("./contract")(request);
    var contract = await Contract.one(contract_id);
    return new Promise(async (resolve, reject) => {
      //generate root
      var leaves = whitelist.map((x) => {
        return web3.utils.soliditySha3(x);
      });

      var tree = new MerkleTree(leaves, web3.utils.keccak256, {
        sortPairs: true,
      });

      var root = "0x" + tree.getRoot().toString("hex");

      var contract_certhis = new web3.eth.Contract(
        JSON.parse(contract.certhis_abi),
        contract.contract_address
      );

      var collection_obj = await contract_certhis.methods
        .get_collection(collection.collection_id)
        .call();

      if (collection_obj.root == root) {
        var update_whitelist = await request.post("collection/whitelist", {
          collection_id: collection_id,
          contract_id: contract_id,
          wallet: current_address,
          sign_message: signature,
          wallet_match: current_address,
          whitelist: JSON.stringify(whitelist),
        });

        return resolve(update_whitelist);
      } else {
        collection_obj.root = root;

        var manage_collection = contract_certhis.methods.manage_collection(
          true,
          collection_obj.collection_id,
          collection_obj,
          "",
          ""
        );

        const functionGasFees = await manage_collection.estimateGas({
          from: current_address,
        });

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

        const currentGasPrice = await web3.eth.getGasPrice();

        var confirmationFlag = false;

        try {
          const signedTransaction = await web3.eth.accounts.signTransaction(
            {
              from: current_address,
              to: contract.contract_address,
              nonce: BigInt(nonce_array[current_address + "_" + nonce]),
              gas: functionGasFees,
              gasPrice: multiplyBigIntByFloat(currentGasPrice, mulParam),
              gasLimit: multiplyBigIntByFloat(functionGasFees, mulParam),
              data: manage_collection.encodeABI(),
            },
            web3.eth.accounts.wallet[0].privateKey
          );

          await web3.eth
            .sendSignedTransaction(signedTransaction.rawTransaction)
            .on("confirmation", async ({ confirmations, receipt }) => {
              if (
                confirmations >= params.confirm_need &&
                confirmationFlag == false
              ) {
                confirmationFlag = true;

                var update_whitelist = await request.post(
                  "collection/whitelist",
                  {
                    collection_id: collection_id,
                    contract_id: contract_id,
                    wallet: current_address,
                    sign_message: signature,
                    wallet_match: current_address,
                    whitelist: JSON.stringify(whitelist),
                  }
                );

                return resolve(update_whitelist);
              }
            })
            .catch((err) => {
              nonce_array[current_address + "_" + nonce] =
                nonce_array[current_address + "_" + nonce] - 1;
              return reject({ err: "Error transaction" + err });
            });
        } catch (e) {
          nonce_array[current_address + "_" + nonce] =
            nonce_array[current_address + "_" + nonce] - 1;
          return reject({ err: "Error transaction" + e });
        }
      }
    });
  };
  return {
    format_collection,
    update_whitelist,
    one,
    async attributes(collection_index) {
      return await request.get("collection/attributes", {
        collection_index: collection_index,
      });
    },
    async minted(collection_index) {
      return await request.get("collection/minted", {
        collection_index: collection_index,
      });
    },
    async many(params, data_disable = null) {
      return await request.get("collections", params, false, data_disable);
    },
    async create({
      web3: web3,
      contract_id: contract_id,
      label_index: label_index = null,
      collection_object: collection_object,
      whitelist: whitelist = [],
      prices: prices = [],
      custom_sign: custom_sign = null,
      force_balance: force_balance = null,
      mulParam: mulParam = 1,
    }) {
      let current_address;

      try {
        current_address = web3.eth.accounts.wallet[0].address;
      } catch (e) {
        [current_address] = await web3.eth.getAccounts();
      }

      return new Promise(async (resolve, reject) => {
        const { MerkleTree } = require("merkletreejs");
        const Label = require("./label")(request);
        const Collection = require("./collection")(request);
        const Contract = require("./contract")(request);

        if (label_index != null) {
          var label = await Label.one(label_index);
          collection_object.label_id = label.label_id;
          var contract = await Contract.one(label.contract_id);
        } else if (contract_id != null) {
          var contract = await Contract.one(contract_id);
        } else {
          var chain = await web3.eth.getChainId();
          var contract = await Contract.latest(chain);
        }

        var contract_certhis = new web3.eth.Contract(
          JSON.parse(contract.certhis_abi),
          contract.contract_address
        );

        var collection_name = collection_object.collection_name;
        var collection_symbol = collection_object.collection_symbol;

        var collection_post = {};
        if (collection_object.collection_logo != undefined) {
          collection_post.collection_logo = collection_object.collection_logo;
        }

        if (collection_object.collection_description != undefined) {
          collection_post.collection_description =
            collection_object.collection_description;
        }

        if (collection_object.collection_header != undefined) {
          collection_post.collection_header =
            collection_object.collection_header;
        }

        collection_object = format_collection(
          collection_object,
          contract.id,
          contract.v2
        );

        //collection private

        if (collection_object.collection_type == 1 && whitelist.length > 0) {
          var leaves = whitelist.map((x) => {
            return web3.utils.soliditySha3(x);
          });

          var tree = new MerkleTree(leaves, web3.utils.keccak256, {
            sortPairs: true,
          });
          collection_object.root = "0x" + tree.getRoot().toString("hex");
        } else {
          collection_object.root =
            "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";
        }

        //collection full 2 with custom prices
        if (collection_object.collection_full == 2 && prices.length > 0) {
          //generate root
          var leaves = prices.map((x) => {
            x = x.split(":");

            return web3.utils.soliditySha3(
              Number(x[0]),
              x[1],
              BigInt(x[2]).toString()
            );
          });

          var tree = new MerkleTree(leaves, web3.utils.keccak256, {
            sortPairs: true,
          });
          collection_object.root_price = "0x" + tree.getRoot().toString("hex");
        } else {
          collection_object.root_price =
            "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";
        }

        if (collection_object.creator_address == undefined) {
          collection_object.creator_address = current_address;
        }
        if (collection_object.collection_payout == undefined) {
          collection_object.collection_payout = current_address;
        }
        if (collection_object.collection_payout_mint == undefined) {
          collection_object.collection_payout_mint = current_address;
        }

        if (contract.v2 == 1) {
          var edit_ = 1;
          if (label_index != null) {
            edit_ = 0;
          }

          var manage_collection = contract_certhis.methods.manage_collection(
            edit_,
            collection_object.label_id,
            collection_object,
            collection_name,
            collection_symbol
          );
        } else {
          var manage_collection = contract_certhis.methods.manage_collection(
            false,
            collection_object.label_id,
            collection_object,
            collection_name,
            collection_symbol
          );
        }

        var functionGasFees = 3000000;
        try {
          functionGasFees = await manage_collection.estimateGas({
            from: current_address,
          });
        } catch (e) {
          var functionGasFees = 3000000;
        }

        if (functionGasFees == undefined || functionGasFees == null) {
          var functionGasFees = 3000000;
        }

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

        var balance = await web3.eth.getBalance(current_address);
        balance = web3.utils.fromWei(String(balance), "ether");

        var currentGasPrice = await web3.eth.getGasPrice();
        var confirmationFlag = false;
        try {
          const signedTransaction = await web3.eth.accounts.signTransaction(
            {
              from: current_address,
              to: contract.contract_address,
              nonce: BigInt(nonce_array[current_address + "_" + nonce]),
              gas: functionGasFees,
              gasPrice: multiplyBigIntByFloat(currentGasPrice, mulParam),
              gasLimit: multiplyBigIntByFloat(functionGasFees, mulParam),
              data: manage_collection.encodeABI(),
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
                  var collection_id = decodeLogsUntilEventName(
                    receipt.logs,
                    JSON.parse(contract.certhis_abi),
                    "return_collection_id",
                    "_collection_id"
                  );
                  collection_id = collection_id[0];
                  if (
                    collection_object.collection_type == 1 &&
                    whitelist.length > 0
                  ) {
                    collection_post.whitelist = JSON.stringify(whitelist);
                  }

                  if (Object.keys(collection_post).length > 0) {
                    var fetch_collection_object = await one(
                      null,
                      collection_id,
                      contract.id
                    );

                    await update_collection(
                      web3,
                      collection_post,
                      null,
                      collection_id,
                      contract.id,
                      custom_sign,
                      mulParam
                    );
                  }

                  var fetch_collection_object = await one(
                    null,
                    collection_id,
                    contract.id
                  );

                  return resolve({
                    collection_object: fetch_collection_object,
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
              return reject({ err: "Error transaction 2" + err });
            });
        } catch (e) {
          nonce_array[current_address + "_" + nonce] =
            nonce_array[current_address + "_" + nonce] - 1;
          return reject({ err: "Error transaction 3" + e });
        }
      });
    },
  };
};
