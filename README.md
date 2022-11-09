# CERTHIS-SDK
JS library for communicating with the Certhis API.

✅ Get Data From API
🔜 Creating Label , Deploying Collection From SDK  
🔜 Mint NFT
🔜 Buy NFT
  

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
     const getLabel = await certhis.label.one(470);
     console.log(getLabel);
})();
```

## API

### Accounts

#### Label

Get single Label object by label_index

```js
await certhis.label.one(label_index);
```

Get List of Label Object  

```js
await certhis.label.many(params);
```

#### Collection

Get single Collection object by collection_index

```js
await certhis.collection.one(collection_index);
```

Get List of Collection Object

```js
await certhis.collection.many(params);
```

Get Attributes Collection List by collection_index

```js
await certhis.collection.attributes(collection_index);
```

Get number of minted NFT on Collection by collection_index

```js
await certhis.collection.minted(collection_index);
```


#### Contract

Get Single Contract Object by contract_id

```js
await certhis.contract.one(contract_id);
```


Get Full List of Available Contracts Object

```js
await certhis.contract.many();
```

#### NFT

Get Single NFT Object by nft_id and collection_address

```js
await certhis.nft.one(nft_id,collection_address);
```


Get List of NFT Object

```js
await certhis.nft.many(params);
```

#### User

Get Single User Object by wallet_address

```js
await certhis.user.one(wallet_address);
```

#### Statistics

Get Label Statistics object by label_index

```js
await certhis.stat.label(label_index);
```


Get Collection Statistics object by collection_index

```js
 await certhis.stat.collection(collection_index);
```


Get User Statistics object by wallet_address

```js
await certhis.stat.user(wallet_address);
```
