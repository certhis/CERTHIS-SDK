const certhis = require("./../index").init(null, "http://localhost:8787/");

async function get() {
  var chains = await certhis.chains.many({mainnet:1});
  console.log(chains);
}


get();