// ==UserScript==
// @name         VicText Collection Extractor - Stof
// @namespace    http://www.tgoff.me/
// @version      2.0
// @description  Gets the names and codes from a Stof Collection
// @author       www.tgoff.me
// @match        *://www.stoffabrics.com/theme/*
// @match        *://www.stoffabrics.com/collection/*
// @match        *://www.stoffabrics.com/catalogsearch/result/*
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
	let company = 'Stof';
	return company;
}

function getTitleElement() {
	let titleElement = document.querySelector('.page-title > h1');
	return titleElement;
}

function getCollection() {
	let collection = document.querySelectorAll('ul.products-grid li.item');
	return collection;
}

let stofRegEx = /([0-9]+)-([0-9]+)/;
let RegexEnum = {
	'Collection': 1,
	'ColourCode': 2,
};

function formatInformation(item) {
	let title = getTitle();
	let company = getCompany();
	let codeElement = item.querySelector('#grid-sku');
	let descElement = item.querySelector('.product-name > a');
	if (!codeElement || !descElement) {
		Notify.log('One or More Elements Not Found!', item);
		return;
	}

	let givenCode = codeElement.innerText.toUpperCase();
	let givenDesc = descElement.innerText;

	let itemCode = '';
	let barCode = '';
	let purchaseCode = '';
	let material = 'C100%';
	let width = 'W112cm';

	stofRegEx.lastIndex = 0;
	let matches = stofRegEx.exec(givenCode);
	if (!matches || matches.length <= 1) {
		Notify.log('No matches found for Item!', item);
		return;
	}

	let collectionCode = matches[RegexEnum.Collection];
	let colourCode = padWithZeros(matches[RegexEnum.ColourCode], 3);

	// Stof has no prefix
	itemCode = formatItemCode('', collectionCode + ' ' + colourCode);
	barCode = formatBarCode(itemCode);
	purchaseCode = formatPurchaseCode(givenCode);

	let nameString = givenDesc.toTitleCase().replaceAll(collectionCode, '').trim();

	let webName = givenDesc.replaceAll('["]', 'in').toTitleCase();
	let webDesc = nameString + ' - ' + material + ' - ' + width;
	let description = 'Stof ' + webName + ' - ' + webDesc;

	let delDate = 'Not Given' - getDeliveryString();

	let result = { 'itemCode': itemCode, 'barCode': barCode, 'description': description, 'webName': webName, 'webDesc': webDesc, 'delDate': delDate, 'purchaseCode': purchaseCode };
	return result;
}

// https://www.stoffabrics.com/media/catalog/product/cache/2/small_image/295x295/9df78eab33525d08d6e5fb8d27136e95/1/9/19-054_l_1.jpg
// https://www.stoffabrics.com/media/catalog/product/cache/2/image/1000x/040ec09b1e35df139433887a97daa66f/1/9/19-054_l_1.jpg
function formatImage(item) {
	let result = item.querySelector('div > a > img').getAttribute('src');
	result = result.replace('small_image/295x295', 'image/1000x');
	result = result.replace('9df78eab33525d08d6e5fb8d27136e95', '040ec09b1e35df139433887a97daa66f');
	return result;
}