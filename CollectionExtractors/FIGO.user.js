// ==UserScript==
// @name         VicText Collection Extractor - FIGO
// @namespace    http://www.tgoff.me/
// @version      2.0
// @description  Gets the names and codes from a FIGO Collection
// @author       www.tgoff.me
// @match        *://figofabrics.com/product-detail.aspx?*
// @match        *://www.figofabrics.com/product-detail.aspx?*
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

function getCompany() {
	let company = 'FIGO';
	return company;
}

function getTitleElement() {
	let titleElement = document.querySelector('#ContentPlaceHolderBody_divProductDetailBannerImage');
	return titleElement;
}

// Override because FIGO doesn't display the title in text form anywhere.
function getTitle() {
	let src = getTitleElement().querySelector('img').getAttribute('src');
	let FIGOTitleRegEx = /(?:images\/colorwaybanners\/)(?:[0-9]+)_(.*?)_(?:Web|2220x384)?/;
	let matches = FIGOTitleRegEx.exec(src);
	if (!matches || matches.length <= 1) {
		Notify.log('No matches found for Title!', src);
		return;
	}

	// images/colorwaybanners/3003_LuckyCharms_Web2220x384.jpg
	// Pull title from image source, split at capital letters and rejoin with spaces
	let title = matches[1].split(/(?=[A-Z])/).join(' ');
	return title;
}

function getAvailabilityDate() {
	let availableElement = document.querySelector('#shipDate')
	if (availableElement) {
		let available = availableElement.innerText;
		if (available == 'Shipping Now') return undefined;
		let asDate = new Date(available);
		if (asDate) {
			available = getMonthName(asDate.getMonth()) + " " + asDate.getFullYear();
			return available;
		}
	}
	return undefined;
}

function getCollection() {
	let collection = document.querySelectorAll('#ContentPlaceHolderBody_parent .swatch');
	//if(!collection || collection.length < 1) {
	//	collection = document.querySelectorAll('#ContentPlaceHolderBody_OnlySwatches > div.row > div > center > span > a > img');
	//}
	return collection;
}

let FIGORegEx = /([A-z]*)?([0-9]+[A-Z]?)-([0-9]+)/;
let RegexEnum = {
	'Prefix': 1,
	'Collection': 2,
	'ColourCode': 3,
};

function formatInformation(item) {
	let title = getTitle();
	let company = getCompany();

	let codeElement = item.querySelector('.product-number');
	if (!codeElement) {
		// Skip Projects
		if (item.querySelector('.project-name')) return;
		Notify.log('Code Element Not Found!', item);
		return;
	}
	let givenCode = codeElement.innerText.toUpperCase();

	let itemCode = '';
	let barCode = '';
	let purchaseCode = '';
	let material = 'C100%';
	let width = 'W45in';

	FIGORegEx.lastIndex = 0;
	let matches = FIGORegEx.exec(givenCode);
	if (!matches || matches.length <= 1) {
		Notify.log('No matches found for Item!', item);
		return;
	}

	let collectionCode = matches[RegexEnum.Collection];
	let colourCode = padWithZeros(matches[RegexEnum.ColourCode], 3);

	if (matches[RegexEnum.Prefix]) {
		let currentPrefix = matches[RegexEnum.Prefix].toUpperCase();
		collectionCode = currentPrefix + collectionCode;
		switch (currentPrefix) {
			case 'R':
				material = 'R100%';
				width = 'W55in';
				break;
			default:
				Notify.log('Unknown Prefix found: ' + matches[RegexEnum.Prefix].toUpperCase());
				break;
		}
	}

	let givenCodeColour = colourCode.toUpperCase();

	itemCode = formatItemCode('FI', collectionCode + ' ' + givenCodeColour);
	barCode = formatBarCode(itemCode);
	purchaseCode = formatPurchaseCode(matches[RegexEnum.Collection] + '-' + matches[RegexEnum.ColourCode]);

	let webName = title.toTitleCase();
	let webDesc = material + ' - ' + width;
	let description = webName + ' - ' + webDesc;

	let delDate = getDeliveryString();

	let result = { 'itemCode': itemCode, 'barCode': barCode, 'description': description, 'webName': webName, 'webDesc': webDesc, 'delDate': delDate, 'purchaseCode': purchaseCode };
	return result;
}

// https://figofabrics.com/images/SwatchImages/90097-99.jpg
function formatImage(item) {
	let result = getAbsolutePath(item.querySelector('img').getAttribute('src'));
	return result;
}