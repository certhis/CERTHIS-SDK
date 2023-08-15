const transaction = require("./transaction");

module.exports = function (request, Web3, params) {
  var nonce_array = [];

  const { multiplyBigIntByFloat, decodeLogsUntilEventName } =
    require("./extra")(Web3);

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
        var whitelist = JSON.parse(collection.whitelist);

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

  const mint = async (
    web3,
    to_wallet,
    collection_index,
    nft,
    price_value = 0,
    mulParam = 1
  ) => {
    return new Promise(async (resolve, reject) => {
      let current_address;

      try {
        current_address = web3.eth.accounts.wallet[0].address;
      } catch (e) {
        [current_address] = await web3.eth.getAccounts();
      }

      const Collection = require("./collection")(request);
      const Contract = require("./contract")(request);

      const collection = await Collection.one(collection_index);

      const mint_proof = await get_proof(
        collection,
        nft.nft_id,
        current_address,
        web3
      );

      if (!mint_proof) {
        return resolve("Address not in whitelist or proof error");
      }

      const contract = await Contract.one(collection.contract_id);
      web3.eth.defaultOptions = {
        maxFeePerGas: web3.utils.toWei("2", "ether"),
      };

      const contract_collection = new web3.eth.Contract(
        JSON.parse(contract.collection_abi),
        collection.collection_address
      );

      console.log("contract_collection", collection);
      console.log("mint_proof", mint_proof);

      const safemint = contract_collection.methods.safeMint(
        to_wallet,
        nft,
        mint_proof
      );

      const functionGasFees = await safemint.estimateGas();

      const obj_trans = {
        from: current_address,
        value: price_value,
        gas: functionGasFees,
        data: safemint.encodeABI(),
        gasPrice: multiplyBigIntByFloat(await web3.eth.getGasPrice(), mulParam),
        gasLimit: multiplyBigIntByFloat(functionGasFees, mulParam),
      };

      console.log(obj_trans);

      try {
        obj_trans.nonce = BigInt(
          await web3.eth.getTransactionCount(current_address, "pending")
        );
      } catch (e) {
        obj_trans.nonce = BigInt(1);
      }

      // Sign the transaction locally
      const signedTransaction = await web3.eth.accounts.signTransaction(
        obj_trans,
        web3.eth.accounts.wallet[0].privateKey
      );

      // Send the signed transaction
      let confirmationsFlag = false;
      web3.eth
        .sendSignedTransaction(signedTransaction.rawTransaction)
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
              "tokenId"
            );

            console.log(get_token_id);

            const nft_id = get_token_id[0];

            try {
              const nft_object = await one(
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
              resolve({
                nft_object: { nft_id: nft_id },
                transactionHash: receipt.transactionHash,
              });
            }
          }
        })
        .on("error", (err) => {
          console.log(err);
          reject(err);
        });
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
