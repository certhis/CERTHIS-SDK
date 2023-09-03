const CerthisWallet = require("./../../CERTHIS-WALLET/index");
const certhis_wallet = CerthisWallet.init();
const certhis = require("./../index").init(certhis_wallet.getWeb3());

async function connectionAndCreate() {
  var web3Inject = await certhis.wallet.connect(
    "https://rpc-mumbai.maticvigil.com",
    "0xc0afa1596a43442642db9be18378ce253d2d9539eb3474b87ff0d66bafb664a1"
  );

  try {
    var label = await certhis.label.create({
      web3: web3Inject,
      label_object: {
        label_id : 1,
        creator_address: "0x883f9048236a7Ab0DB1e352fe27760830BcC53B9",
      },
      mulParam: 2,
    });

    return label;
  } catch (e) {
    console.log(e);
  }
}

async function createLabel() {
  var label = await connectionAndCreate();
  console.log(label);
}
createLabel();
