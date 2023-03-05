const certhis = require("./../index").init();

async function connectionAndCreate() {
  var web3 = await certhis.wallet.connect(
    "https://rpc.ankr.com/polygon_mumbai",
    "0xc0afa1596a43442642db9be18378ce253d2d9539eb3474b87ff0d66bafb664a1"
  );

  try {
    console.log("account creation in process....");
    var label_object = await certhis.label.create(web3, 52, {});
    console.log("account created !");

    console.log("collection creation in process....");
    var collection_object = await certhis.collection.create(
      web3,
      label_object.label_object.id,
      {
        collection_name: "Test Collection",
        collection_symbol: "TEST",
        collection_type: true,
      },
      ["0x883f9048236a7Ab0DB1e352fe27760830BcC53B9"]
    );
    console.log("collection created !");

    console.log("mint nft in process....");
    var mint_wallet = "0x883f9048236a7Ab0DB1e352fe27760830BcC53B9";

    var nft_object = await certhis.nft.mint(
      web3,
      mint_wallet,
      collection_object.collection_object.id,
      {
        nft_id: 0,
        collection_id: 0,
        owner_address: mint_wallet,
        creator_address: mint_wallet,
        token_uri:
          "https://certhis.mypinata.cloud/ipfs/QmSRE5iGJCnNMti5t6RukoUxPccX3ouDRwKx7Sy5jupcNR/28.json",
        sellable_type: 0,
        sellable_currency: "0x0000000000000000000000000000000000000000",
        sellable_amount: 0,
        minted: true,
        royalties: 0,
        affiliation: "0x0000000000000000000000000000000000000000",
      }
    );

    console.log("nft minted !");
    return {
      label: label_object,
      collection: collection_object,
      nft: nft_object,
    };
  } catch (e) {
    console.log(e);
  }
}

async function createLabelCollectionNft() {
  var full_object = await connectionAndCreate();
  console.log(full_object);
}
createLabelCollectionNft();
