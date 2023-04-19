module.exports = function (request) {
  var nonce_array = [];

  var format_collection = function (obj, contract_id = null) {
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
      collection_certhis_tax: 0,
      collection_certhis_tax_mint: 0,
    };

    if (contract_id > 50 || contract_id == null) {
      return_obj.check_contract = "0x0000000000000000000000000000000000000000";
    }

    return return_obj;
  };

  var one = async function (
    collection_index = null,
    collection_id = null,
    contract_id = null
  ) {
    if (collection_id != null) {
      return await request.get("collection", {
        collection_id: collection_id,
        contract_id: contract_id,
      });
    } else {
      return await request.get("collection", {
        collection_index: collection_index,
      });
    }
  };

  var update_collection = async function (
    web3,
    collection_object,
    collection_index = null,
    collection_id = null,
    contract_id = null,
    custom_sign = null
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

      contract_certhis.methods
        .get_collection(collection.collection_id)
        .call()
        .then(async (collection_obj) => {
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
            var conf = 0;

            var balance = await web3.eth.getBalance(current_address);
            balance = web3.utils.fromWei(String(balance));

            web3.eth.defaultOptions = {
              maxFeePerGas: web3.utils.toWei('2', 'ether')
            };

            const currentGasPrice = await web3.eth.getGasPrice();
            var humaingf = web3.utils.toWei(
              String(BigInt(functionGasFees)),
              "wei"
            );
            var gasPriceInWei = web3.utils.toWei(
              String(BigInt(currentGasPrice)),
              "wei"
            );
            humaingf = BigInt(humaingf) * BigInt(gasPriceInWei);
            humaingf = web3.utils.fromWei(String(humaingf), "ether");
            let confirmationFlag = false;

          

            if (humaingf > balance && force_balance == null) {
              nonce_array[current_address + "_" + nonce] =
              nonce_array[current_address + "_" + nonce] - 1;
              return reject({ err: "Insuffisant funds " });
            } else {

              try {
              await manage_collection
                .send({
                  from: current_address,
                  nonce: nonce_array[current_address + "_" + nonce],
                  gas: functionGasFees,
                  gasPrice: currentGasPrice,
                  gasLimit: Math.ceil(functionGasFees * mulParam)
                })
                .on("confirmation", async function (confirmation, receipt) {
                  conf = conf + 1;
                  if (conf == 3 && !confirmationFlag) {
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
                  console.log(err);
                  nonce_array[current_address + "_" + nonce] =
                  nonce_array[current_address + "_" + nonce] - 1;
                  return reject({ err: "Error transaction" + err });
                });

              } catch (e) {
                console.log(e);
                nonce_array[current_address + "_" + nonce] =
                nonce_array[current_address + "_" + nonce] - 1;
                return reject({ err: "Error transaction" + e });
              }

            }
          }
        });
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
    async many(params) {
      return await request.get("collections", params);
    },
    async create(
      web3,
      label_index,
      collection_object,
      whitelist = [],
      prices = [],
      custom_sign = null,
      force_balance = null,
      mulParam = 1
    ) {
      try {
        var accounts = web3.eth.accounts.wallet[0];
        var current_address = accounts.address;
      } catch (e) {
        var accounts = await web3.eth.getAccounts();
        var current_address = accounts[0];
      }

      return new Promise(async (resolve, reject) => {
        const { MerkleTree } = require("merkletreejs");
        const Label = require("./label")(request);
        const Collection = require("./collection")(request);
        const Contract = require("./contract")(request);
        var label = await Label.one(label_index);
        var contract = await Contract.one(label.contract_id);
        var contract_certhis = new web3.eth.Contract(
          JSON.parse(contract.certhis_abi),
          contract.contract_address
        );

        collection_object.label_id = label.label_id;
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

        collection_object = format_collection(collection_object);

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

        var manage_collection = contract_certhis.methods.manage_collection(
          false,
          collection_object.label_id,
          collection_object,
          collection_name,
          collection_symbol
        );

        const functionGasFees = await manage_collection.estimateGas({
          from: current_address,
        });

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
        var conf = 0;

        var balance = await web3.eth.getBalance(current_address);
        balance = web3.utils.fromWei(String(balance));

        const currentGasPrice = await web3.eth.getGasPrice();
        var humaingf = web3.utils.toWei(String(BigInt(functionGasFees)), "wei");
        var gasPriceInWei = web3.utils.toWei(
          String(BigInt(currentGasPrice)),
          "wei"
        );
        humaingf = BigInt(humaingf) * BigInt(gasPriceInWei);
        humaingf = web3.utils.fromWei(String(humaingf), "ether");
        let confirmationFlag = false;

        if (humaingf > balance && force_balance == null) {
          return reject({ err: "Insuffisant funds " });
          nonce_array[current_address + "_" + nonce] =
          nonce_array[current_address + "_" + nonce] - 1;
        } else {
          try {
            await manage_collection
              .send({
                from: current_address,
                nonce: nonce_array[current_address + "_" + nonce],
                gas: functionGasFees,
                gasPrice: currentGasPrice,
                gasLimit: Math.ceil(functionGasFees * mulParam),
                maxFeePerGas: web3.utils.toWei('2', 'ether')
              })
              .on("confirmation", async function (confirmation, receipt) {
                conf = conf + 1;
                if (conf == 3 && !confirmationFlag) {
                  confirmationFlag = true;

                  //sign with wallet
                  var collection_id =
                    receipt.events.return_collection_id.returnValues
                      ._collection_id;

                  if (
                    collection_object.collection_type == 1 &&
                    whitelist.length > 0
                  ) {
                    collection_post.whitelist = JSON.stringify(whitelist);
                  }

                  if (Object.keys(collection_post).length > 0) {
                    await update_collection(
                      web3,
                      collection_post,
                      null,
                      collection_id,
                      contract.id,
                      custom_sign
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
              })
              .catch((err) => {
                console.log(err);
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
    },
  };
};
