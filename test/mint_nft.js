const certhis = require("./../index").init();

async function getweb3(wallet_address, rpc, wallet_pass) {
  //wallet to init ex on mumbai
  var wallet_address = wallet_address;
  var web3 = await certhis.wallet.connect(rpc, wallet_pass);
  return web3;
}

async function MintNft(web3, mint_wallet, collection_id, nft) {
  var nft_minted = await certhis.nft.mint(
    web3,
    mint_wallet,
    collection_id,
    nft
  );
  return nft_minted;
}

async function launch() {
  var web3 = await getweb3(
    "0x883f9048236a7Ab0DB1e352fe27760830BcC53B9",
    "https://rpc-mumbai.maticvigil.com",
    "0xc0afa1596a43442642db9be18378ce253d2d9539eb3474b87ff0d66bafb664a1"
  );

  var mint_wallet = "0x883f9048236a7Ab0DB1e352fe27760830BcC53B9";

  //nft object
  var nft = await MintNft(web3, mint_wallet, 1203, {
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
