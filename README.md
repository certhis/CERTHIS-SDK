# CERTHIS-SDK
JS library for communicating with the Certhis API. 

<a href="https://app.swaggerhub.com/apis-docs/Certhis.IO/certhis/1.0.0">API SERVICES</a>

✅ Get Data From API<br />
🔜 Creating Label , Deploying Collection From SDK  <br />
🔜 Mint NFT<br />
🔜 Buy NFT<br />
  

## Installation

```sh
$ npm i certhis
```

### Using CommonJS

Requirements (Node.js >= 8.0.0).
```js
const Certhis = require('certhis').init();
```

## Usage

```js
const Certhis = require('certhis').init();
(async () => {
     const getLabel = await Certhis.label.one(470);
     console.log(getLabel);
})();
```

## API

### Accounts

#### Label

Get single Label object by label_index

```js
await Certhis.label.one(label_index);
```

Get List of Label Object  

```js
await Certhis.label.many(params);
```

#### Collection

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


#### Contract

Get Single Contract Object by contract_id

```js
await Certhis.contract.one(contract_id);
```


Get Full List of Available Contracts Object

```js
await Certhis.contract.many();
```

#### NFT

Get Single NFT Object by nft_id and collection_address

```js
await Certhis.nft.one(nft_id,collection_address);
```


Get List of NFT Object

```js
await Certhis.nft.many(params);
```

#### User

Get Single User Object by wallet_address

```js
await Certhis.user.one(wallet_address);
```

#### Statistics

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


#### Transactions

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
await Certhis.transaction.nft(nft_id,collection_address);
```
