const transaction = require("./transaction");

module.exports = function (request) {
  var nonce_array = [];

  var format = function (obj) {
    return {
      nft_id: obj.nft_id === undefined ? 0 : BigInt(obj.nft_id),
      collection_id:
        obj.collection_id === undefined ? 0 : BigInt(obj.collection_id),
      owner_address: obj.owner_address,
      creator_address: obj.creator_address,
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

  var get_proof = async function (collection_object = null, nft_id, address) {
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
          return web3.utils.soliditySha3(Number(x[0]), x[1], Number(x[2]));
        });

        var tree = new MerkleTree(leaves, web3.utils.keccak256, {
          sortPairs: true,
        });

        var root = tree.getRoot().toString("hex");

        leaf = web3.utils.soliditySha3(
          Number(leaf_split[0]),
          leaf_split[1],
          Number(leaf_split[2])
        );

        mint_proof.proof_price = tree.getHexProof(leaf);
      }

      if (
        collection.root !=
        "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
      ) {
        //check if address is in whitelist
        var whitelist = JSON.parse(collection.whitelist);

        if (whitelist.indexOf(address) == -1) {
          return resolve(false);
        }

        var leaves = whitelist.map((x) => {
          return web3.utils.soliditySha3(x);
        });

        var tree = new MerkleTree(leaves, web3.utils.keccak256, {
          sortPairs: true,
        });

        var root = tree.getRoot().toString("hex");

        var leaf = web3.utils.soliditySha3(current_address);

        mint_proof.proof_mint = tree.getHexProof(leaf);
      }

      resolve(mint_proof);
    });
  };

  var many = async function (params, data_disable = null) {
    return await request.get("nfts", params, false, data_disable);
  };

  var mint = async function (
    web3,
    to_wallet,
    collection_id,
    nft,
    mint_proof,
    price_value = 0,
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
      const Collection = require("./collection")(request);
      const Contract = require("./contract")(request);

      var collection = await Collection.one(collection_id);

      //detecting collection type to generate mint proof

      var mint_proof = await get_proof(collection, nft.nft_id, current_address);

      if (mint_proof == false) {
        return reject("Address not in whitelist or proof error");
      }

      var contract = await Contract.one(collection.contract_id);

      web3.eth.defaultOptions = {
        maxFeePerGas: web3.utils.toWei("2", "ether"),
      };

      var contract_collection = new web3.eth.Contract(
        JSON.parse(contract.collection_abi),
        collection.collection_address
      );

      var safemint = contract_collection.methods.safeMint(
        to_wallet,
        nft,
        mint_proof
      );
      var obj_trans = {
        from: current_address,
        value: price_value,
      };

      const functionGasFees = await safemint.estimateGas(obj_trans);

      const currentGasPrice = await web3.eth.getGasPrice();
      obj_trans.gasLimit = Math.ceil(functionGasFees * mulParam);
      obj_trans.gas = functionGasFees;
      obj_trans.gasPrice = Math.ceil(currentGasPrice);
      var conf = 0;
      var nft_id = null;

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
      let confirmationFlag = false;
      try {
        await safemint
          .send(obj_trans)
          .on("confirmation", async function (confirmation, receipt) {
            conf = conf + 1;
            if (conf == 3 && !confirmationFlag) {
              confirmationFlag = true;

              nft_id = receipt.events.Transfer.returnValues.tokenId;

              var nft_object = {};
              try {
                var nft_object = await one(
                  nft_id,
                  collection.collection_address,
                  collection.chain_id,
                  1
                );
                resolve({
                  nft_object: nft_object,
                  transactionHash: receipt.transactionHash,
                });
              } catch (err) {
                nft_object.nft_id = nft_id;
                resolve({
                  nft_object: nft_object,
                  transactionHash: receipt.transactionHash,
                });
              }
            }
          })

          .catch((err) => {
            nonce_array[current_address + "_" + nonce] =
              nonce_array[current_address + "_" + nonce] - 1;
            reject(err);
          });
      } catch (err) {
        nonce_array[current_address + "_" + nonce] =
          nonce_array[current_address + "_" + nonce] - 1;
        reject(err);
      }
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
