module.exports = function (request, Web3 = {}, params) {
  return {
    async connect(rpc_url, secretPhrase) {
      return new Promise(async (resolve, reject) => {
     
        const web3 = new Web3(new Web3.providers.HttpProvider(rpc_url));
     
        //add account 
        web3.eth.accounts.wallet.add(secretPhrase);
        
        //set default account
        web3.eth.defaultAccount = web3.eth.accounts.wallet[0].address;

        web3.setConfig({
          transactionConfirmationBlocks: params.confirm_need,
          transactionPollingInterval: params.pollingInterval,
        });
        web3.eth.setConfig({
          transactionConfirmationBlocks: params.confirm_need,
          transactionPollingInterval: params.pollingInterval,
        });

        resolve(web3);
      });
    },
  };
};
