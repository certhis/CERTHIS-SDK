const certhis = require("./../index").init();


//label
async function getOneLabel() {
	var getLabel = await certhis.label.one(470);
	return getLabel;
}

async function getManyLabels() {
	var getLabels = await certhis.label.many();
	return getLabels;
}

//collection
async function getOneCollection() {
	var getCollection = await certhis.collection.one(533);
    return getCollection;
}

async function getManyCollections() {
	var getCollections = await certhis.collection.many();
return getCollections;
}


async function getOneCollectionAttributes() {
	var getCollectionAttributes = await certhis.collection.attributes(400);
	return getCollectionAttributes;
}


async function getOneCollectionMinted() {
	var getOneCollectionMinted = await certhis.collection.minted(400);
	return getOneCollectionMinted;
}

//contract
async function getOneContract() {
	var getOneContract = await certhis.contract.one(30);
	return getOneContract;
}

async function getManyContracts() {
	var getManyContracts = await certhis.contract.many();
	return getManyContracts;
}


//nft 
async function getOneNFT() {
	var collection = await getOneCollection();
	var getOneNFT = await certhis.nft.one(0,collection.collection_address,collection.chain_id);
	return getOneNFT;
}

async function getManyNFTs() {
	var getManyNFTs = await certhis.nft.many({collection_index:400});
	return getManyNFTs;
}

//user

async function getOneUser() {
	var getOneUser = await certhis.user.one("0x7c78A82f71d6D7C9F14c4930F786F74Cd8171238");
	return getOneUser;
}


//stat 

async function getStatLabel() {
	var label = await getOneLabel();
	var getStatLabel = await certhis.stat.label(label.id);
	return getStatLabel;
}

async function getStatUser() {
	var user = await getOneUser();
	var getStatUser = await certhis.stat.user(user.address);
	return getStatUser;
}

async function getStatCollection() {
	var collection = await getOneCollection();
	var getStatCollection = await certhis.stat.collection(collection.id);
	return getStatCollection;
}



//transaction
async function getTransactionLabel() {
	var label = await getOneLabel();
	var getTransactionLabel = await certhis.transaction.label(label.id);
	return getTransactionLabel;
}

async function getTransactionUser() {
	var user = await getOneUser();
	var getTransactionUser = await certhis.transaction.user(user.address);
	return getTransactionUser;
}

async function getTransactionCollection() {
	var collection = await getOneCollection();
	var getTransactionCollection = await certhis.transaction.collection(collection.id);
	return getTransactionCollection;
}

async function getTransactionNFT() {
	var collection = await getOneCollection();
	var getTransactionNFT = await certhis.transaction.nft(0,collection.collection_address);
	return getTransactionNFT;
}





async function getData(){
var get_data = await getOneNFT()
console.log(get_data)
}
getData()
