// ==UserScript==
// @name         VicText Collection Extractor - Susybee
// @namespace    http://www.tgoff.me/
// @version      2.0
// @description  Gets the names and codes from a Susybee Collection
// @author       www.tgoff.me
// @match        *://www.worldofsusybee.com/textiles/*/*
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/tg-lib.js
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/collection-extract-lib.js
// @grant        GM_setClipboard
// @runat        document-idle
// ==/UserScript==

(function () {
	'use strict';
	createButtons();
})();

function getCompany() {
	let company = 'Susybee Textiles';
	return company;
}

function getTitleElement() {
	let titleElement = document.querySelector('#content > div > div > div:nth-child(1)');
	return titleElement;
}

function getFormattedTitle() {
	let title = getTitleElement().querySelector('img').getAttribute('alt');
	return formatTitle(title);
}

function getCollection() {
	let collection = document.querySelectorAll('#content > div > div > div:nth-child(3) > table > tbody > tr > td');
	// Remove blank cells from list
	collection.forEach((currentItem) => {
		if (!currentItem.querySelector('.textile_code')) {
			currentItem.remove();
		}
	});
	return collection;
}

let susyBeeRegEx = /(?:SB([0-9]+)([A-z]+)?-([0-9]+))/;
let RegexEnum = {
	'Collection': 1,
	'LetterAfter': 2,
	'ColourCode': 3,
};

let collections = {
	'20053': 'Squiggles',
	'20103': 'Swirl',
	'20171': 'Irregular Dot',
}

let colours = {
	'100': 'White',
	'101': 'White',
	'170': 'Grey',
	'190': 'Charcoal',
	'199': 'Black',
	'280': 'Brown',
	'310': 'Yellow',
	'420': 'Light Orange',
	'430': 'Orange',
	'450': 'Dark Orange',
	'520': 'Light Pink',
	'620': 'Lavender',
	'640': 'Light Purple',
	'680': 'Purple',
	'690': 'Dark Purple',
	'710': 'Blue',
	'740': 'Blue',
	'780': 'Navy',
	'810': 'Light Green',
	'815': 'Light Green',
	'820': 'Light Green',
	'830': 'Green',
	'840': 'Green',
	'845': 'Dark Green',
	'850': 'Green',
	'860': 'Grass Green',
	'920': 'Light Blue',
	'930': 'Turquoise',
	'950': 'Aqua',
}

function formatInformation(item) {
	let title = getFormattedTitle();
	let company = getCompany();
	let codeElement = item.querySelector('.textile_code');
	let noteElement = item.querySelector('.textile_note');

	if (!codeElement) {
		Notify.log('One or More Elements Not Found!', item);
		return;
	}

	let givenCode = codeElement.innerText;

	let itemCode = '';
	let barCode = '';
	let purchaseCode = '';
	let material = 'C100%';
	let width = title.includes('108') ? 'W108in' : 'W45in';

	susyBeeRegEx.lastIndex = 0;
	let matches = susyBeeRegEx.exec(givenCode);
	if (!matches || matches.length <= 1) {
		Notify.log('No matches found for Item!', item);
		return;
	}

	let collectionCode = matches[RegexEnum.Collection];
	if (matches[RegexEnum.LetterAfter]) {
		collectionCode = collectionCode + matches[RegexEnum.LetterAfter];
	}
	let colourCode = padWithZeros(matches[RegexEnum.ColourCode], 3);

	let colourName = '';
	if (colours.hasOwnProperty(colourCode)) {
		colourName = colours[colourCode];
	}
	if (collections.hasOwnProperty(collectionCode)) {
		title = collections[collectionCode];
	}

	itemCode = formatItemCode('SB', collectionCode + ' ' + colourCode);
	barCode = formatBarCode(itemCode);
	purchaseCode = formatPurchaseCode(givenCode.trim());

	if (noteElement) {
		let givenNote = noteElement.innerText.trim().toTitleCase();
		if (givenNote === 'Flannel') {
			title = title + ' - Flannel';
		}
	}

	let webName = colourName + ' - ' + title;
	let webDesc = material + ' - ' + width;
	let description = webName + ' - ' + webDesc;

	let delDate = 'Not Given - ' + toDeliveryString(getReleaseDates());

	let result = { 'itemCode': itemCode, 'barCode': barCode, 'description': description, 'webName': webName, 'webDesc': webDesc, 'delDate': delDate, 'purchaseCode': purchaseCode };
	return result;
}

function formatImage(item) {
	let img = item.querySelector('a');
	let result = getAbsolutePath(img.getAttribute('href'));
	return result;
}