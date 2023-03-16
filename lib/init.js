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


/**
 * @module certhis-sdk
 */

module.exports = function () {


	var axios = require("axios").default;
	var request = require('./request')(axios,"https://api.certhis.io/");
	var Web3 = require('web3');

	/** @lends module:certhis-sdk */
	return {
		/**
		 * @namespace
		 */
		label: label(request),
		collection: collection(request),
		contract: contract(request),
		wallet: wallet(request,Web3),
		nft: nft(request),
		user: user(request),
		stat: stat(request),
		transaction: transaction(request),
		sign: sign(request),
		check: sign(request)

	};
};
