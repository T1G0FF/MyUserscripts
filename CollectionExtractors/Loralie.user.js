// ==UserScript==
// @name         VicText Collection Extractor - Loralie
// @namespace    http://www.tgoff.me/
// @version      2.0
// @description  Gets the names and codes from a Loralie Collection
// @author       www.tgoff.me
// @match        *://www.loraliedesigns.com/collections/*
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/tg-lib.js?token=9461da6511cdd88e73bb62eb66eaa3a0a201bef0
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/collection-extract-lib.js?token=9461da6511cdd88e73bb62eb66eaa3a0a201bef0
// @grant        GM_setClipboard
// @grant        GM_download
// @runat        document-idle
// ==/UserScript==

(function () {
	'use strict';
	createButtons();
})();

function getCompany() {
	let company = 'Loralie Designs';
	return company;
}

function getTitleElement() {
	let titleElement = document.querySelector('.section-header__title');
	return titleElement;
}

function getCollection() {
	let collection = document.querySelectorAll('#CollectionSection .grid__item');
	return collection;
}

function formatInformation(item) {
	let title = getTitle();
	let company = getCompany();

	let givenName = item.querySelector('.grid-link__title').innerText;
	let givenCode = item.querySelector('.product__img').getAttribute('src').match(/\/products\/(.+?)_/)[1];

	let itemCode = formatItemCode('LL', givenCode.replaceAll('-', ' '));
	let barCode = formatBarCode(itemCode);
	let purchaseCode = formatPurchaseCode(givenCode);
	let material = 'C100%';
	let width = title.includes('108') ? 'W108in' : 'W45in';

	let webName = givenName.toTitleCase() + ' - ' + title;
	let webDesc = material + ' - ' + width;
	let description = webName + ' - ' + webDesc;

	let delDate = "Not Given - " + getDeliveryString();

	let result = { 'itemCode': itemCode, 'barCode': barCode, 'description': description, 'webName': webName, 'webDesc': webDesc, 'delDate': delDate, 'purchaseCode': purchaseCode };
	return result;
}

// https://cdn.shopify.com/s/files/1/0469/8865/products/691-799_220x.jpg
// https://cdn.shopify.com/s/files/1/0469/8865/products/691-799_1024x1024@2x.jpg
function formatImage(item) {
	// The Loralie site stores a list of multiple image sizes in size order, we grab the largest one.
	let srcSet = item.querySelector('.product__img').getAttribute('data-srcset');
	if (!srcSet) return undefined;
	let setSplit = srcSet.split(', ');
	let lineSplit = setSplit[setSplit.length - 1].split(' ');
	let result = getAbsolutePath(lineSplit[0]);
	return result;
}