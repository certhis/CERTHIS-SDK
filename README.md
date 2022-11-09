# CERTHIS-SDK
JS library for communicating with the Certhis API.

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

Get single Label object

```js
await certhis.label.one(470);
```

Get List Label object

```js
await certhis.label.many(params);
```

#### getEtherBalanceMulti

Get Ether balance for multiple addresses in a single call.

```js
etherscan.getEtherBalanceMulti({
    address: ['0x00', '0x01'],
    tag: 'latest' // Optional, default 'latest'
});
```

#### getTxList

Get a list of `normal` transactions by address.

```js
etherscan.getTxList({
    address: '0x00',
    startblock: 0, // Optional
    endblock: 0, // Optional
    sort: 'desc' // Optional, default 'asc'
});
```

#### getTxListInternal

Get a list of `internal` transactions by address.

```js
etherscan.getTxListInternal({
    address: '0x00',
    startblock: 0, // Optional
    endblock: 0, // Optional
    sort: 'desc' // Optional, default 'asc'
});
```
