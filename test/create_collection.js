const CerthisWallet = require("./../../CERTHIS-WALLET/index");
const certhis_wallet = CerthisWallet.init();
const certhis = require("./../index").init(certhis_wallet.getWeb3());

async function connectionAndCreate() {
  var web3Inject = await certhis.wallet.connect(
    "https://rpc-mumbai.maticvigil.com",
    "0xc0afa1596a43442642db9be18378ce253d2d9539eb3474b87ff0d66bafb664a1"
  );

  try {
    var collection = await certhis.collection.create({
      web3: web3Inject,
      collection_object: {
        collection_name: "Test Collection",
        collection_symbol: "TEST",
        collection_type: true,
      },

      whitelist: ["0x883f9048236a7Ab0DB1e352fe27760830BcC53B9"],
      mulParam: 4,
    });
    console.log(collection);
  } catch (e) {
    console.log(e);
  }
}

async function createCollection() {
  var collection = await connectionAndCreate();
  console.log(collection);
}
createCollection();
