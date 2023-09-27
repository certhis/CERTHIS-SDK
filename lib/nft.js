const transaction = require("./transaction");
const Queue = require("better-queue");

module.exports = function (request, Web3, params) {
  var nonce_array = [];
  var gas_price_tpm = [];
  var collection_info_tmp = [];
  var contract_info_tmp = [];

  const { multiplyBigIntByFloat, decodeLogsUntilEventName } =
    require("./extra")(Web3);

  var format = function (obj) {
    return {
      nft_id: obj.nft_id === undefined ? 0 : BigInt(obj.nft_id),
      collection_id:
        obj.collection_id === undefined ? 0 : BigInt(obj.collection_id),
      owner_address:
        obj.owner_address === undefined
          ? "0x0000000000000000000000000000000000000000"
          : obj.owner_address,
      creator_address:
        obj.creator_address === undefined
          ? "0x0000000000000000000000000000000000000000"
          : obj.creator_address,
      token_uri: obj.token_uri,
      sellable_type:
        obj.sellable_type === undefined ? 0 : BigInt(obj.sellable_type),
      sellable_currency:
        obj.sellable_currency === undefined
          ? "0x0000000000000000000000000000000000000000"
          : obj.sellable_currency,
      sellable_amount:
        obj.sellable_amount === undefined ? 0 : BigInt(obj.sellable_amount),
      royalties:
        obj.royalties === undefined || isNaN(obj.royalties) ? 0 : obj.royalties,
      affiliation:
        obj.affiliation === undefined
          ? "0x0000000000000000000000000000000000000000"
          : obj.affiliation,
      minted: true,
    };
  };

  var one = async function (
    nft_id,
    collection_address,
    chain_id,
    force = null
  ) {
    return await request.get("nft", {
      nft_id: nft_id,
      chain_id: chain_id,
      collection_address: collection_address,
      refresh: force,
    });
  };

  var oneForce = async function (
    nft_id,
    collection_address,
    chain_id,
    force = null
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        return await request.get("nft", {
          nft_id: nft_id,
          chain_id: chain_id,
          collection_address: collection_address,
          refresh: force,
        });
      } catch (e) {
        //wait 2 seconds and try again
        await new Promise((resolve) => setTimeout(resolve, 2000));

        return await oneForce(nft_id, collection_address, chain_id, force);
      }
    });
  };

  var get_proof = async function (
    collection_object = null,
    nft_id,
    current_address,
    web3
  ) {
    const { MerkleTree } = require("merkletreejs");
    return new Promise(async (resolve, reject) => {
      var collection = collection_object;
      if (collection_object == null) {
        return resolve(false);
      }

      var mint_proof = {
        price_for_mint: collection.price_for_mint,
        currency_for_mint: collection.currency_for_mint,
        proof_price: [],
        proof_mint: [
          "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
        ],
      };

      if (collection.collection_full == 2) {
        var array_merkle = JSON.parse(collection.collection_price);

        var leaf_split = array_merkle[nft_id].split(":");

        mint_proof.price_for_mint = leaf_split[2];

        mint_proof.currency_for_mint = leaf_split[1];

        var leaves = array_merkle.map((x) => {
          x = x.split(":");

          return web3.utils.soliditySha3(
            { type: "uint", value: x[0] },
            { type: "address", value: x[1] },
            { type: "uint", value: x[2] }
          );
        });

        var tree = new MerkleTree(leaves, web3.utils.keccak256, {
          sortPairs: true,
        });

        var root = tree.getRoot().toString("hex");

        leaf = web3.utils.soliditySha3(
          { type: "uint", value: leaf_split[0] },
          { type: "address", value: leaf_split[1] },
          { type: "uint", value: leaf_split[2] }
        );

        mint_proof.proof_price = tree.getHexProof(leaf);

        if (tree.verify(tree.getProof(leaf), leaf, root) != true) {
          return resolve(false);
        }
      }

      if (
        collection.root !=
        "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
      ) {
        //check if address is in whitelist
        try {
          var whitelist = JSON.parse(collection.whitelist);
        } catch (e) {
          var whitelist = [];
        }

        if (whitelist.indexOf(current_address) == -1) {
          return resolve(false);
        }

        var leaves = whitelist.map((x) => {
          return web3.utils.soliditySha3({ type: "address", value: x });
        });

        var tree = new MerkleTree(leaves, web3.utils.keccak256, {
          sortPairs: true,
        });

        var root = tree.getRoot().toString("hex");

        var leaf = web3.utils.soliditySha3({
          type: "address",
          value: current_address,
        });

        mint_proof.proof_mint = tree.getHexProof(leaf);
        if (tree.verify(tree.getProof(leaf), leaf, root) != true) {
          return resolve(false);
        } else {
          resolve(mint_proof);
        }
      }

      return resolve(mint_proof);
    });
  };

  var many = async function (params, data_disable = null) {
    return await request.get("nfts", params, false, data_disable);
  };

  const mint_queue = new Queue(async function (input, cb) {
    var web3 = input.web3;
    var to_wallet = input.to_wallet;
    var collection_index = input.collection_index;
    var nft = input.nft;
    var price_value = input.price_value;
    var mulParam = input.mulParam;

    let current_address;

    try {
      current_address = web3.eth.accounts.wallet[0].address;
    } catch (e) {
      [current_address] = await web3.eth.getAccounts();
    }

    const Collection = require("./collection")(request);
    const Contract = require("./contract")(request);

    if (collection_info_tmp[collection_index] == undefined) {
      collection_info_tmp[collection_index] = {};
      var collection = await Collection.one(collection_index);
      collection_info_tmp[collection_index] = {
        collection: collection,
        timestamp: Date.now(),
      };
    } else {
      var collection = collection_info_tmp[collection_index].collection;
    }

    if (Date.now() - collection_info_tmp[collection_index].timestamp > 5000) {
      var collection = await Collection.one(collection_index);
      collection_info_tmp[collection_index] = {
        collection: collection,
        timestamp: Date.now(),
      };
    }

    const mint_proof = await get_proof(
      collection,
      nft.nft_id,
      current_address,
      web3
    );

    if (!mint_proof) {
      return cb("Address not in whitelist or proof error", null);
    }

    if (contract_info_tmp[collection.contract_id] == undefined) {
      contract_info_tmp[collection.contract_id] = {};
      var contract = await Contract.one(collection.contract_id);
      contract_info_tmp[collection.contract_id] = {
        contract: contract,
        timestamp: Date.now(),
      };
    }

    if (
      Date.now() - contract_info_tmp[collection.contract_id].timestamp >
      5000
    ) {
      var contract = await Contract.one(collection.contract_id);
      contract_info_tmp[collection.contract_id] = {
        contract: contract,
        timestamp: Date.now(),
      };
    } else {
      var contract = contract_info_tmp[collection.contract_id].contract;
    }

    const contract_collection = new web3.eth.Contract(
      JSON.parse(contract.collection_abi),
      collection.collection_address
    );

    const safemint = contract_collection.methods.safeMint(
      to_wallet,
      format(nft),
      mint_proof
    );

    var obj_trans = {
      from: current_address,
    };

    if (price_value > 0) {
      obj_trans.value = price_value;
    }

    var functionGasFees = 3000000;
    try {
      functionGasFees = await safemint.estimateGas(obj_trans);
    } catch (e) {
      var functionGasFees = 3000000;
    }

    if (functionGasFees == undefined || functionGasFees == null) {
      var functionGasFees = 3000000;
    }

    if (gas_price_tpm[current_address] == undefined) {
      gas_price_tpm[current_address] = {};

      try {
        var gasPrice = await web3.eth.getGasPrice();
        gas_price_tpm[current_address] = {
          gasPrice: gasPrice,
          timestamp: Date.now(),
        };
      } catch (e) {
        return cb(e, null);
      }
    }

    obj_trans.gas = functionGasFees;
    if (Date.now() - gas_price_tpm[current_address].timestamp > 10000) {
      obj_trans.gasPrice = await web3.eth.getGasPrice();

      gas_price_tpm[current_address] = {
        gasPrice: obj_trans.gasPrice,
        timestamp: Date.now(),
      };
    } else {
      obj_trans.gasPrice = gas_price_tpm[current_address].gasPrice;
    }

    obj_trans.gasLimit = multiplyBigIntByFloat(functionGasFees, mulParam);

    try {
      if (nonce_array[current_address] == undefined) {
        nonce_array[current_address] = Number(
          await web3.eth.getTransactionCount(current_address, "pending")
        );
      } else {
        nonce_array[current_address] = nonce_array[current_address] + 1;
      }
    } catch (e) {
      return cb(e, null);
    }

    if (
      nonce_array[current_address] == undefined ||
      nonce_array[current_address] == null ||
      isNaN(nonce_array[current_address])
    ) {
      nonce_array[current_address] = 1;
    }

    // Send the signed transaction
    let confirmationsFlag = false;
    obj_trans.data = safemint.encodeABI();
    obj_trans.to = collection.collection_address;
    obj_trans.nonce = BigInt(nonce_array[current_address]);
    try {
      const signedTransaction = await web3.eth.accounts.signTransaction(
        obj_trans,
        web3.eth.accounts.wallet[0].privateKey
      );

      await web3.eth
        .sendSignedTransaction(signedTransaction.rawTransaction)
        .on("transactionHash", (hash) => {
           cb(null, "sent");
        })
        .on("confirmation", async ({ confirmations, receipt }) => {
          if (
            confirmations >= params.confirm_need &&
            confirmationsFlag == false
          ) {
            confirmationsFlag = true;
            const get_token_id = decodeLogsUntilEventName(
              receipt.logs,
              JSON.parse(contract.collection_abi),
              "Transfer",
              "tokenId",
              web3
            );

            if (get_token_id == null || get_token_id == undefined) {
              return cb("failed to resolve nft id", null);
            }

            const nft_id = get_token_id[0];

            try {
              const nft_object = await one(
                nft_id,
                collection.collection_address,
                collection.chain_id,
                1
              );

              return cb(null, {
                done: true,
                nft_object: nft_object,
                transactionHash: receipt.transactionHash,
              });
            } catch (err) {
              return cb(null, {
                done: true,
                nft_object: { nft_id: nft_id },
                transactionHash: receipt.transactionHash,
              });
            }
          }
        })
        .on("error", (err) => {
          nonce_array[current_address] = nonce_array[current_address] - 1;

          return cb(err, null);
        })
        .catch((err) => {
          nonce_array[current_address] = nonce_array[current_address] - 1;

          return cb(err, null);
        });
    } catch (e) {
      nonce_array[current_address] = nonce_array[current_address] - 1;

      return cb(e, null);
    }
  });

  const mint = async ({
    web3,
    to_wallet,
    collection_index,
    nft,
    price_value = 0,
    mulParam = 1,
  }) => {
    return new Promise(async (resolve, reject) => {
      mint_queue.push(
        {
          web3: web3,
          to_wallet: to_wallet,
          collection_index: collection_index,
          nft: nft,
          price_value: price_value,
          mulParam: mulParam,
        },
        async (error, result) => {
          if (error) {
            return resolve(error);
          } else {
            if (result.done == true) {
              return resolve(result);
            }
          }
        }
      );
    });
  };

  return {
    one,
    many,
    mint,
    get_proof,
    format,
  };
};
