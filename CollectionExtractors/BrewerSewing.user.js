// ==UserScript==
// @name         # VicText Collection Extractor - Brewer Sewing
// @namespace    http://www.tgoff.me/
// @version      2023.03.21.1
// @description  Gets the names and codes from a Brewer Sewing search
// @author       www.tgoff.me
// @match        *://brewersewing.com/*
// @match        *://*.brewersewing.com/*
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/tg-lib.js
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/collection-extract-lib.js
// @grant        GM_setClipboard
// @grant        GM_download
// @run-at       document-idle
// ==/UserScript==

let isSearch = false;
(function () {
	'use strict';
	setTimeout(function () {
		let buttonLocation = document.querySelector("form#aspnetForm");
		createButtons(buttonLocation, "beforebegin");
	}, 1000);
})();

function getCompany() {
	let company = '';
	return company;
}

function getTitleElement() {
	let titleElement = document.querySelector('h1.entity-page-header');
	if (!titleElement) {
		titleElement = document.querySelector('span.resultCount > span.numResults > strong');
		isSearch = true;
	}
	return titleElement;
}

function getCollection() {
	let collection = document.querySelectorAll('div#productResults article.productResult');
	return collection;
}

function formatInformation(item) {
	let infoElement = item.querySelector('header > h3 > a');
	let skuElement = infoElement.querySelector('span.productSku');
	let givenCode = skuElement ? skuElement.innerText.trim() : '';
	let descElement = infoElement.getTextNodeValue();
	let givenDesc = descElement ? descElement.trim() : '';
	let givenUnit = infoElement.querySelector('div').innerText.replace('Unit: ', '').trim();

	let description = givenDesc + ' - ' + givenUnit;

	let result = { 'itemCode': givenCode, 'barCode': '', 'description': description, 'webName': givenDesc, 'webDesc': givenUnit, 'delDate': '', 'purchaseCode': '' };
	return result;
}

// https://www.brewersewing.com/images/Product/icon/CLQ2006.jpg
// https://www.brewersewing.com/images/Product/large/CLQ2006.jpg
function formatImage(item) {
	let imageUrl = item.querySelector('p.productResultImage img').getAttribute('src');
	imageUrl = imageUrl.replace('/icon/', '/large/');
	return imageUrl;
}