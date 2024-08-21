const CerthisWallet = require("./../../CERTHIS-WALLET/index");
const certhis_wallet = CerthisWallet.init();
const web3 = certhis_wallet.getWeb3();

const certhis = require("./../index").init(web3);

function signed_signature() {
  return new Promise(async function (resolve, reject) {
    var current_address = "0xc447604746f31D245d9803852Fe53Dd9E339c503";
    var wallet_pass =
      "0xfc3f00a1acf34b12b38a91c89fc502b4851ed6f053be087b88286490966c7db0";
    var provider = await certhis.wallet.connect(
      "http://localhost/",
      wallet_pass
    );

    var get_signature = await certhis.sign.sign(current_address);

    var wallet_sign = await provider.eth.sign(
      get_signature.signature,
      current_address
    );

    var check_sign = await certhis.sign.check(
      current_address,
      wallet_sign.signature
    );

    return resolve({signed_signature : wallet_sign.signature, check_sign: check_sign});
  });
}

async function test() {
  var signature = await signed_signature();
  console.log(signature);
}

test();
