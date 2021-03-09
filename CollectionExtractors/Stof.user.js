// ==UserScript==
// @name         VicText Collection Extractor - Stof
// @namespace    http://www.tgoff.me/
// @version      2021.03.09.1
// @description  Gets the names and codes from a Stof Collection
// @author       www.tgoff.me
// @match        *://www.stoffabrics.com/theme/*
// @match        *://www.stoffabrics.com/collection/*
// @match        *://www.stoffabrics.com/catalogsearch/result/*
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/tg-lib.js
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/collection-extract-lib.js
// @grant        GM_setClipboard
// @grant        GM_download
// @runat        document-idle
// ==/UserScript==

(function () {
	'use strict';
	createButtons();
})();

let stofRegEx = /([0-9]+)-([0-9]+)/;
let RegexEnum = {
	'Collection': 1,
	'ColourCode': 2,
};

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

function getItemObject(item) {
	let codeElement = item.querySelector('#grid-sku');
	if (!codeElement) {
		Notify.log('Code element not found!', item);
		return;
	}
	let givenCode = codeElement.innerText.trim().toUpperCase();

	stofRegEx.lastIndex = 0;
	let matches = stofRegEx.exec(givenCode);
	if (!matches || matches.length <= 1) {
		Notify.log('No matches found for Item!', item);
		return;
	}

	let prefix = ''; // Stof has no prefix

	let collectionCode = matches[RegexEnum.Collection];

	let colourCode = padWithZeros(matches[RegexEnum.ColourCode], 3);

	let colourName = '';

	let purchaseCode = formatPurchaseCode(givenCode.trim());

	let descElement = item.querySelector('.product-name > a');
	if (!descElement) {
		Notify.log('Description element not found!', item);
		return;
	}
	let givenDesc = descElement.innerText.trim();
	let patternName = '';

	let title = givenDesc.toTitleCase().replaceAll(collectionCode, '').trim();
	let special = '';

	let material = 'C100%';
	let width = { 'Measurement': '112', 'Unit': 'cm' };
	let repeat = '';

	let dates = getReleaseDates();

	return {
		'Prefix': prefix,
		'CollectionCode': collectionCode,
		'ColourCode': colourCode,
		'ColourName': colourName,
		'PurchaseCode': purchaseCode,
		'PatternName': patternName,
		'CollectionName': title,
		'SpecialNotes': special,
		'Material': material,
		'Width': width,
		'Repeat': repeat,
		'ReleaseDates': dates,
	};
}

function formatInformation(itemElement) {
	let item = getItemObject(itemElement);
	if (!item) return;

	let itemCode = formatItemCode(item.Prefix, item.CollectionCode + ' ' + item.ColourCode);

	let barCode = formatBarCode(itemCode);

	let company = getCompany();
	let widthString = item.Width.Measurement + item.Width.Unit;
	let description = formatSapDescription({ 'Colour': item.ColourName, 'Pattern': item.PatternName, 'Collection': company + ' ' + item.CollectionName, 'Special': item.SpecialNotes, 'Material': item.Material, 'Width': 'W' + widthString, 'Repeat': item.Repeat })

	let webName = item.CollectionName.replaceAll('["″]', 'in').toTitleCase();

	let relDateString = toReleaseString(item.ReleaseDates);
	let webDesc = formatWebDescription({ 'Collection': item.CollectionName, 'Notes': item.SpecialNotes, 'Fibre': item.Material, 'Width': widthString, 'Release': relDateString, 'Delivery From': item.ReleaseDates.Delivery });
	let delDateString = 'Not Given - ' + toDeliveryString(item.ReleaseDates);

	let result = { 'itemCode': itemCode, 'barCode': barCode, 'description': description, 'webName': webName, 'webDesc': webDesc, 'delDate': delDateString, 'purchaseCode': item.PurchaseCode, 'webCategory': item.CollectionName };
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