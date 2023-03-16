module.exports = function (request) {
    return {
      async sign(wallet) {
        return await request
          .get("sign", { wallet: wallet });
      },
       async check(wallet,sign_message) {
        return await request
          .get("check", { wallet: wallet,sign_message:sign_message },false,1);
      }
    };
  };
  