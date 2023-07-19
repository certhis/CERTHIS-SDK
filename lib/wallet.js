module.exports = function (request,Web3) {
  return {
    async connect(rpc_url,secretPhrase) {
      const web3 = new Web3(rpc_url);
      await web3.eth.accounts.wallet.add(secretPhrase);
      web3.eth.transactionConfirmationBlocks = 3;
      web3.eth.transactionPollingInterval = 3000;
      return web3;
    }
  };
};
