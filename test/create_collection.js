const CerthisWallet = require("./../../CERTHIS-WALLET/index");
const certhis_wallet = CerthisWallet.init();
const certhis = require("./../index").init(certhis_wallet.getWeb3());

async function connectionAndCreate() {
  var web3Inject = await certhis.wallet.connect(
    "https://rpc-mumbai.maticvigil.com",
    "0xa66e53f2408f0120d466b4b3d360672da637610d2b4e09ba3d98f797c9fb890c"
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
