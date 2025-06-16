// ==UserScript==
// @name         # VicText Collection Extractor - Isacord Thread
// @namespace    http://www.tgoff.me/
// @version      2021.10.25.1
// @description  Gets the names and codes from a Isacord Thread Range
// @author       www.tgoff.me
// @match        *://isacordthread.com/category/*
// @match        *://*.isacordthread.com/category/*
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/tg-lib.js
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/collection-extract-lib.js
// @grant        GM_setClipboard
// @grant        GM_download
// @run-at       document-idle
// ==/UserScript==

(function () {
	'use strict';
	createButtons();
})();

function getCompany() {
	let company = 'Mettler';
	return company;
}

function getTitleElement() {
	let titleElement = document.querySelector('div.categorylongdesc table tr:nth-child(1) td:nth-child(2) font');
	return titleElement;
}

function getCollection() {
	let collection = document.querySelectorAll('table.itemtable td.itemcell');
	return collection;
}

function formatInformation(itemElement) {
	let codeElement = itemElement.querySelector('div.product-form > div');
	if (!codeElement) {
		Notify.log('Code element not found!', itemElement);
		return;
	}
	let givenCode = codeElement.innerText.replace('Item #', '').trim();

	let nameElement = itemElement.querySelector('h1');
	if (!nameElement) {
		Notify.log('Name element not found!', itemElement);
		return;
	}
	let givenDesc = nameElement.innerText;

	let itemCode = formatItemCode('I', givenCode.replace('-', ' '));
	let barCode = formatBarCode(itemCode);

	let description = givenDesc.trim();

	let result = { 'itemCode': itemCode, 'barCode': barCode, 'description': description, 'webName': '', 'webDesc': '', 'delDate': '', 'purchaseCode': givenCode };
	return result;
}


// https://isacordthread.com/products/2922-0003_th.jpg
// https://isacordthread.com/products/2922-0003.jpg
async function formatImage(itemElement) {
	let imageUrl = itemElement.querySelector('img.item_image').getAttribute('src');
	imageUrl = imageUrl.replace('_th.jpg', '.jpg');
	return imageUrl;
}