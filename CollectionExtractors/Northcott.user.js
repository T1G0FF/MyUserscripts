// ==UserScript==
// @name         VicText Collection Extractor - Northcott
// @namespace    http://www.tgoff.me/
// @version      2023.07.14.1
// @description  Gets the names and codes from a Northcott or Banyan Batiks Collection
// @author       www.tgoff.me
// @match        *://www.northcott.net/product-detail.aspx?*
// @match        *://www.northcott.com/product-detail.aspx?*
// @match        *://northcott.net/product-detail.aspx?*
// @match        *://northcott.com/product-detail.aspx?*
// @match        *://www.northcott.net/product.aspx?*
// @match        *://www.northcott.com/product.aspx?*
// @match        *://northcott.net/product.aspx?*
// @match        *://northcott.com/product.aspx?*
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/tg-lib.js
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/collection-extract-lib.js
// @grant        GM_setClipboard
// @grant        GM_download
// @run-at        document-idle
// ==/UserScript==

(function () {
	'use strict';
	createButtons();
})();

function getCompany() {
	let company = 'Northcott';
	return company;
}

function getTitleElement() {
	let titleElement = document.querySelector('#ContentPlaceHolderBody_div_ProductHeading');
	if (!titleElement) titleElement = document.querySelector('#ContentPlaceHolderBody_currentName');
	return titleElement;
}

function getCollection() {
	let collection = document.querySelectorAll('[id^="ContentPlaceHolderBody_parent"] img');
	if (!collection || collection.length < 1) {
		collection = document.querySelectorAll('#ContentPlaceHolderBody_Div_height > div.row > div > div.row > div > span > div.row > div > center > span > a > img');
	}
	if (!collection || collection.length < 1) {
		collection = document.querySelectorAll('#ContentPlaceHolderBody_OnlySwatches > div.row > div > center > span > a > img');
	}
	return collection;
}

function getAvailabilityDate() {
	let availableElement = document.querySelector('span.product-detail-sub-txt')
	if (availableElement) {
		let available = availableElement.innerText;
		if (available.includes('Available Now')) return undefined;
		let NorthcottDateRegEx = /(?:(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|(?:Nov|Dec)(?:ember)?), ([0-9]{4}))/;
		let matches = NorthcottDateRegEx.exec(available);
		if (matches && matches.length > 1) {
			return matches[1] + " " + matches[2];
		}
	}
	return undefined;
}

let NorthcottRegEx = /([a-zA-Z]*)([0-9]+)([a-zA-Z]*)-([0-9]+)/;
let RegexEnum = {
	'Prefix': 1, // Widebacks, Digital Prints
	'Collection': 2,
	'Suffix': 3, // Metallics
	'ColourCode': 4,
};

function formatInformation(item) {
	let title = getFormattedTitle();
	let company = getCompany();

	let givenCode = item.getAttribute('alt');

	let itemCode = '';
	let barCode = '';
	let purchaseCode = '';
	let material = 'C100%';
	let width = title.toUpperCase().includes('WIDE') ? 'W108in' : 'W45in';

	NorthcottRegEx.lastIndex = 0;
	let matches = NorthcottRegEx.exec(givenCode);
	if (!matches || matches.length <= 1) {
		Notify.log('No matches found for Item!', item);
		return;
	}

	if (matches[RegexEnum.Prefix]) {
		if (matches[RegexEnum.Prefix].toUpperCase() == 'B') {
			width = 'W108in';
		}
		if (matches[RegexEnum.Prefix].toUpperCase() == 'PTN') {
			title += ' Pattern';
		}
	} else {
		matches[RegexEnum.Prefix] = ''; // Prevent undefined
	}

	if (matches[RegexEnum.Suffix]) {
		if (matches[RegexEnum.Suffix].toUpperCase() == 'M' && !title.toUpperCase().includes('METALLIC')) {
			title += ' Metallic';
		}
	} else {
		matches[RegexEnum.Suffix] = ''; // Prevent undefined
	}

	let collectionCode = matches[RegexEnum.Prefix] + matches[RegexEnum.Collection] + matches[RegexEnum.Suffix];
	let colourCode = padWithZeros(matches[RegexEnum.ColourCode], 3).toUpperCase();

	itemCode = formatItemCode('NC', collectionCode + ' ' + colourCode);
	barCode = formatBarCode(itemCode);
	purchaseCode = formatPurchaseCode(collectionCode + '-' + matches[RegexEnum.ColourCode]);

	let webName = title.toTitleCase();
	let webDesc = material + ' - ' + width;
	let description = webName + ' - ' + webDesc;

	let dates = getReleaseDates(availDate, delDelay);
	let delDate = toDeliveryString(dates);

	let result = { 'itemCode': itemCode, 'barCode': barCode, 'description': description, 'webName': webName, 'webDesc': webDesc, 'delDate': delDate, 'purchaseCode': purchaseCode };
	return result;
}

// https://www.northcott.net/images/SwatchImages/B9030-11.jpg
function formatImage(item) {
	let result = getAbsolutePath(item.getAttribute('src'));
	return result;
}