const certhis = require("./../index").init();

//get connection wallet
async function connectionAndCreate() {
	var contract = await certhis.contract.one(52);

	var wallet_address = "0x883f9048236a7Ab0DB1e352fe27760830BcC53B9";
	var web3 = await certhis.wallet.connect(
		contract.infura_link,
		"0xc0afa1596a43442642db9be18378ce253d2d9539eb3474b87ff0d66bafb664a1"
	);

	var label_object = {
		label_id: 0,
		label_tax: 100,
		label_payout: wallet_address,
		label_tax_mint: 100,
		label_payout_mint: wallet_address,
		creator_address: "0x0000000000000000000000000000000000000000",
		affiliation: "0x0000000000000000000000000000000000000000",
		affiliation_tax: 0,
        affiliation_tax_mint: 0,
	};
	var label = await certhis.label.create(
		web3,
		contract,
		wallet_address,
		label_object
	);

	return label;
}

async function getData() {
	var get_data = await connectionAndCreate();
	console.log(get_data);
}
getData();
