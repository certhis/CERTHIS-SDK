const certhis = require("./../index").init();

async function connectionAndCreate() {
  var web3 = await certhis.wallet.connect(
    "https://rpc.ankr.com/polygon_mumbai",
    "0xc0afa1596a43442642db9be18378ce253d2d9539eb3474b87ff0d66bafb664a1"
  );

  try {
    var label = await certhis.label.create(web3, 52, {});
  } catch (e) {
    console.log(e);
  }

  return label;
}

async function createLabel() {
  var label = await connectionAndCreate();
  console.log(label);
}
createLabel();
