const CerthisWallet = require("./../../CERTHIS-WALLET/index");
const certhis_wallet = CerthisWallet.init();
const certhis = require("./../index").init(
  certhis_wallet.getWeb3(),
  (api = "https://api.certhis.io/"),
  (params = {})
);

async function initWalletConnection(rpc, wallet_pass) {
  return new Promise(async (resolve, reject) => {
    //wallet to init ex on mumbai
    var web3 = await certhis.wallet.connect(rpc, wallet_pass);
    resolve(web3);
  });
}


async function mint(web3Inject,mint_wallet){

  var nft_minted = await certhis.nft.mint({
    web3: web3Inject,
    to_wallet: mint_wallet,
    collection_index: 1342,
    nft: {
      owner_address: mint_wallet,
      token_uri:
        "https://certhis.mypinata.cloud/ipfs/QmSRE5iGJCnNMti5t6RukoUxPccX3ouDRwKx7Sy5jupcNR/28.json",
    },
    price_value: 0,
    mulParam: 2,
  });

  console.log("nft minted", nft_minted.nft_object.nft_id);
}

async function launch() {


let web3Inject = await initWalletConnection(
  "https://polygon-mumbai.infura.io/v3/56e93ff3382e494782c4d6e2d8d1c902",
  "0xc0afa1596a43442642db9be18378ce253d2d9539eb3474b87ff0d66bafb664a1"
);
var mint_wallet = "0x883f9048236a7Ab0DB1e352fe27760830BcC53B9";


  try {
    //execute 10 times
    for (let i = 0; i < 50; i++) {
      try {
        console.log("mint in process for " + mint_wallet, i);
        mint(web3Inject,mint_wallet);
      } catch (e) {
        console.log(e);
      }
    }
  } catch (e) {
    console.log(e);
  }


}

launch();
