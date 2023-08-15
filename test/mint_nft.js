const CerthisWallet = require("./../../CERTHIS-WALLET/index");
const certhis_wallet = CerthisWallet.init();
const certhis = require("./../index").init(certhis_wallet.getWeb3(), "http://localhost:8787/");

async function initWalletConnection(rpc, wallet_pass) {
  return new Promise(async (resolve, reject) => {
    //wallet to init ex on mumbai
    var web3 = await certhis.wallet.connect(rpc, wallet_pass);
    resolve(web3);
  });
}

async function MintNft(web3, mint_wallet, collection_id, nft) {
  var nft_minted = await certhis.nft.mint(
    web3,
    mint_wallet,
    collection_id,
    nft,0,2

  );
  return nft_minted;
}

async function launch() {
  let web3Inject = await initWalletConnection(
    "https://polygon-mumbai-bor.publicnode.com",
    "0xc0afa1596a43442642db9be18378ce253d2d9539eb3474b87ff0d66bafb664a1"
  );

  var mint_wallet = "0x883f9048236a7Ab0DB1e352fe27760830BcC53B9";

  //nft object

  var nft = await MintNft(web3Inject, mint_wallet, 956, {
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
  });

  console.log(nft);
}

launch();
