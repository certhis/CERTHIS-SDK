"use strict";
const label = require("./label");
const collection = require("./collection");
const contract = require("./contract");
const nft = require("./nft");
const user = require("./user");
const stat = require("./stat");
const transaction = require("./transaction");
const wallet = require("./wallet");
const sign = require("./sign");
const extra = require("./extra");

/**
 * @module certhis-sdk
 */

module.exports = function (Web3, api = "https://api.certhis.io/", params = {}) {
  if (params.confirm_need == undefined) {
    params.confirm_need = 1;
  }

  if (params.pollingInterval == undefined) {
    params.pollingInterval = 1000;
  }

  //transactionBlockTimeout
  if (params.transactionBlockTimeout == undefined) {
    params.transactionBlockTimeout = 100;
  }

  //transactionPollingTimeout
  if (params.transactionPollingTimeout == undefined) {
    params.transactionPollingTimeout = 3000;
  }

  var axios = require("axios").default;
  var request = require("./request")(axios, api);

  /** @lends module:certhis-sdk */
  return {
    /**
     * @namespace
     */
    label: label(request, Web3, params),
    collection: collection(request, Web3, params),
    contract: contract(request),
    wallet: wallet(request, Web3, params),
    nft: nft(request, Web3, params),
    user: user(request),
    stat: stat(request),
    transaction: transaction(request),
    sign: sign(request),
    check: sign(request),
    extra: extra(Web3),
  };
};
