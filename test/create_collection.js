const certhis = require("./../index").init();

async function connectionAndCreate() {

  var web3 = await certhis.wallet.connect(
    "https://polygon-mumbai.infura.io/v3/56e93ff3382e494782c4d6e2d8d1c902",
    "0xc0afa1596a43442642db9be18378ce253d2d9539eb3474b87ff0d66bafb664a1"
  );

  var collection_object = {
    collection_name: "Test Collection",
    collection_symbol: "TEST",
    collection_type: true,
  };

  try {
    var collection = await certhis.collection.create(
      web3,
      876,
      collection_object,
      ["0x883f9048236a7Ab0DB1e352fe27760830BcC53B9"]
    );
    return collection;
  } catch (e) {
    console.log(e);
  }


}

async function createCollection() {
  var collection = await connectionAndCreate();
  console.log(collection);
}
createCollection();
