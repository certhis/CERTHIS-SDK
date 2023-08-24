const CerthisWallet = require("./../../CERTHIS-WALLET/index");
const certhis_wallet = CerthisWallet.init();
const certhis = require("./../index").init(certhis_wallet.getWeb3());

async function initWalletConnection(rpc, wallet_pass) {
  return new Promise(async (resolve, reject) => {
    //wallet to init ex on mumbai
    var web3 = await certhis.wallet.connect(rpc, wallet_pass);
    resolve(web3);
  });
}

async function launch() {
  let web3Inject = await initWalletConnection(
    "https://rpc-mumbai.maticvigil.com",
    "0xc0afa1596a43442642db9be18378ce253d2d9539eb3474b87ff0d66bafb664a1"
  );

  var mint_wallet = "0x883f9048236a7Ab0DB1e352fe27760830BcC53B9";

  try {
    //execute 10 times
    for (let i = 0; i < 10; i++) {
      var nft_minted = certhis.nft.mint({
        web3: web3Inject,
        to_wallet: mint_wallet,
        collection_index: 979,
        nft: {
          owner_address: mint_wallet,
          token_uri:
            "https://certhis.mypinata.cloud/ipfs/QmSRE5iGJCnNMti5t6RukoUxPccX3ouDRwKx7Sy5jupcNR/28.json",
        },
        price_value: 0,
        mulParam: 2,
      });
      console.log(nft_minted);
    }
  } catch (e) {
    console.log(e);
  }

  return true;
}

launch();
