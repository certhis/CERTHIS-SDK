"use strict";
const label = require("./label");
const collection = require("./collection");
const contract = require("./contract");
const nft = require("./nft");
const user = require("./user");
const stat = require("./stat");
const transaction = require("./transaction");


/**
 * @module certhis-sdk
 */

module.exports = function () {


	var axios = require('axios');
	var request = require('./request')(axios,"https://api.certhis.io/");


	/** @lends module:certhis-sdk */
	return {
		/**
		 * @namespace
		 */
		label: label(request),
		collection: collection(request),
		contract: contract(request),
		nft: nft(request),
		user: user(request),
		stat: stat(request),
		transaction: transaction(request)

	};
};
