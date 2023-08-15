module.exports = function (request,Web3 = {}) {
  return {
    async connect(rpc_url,secretPhrase) {
      return new Promise(async (resolve, reject) => {
      var web3 = new Web3(new Web3.providers.HttpProvider(rpc_url));
      var account = web3.eth.accounts.privateKeyToAccount(secretPhrase);
      web3.eth.accounts.wallet.add(account);
      web3.eth.defaultAccount = account.address;
      console.log("Connected to wallet : " + web3.eth.defaultAccount);
      return resolve(web3);
      });
    }
  };
};
