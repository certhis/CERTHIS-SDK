# CERTHIS-SDK

The Certhis-SDK is a JavaScript library that enables developers to interact with the Certhis API, create accounts, deploy NFT collections, and mint NFTs.

<a  href="https://app.swaggerhub.com/apis-docs/Certhis.IO/certhis/1.0.0">API SERVICES</a>

✅ Get Data From API<br  />

✅ Creating Account (label)<br  />

✅ Create NFT Collection From SDK <br  />

✅ Mint NFT<br  />

## Installation

```sh

$ npm i certhis

```

### Using CommonJS

Requirements (Node.js >= 8.0.0) , WEBJS V4.0.1 .

```js
const { Web3 } = require("web3");
const Certhis = require("certhis").init(Web3);
```

## Usage

```js
(async () => {
  const getLabel = await Certhis.label.one(470);

  console.log(getLabel);
})();
```

# API

## Web3 Connector

Create web3 connection

```js
await Certhis.wallet.connect(rpc_url, wallet_passphrase);
```

## Account (Label)

**GET**

Get single Label object by label_index

```js
await Certhis.label.one(label_index);
```

Get List of Label Object

```js
await Certhis.label.many(params);
```

**CREATE**

Create Label with Web3 (wallet loaded), contract id and label object

```js
await Certhis.label.create(
  connection_web3,
  contract_id,
  label_object,
  force_balance
);
```

## Collection

**GET**

Get single Collection object by collection_index

```js
await Certhis.collection.one(collection_index);
```

Get List of Collection Object

```js
await Certhis.collection.many(params);
```

Get Attributes Collection List by collection_index

```js
await Certhis.collection.attributes(collection_index);
```

Get number of minted NFT on Collection by collection_index

```js
await Certhis.collection.minted(collection_index);
```

**DEPLOY**

Deploy NFT collection on label

```js
await Certhis.collection.create({
  web3: web3Inject,
  collection_object: {
    collection_name: "Test Collection",
    collection_symbol: "TEST",
    collection_type: true,
  },
  whitelist: ["0x883f9048236a7Ab0DB1e352fe27760830BcC53B9"],
});
```

## Contract

Get Single Contract Object by contract_id

```js
await Certhis.contract.one(contract_id);
```

Get Full List of Available Contracts Object

```js
await Certhis.contract.many();
```

## NFT

**GET**

Get Single NFT Object by nft_id , collection_address and chain_id

```js
await Certhis.nft.one(nft_id, collection_address, chain_id);
```

Get List of NFT Object

```js
await Certhis.nft.many(params);
```

**MINT**

Mint NFT with collection index

```js
await await certhis.nft.mint({
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
```

## User

Get Single User Object by wallet_address

```js
await Certhis.user.one(wallet_address);
```

## Statistic

Get Label Statistics object by label_index

```js
await Certhis.stat.label(label_index);
```

Get Collection Statistics object by collection_index

```js
await Certhis.stat.collection(collection_index);
```

Get User Statistics object by wallet_address

```js
await Certhis.stat.user(wallet_address);
```

## Transaction

Get Label Transaction object by label_index

```js
await Certhis.transaction.label(label_index);
```

Get User Transaction object by wallet_address

```js
await Certhis.transaction.user(wallet_address);
```

Get Collection Transaction object by collection_index

```js
await Certhis.transaction.collection(collection_index);
```

Get NFT Transaction object by nft_id and collection_address

```js
await Certhis.transaction.nft(nft_id, collection_address, chain_id, offset_id);
```

## Signature

Generate safe message signature from Certhis api

```js
await Certhis.sign.sign(wallet_address);
```

Check safe signature from Certhis api

```js
await Certhis.sign.check(wallet_address, sign_message);
```
