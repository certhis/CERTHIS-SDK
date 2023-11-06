module.exports = function (request) {
    return {
      async sign(wallet,header_signature) {
        return await request
          .get("sign", { wallet: wallet,header_signature:header_signature });
      },
       async check(wallet,sign_message) {
        return await request
          .get("check", { wallet: wallet,sign_message:sign_message },false,1);
      }
    };
  };
  