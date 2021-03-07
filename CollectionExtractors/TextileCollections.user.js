// ==UserScript==
// @name         VicText Collection Extractor - Textile Collections
// @namespace    http://tgoff.me/
// @version      1.0
// @description  Gets the names and codes from a Textile Collections Collection
// @author       www.tgoff.me
// @match        *://*.fabric4less.com/index.php*
// @match        *://fabric4less.com/index.php*
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/tg-lib.js
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/collection-extract-lib.js
// @grant        GM_setClipboard
// @grant        GM_download
// @runat        document-idle
// ==/UserScript==

let widebackRegex = /108w-([0-9]+)-([0-9]+)-.*/;
let RegexEnum = {
	'CollectionCode': 1,
	'ColourCode': 2,
};

(function () {
	'use strict';
	createButtons();
})();

function getCompany() {
	let company = 'Textile Collections';
	return company;
}

function getTitleElement() {
	let titleElement = document.querySelector('h1#productListHeading') || document.querySelector('h1#advSearchResultsDefaultHeading');
	return titleElement;
}

function getCollection() {
	let collection = document.querySelectorAll('ul.productsContainer li[class*="productListing"]');
	return collection;
}

function formatInformation(item) {
	let title = getFormattedTitle();
	let company = getCompany();

	let codeElement = item.querySelector('font[size="1"]');
	let descElement = item.querySelector('h3.itemTitle');
	if (!descElement || !codeElement) {
		Notify.log('One or More Elements Not Found!', item);
		return;
	}
	let givenCode = codeElement.innerText.trim();
	let givenDesc = descElement.innerText.trim();

	let matches = widebackRegex.exec(givenCode);
	if (!matches || matches.length <= 1) {
		Notify.log('No matches found for Item!', item);
		return;
	}

	let prefix = 'T';
	let collectionCode = matches[RegexEnum.CollectionCode];
	let colorCode = matches[RegexEnum.ColourCode];
	let itemCode = formatItemCode(prefix, collectionCode + ' ' + colorCode).toUpperCase();
	let barCode = formatBarCode(itemCode);

	let material = 'C100%';
	let width = 'W108in';

	let webName = givenDesc.replaceAll('["″]', 'in').toTitleCase();
	let webDesc = material + ' - ' + width;

	let description = webName + ' - ' + webDesc;

	let purchaseCode = collectionCode + '-' + colorCode;

	let result = { 'itemCode': itemCode, 'barCode': barCode, 'description': description, 'webName': webName, 'webDesc': webDesc, 'purchaseCode': purchaseCode };
	return result;
}

// bmz_cache/d/d6a7af922d2a897fd65d024c81ae11db.image.200x133.jpg
// images/220_49378_702.jpg
// images/220_49378_205.jpg

function formatImage(item) {
	let codeElement = item.querySelector('font[size="1"]');
	if (!codeElement) {
		Notify.log('One or More Elements Not Found!', item);
		return;
	}
	let givenCode = codeElement.innerText.trim();

	let matches = widebackRegex.exec(givenCode);
	if (!matches || matches.length <= 1) {
		Notify.log('No matches found for Item!', item);
		return;
	}

	let url = 'https://fabric4less.com/images/220_' + matches[RegexEnum.CollectionCode] + '_' + matches[RegexEnum.ColourCode] + '.jpg';

	return url;
}