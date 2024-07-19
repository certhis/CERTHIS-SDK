module.exports = function (request) {
  return {
    async sign(wallet, header_signature) {
      return await request.get("sign", {
        wallet: wallet,
        header_signature: header_signature,
      });
    },

    async SafeSign(wallet, header_signature) {
      return await request.get("sign", {
        wallet: wallet,
        header_signature: header_signature,
        secure_sign: 1,
      });
    },
    async check(wallet, sign_message, sign_id = null) {
      return await request.get(
        "check",
        { wallet: wallet, sign_message: sign_message, sign_id: sign_id },
        false,
        1
      );
    },
  };
};
