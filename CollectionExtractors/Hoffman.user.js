// ==UserScript==
// @name         VicText Collection Extractor - Hoffman
// @namespace    http://www.tgoff.me/
// @version      2.0
// @description  Gets the names and codes from a Hoffman Collection
// @author       www.tgoff.me
// @match        *://hoffmancaliforniafabrics.net/php/catalog/fabricshop.php?a=sc&Category=*
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/tg-lib.js?token=9461da6511cdd88e73bb62eb66eaa3a0a201bef0
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/collection-extract-lib.js?token=9461da6511cdd88e73bb62eb66eaa3a0a201bef0
// @grant        GM_setClipboard
// @grant        GM_download
// @runat        document-idle
// ==/UserScript==

(function () {
	'use strict';
	createButtons();
	createButton('Sort Codes', sortSearch, getTitleElement(), 'beforeEnd');
})();

function getCompany() {
	let company = 'Hoffman';
	return company;
}

function getTitleElement() {
	let titleElement = document.querySelector('.section.title h3');
	return titleElement;
}

function getCollection() {
	let collection = document.querySelectorAll('div.page > div.container > .masonbox.masoncol5');
	return collection;
}

let hoffmanRegEx = /((?:[A-z]{1,2}|[A-z]{3})?[0-9]+)-([A-z]?)([0-9]+)([A-z]?)-([\w- ]+)/;
let RegexEnum = {
	'Collection': 1,
	'LetterBefore': 2,
	'ColourCode': 3,
	'LetterAfter': 4,
	'ColourName': 5,
}

function formatInformation(item) {
	let title = getTitle();
	let company = getCompany();
	let codeElement = item.querySelector('span:nth-child(3)');
	let givenCode = codeElement ? codeElement.innerText : item.innerText;

	let itemCode = '';
	let barCode = '';
	let purchaseCode = '';
	let material = 'C100%';
	let width = title.includes('108') ? 'W108in' : 'W45in';

	hoffmanRegEx.lastIndex = 0;
	let matches = hoffmanRegEx.exec(givenCode);
	if (!matches || matches.length <= 1) {
		Notify.log('No matches found for Item!', item);
		return;
	}
	let collectionCode = matches[RegexEnum.Collection];

	let colourCode = padWithZeros(matches[RegexEnum.ColourCode], 3);
	if (matches[RegexEnum.LetterBefore]) {
		colourCode = matches[RegexEnum.LetterBefore].toUpperCase() + colourCode;
	}
	if (matches[RegexEnum.LetterAfter]) {
		colourCode = colourCode + matches[RegexEnum.LetterAfter].toUpperCase();
	}
	let colourName = fixColourName(matches[RegexEnum.ColourName]);
	let givenCodeColour = (colourCode + ' ' + colourName).toUpperCase();

	itemCode = formatItemCode('H', collectionCode + ' ' + givenCodeColour);
	barCode = formatBarCode(itemCode).replaceAll(' ', '-');
	purchaseCode = formatPurchaseCode(givenCode.replaceAll('-' + matches[RegexEnum.ColourName], ''));

	let currentTitle = title;
	switch (collectionCode) {
		case '839':
			currentTitle = 'Bali Mottles';
			break;
		case '884':
			currentTitle = 'Bali Batiks Sunflowers';
			break;
		case '885':
			currentTitle = 'Bali Dot Batiks';
			break;
		case '1384':
			currentTitle = 'Bali Smoothies';
			break;
		case '1895':
			currentTitle = 'Bali Watercolours';
			break;
		default:
			break;
	}

	let webName = colourName.toTitleCase() + ' - ' + currentTitle;
	let webDesc = material + ' - ' + width;
	let description = webName + ' - ' + webDesc;

	let delDate = "Not Given - " + getDeliveryString();

	let result = { 'itemCode': itemCode, 'barCode': barCode, 'description': description, 'webName': webName, 'webDesc': webDesc, 'delDate': delDate, 'purchaseCode': purchaseCode, 'webCategory': title };
	return result;
}

// http://hoffmancaliforniafabrics.net/fabricshop/categories/546/thumbs/tn_9500-01.jpg
// http://hoffmancaliforniafabrics.net/fabricshop/categories/546/media/9500-01.jpg
function formatImage(item) {
	let result = item.querySelector('img').getAttribute('src');
	result = result.replaceAll(/(thumbs\/)(tn_)?/, 'media\/');
	return result;
}

let sortDirection = -1;
function sortSearch() {
	let itemContainer = document.querySelector('body > div:nth-child(5) > div:nth-child(3)');
	let itemList = Array.from(getCollection());
	itemList.sort(function (a, b) {
		let result = 0;
		result = compareCodes(getCodeFromItem(a), getCodeFromItem(b)) * sortDirection;
		return result;
	});
	sortDirection *= -1;

	itemContainer.innerHtml = '';

	for (var i = itemList.length - 1; i >= 0; i--) {
		let itemOut = itemList[i];
		itemContainer.appendChild(itemOut);
	}
}

function getCodeFromItem(item) {
	let codeElement = item.querySelector('span:nth-child(3)');
	let givenCode = codeElement ? codeElement.innerText : item.innerText;
	return givenCode;
}

function compareCodes(aCode, bCode) {
	//	hoffmanRegEx.lastIndex = 0;
	let aMatches = hoffmanRegEx.exec(aCode);
	let bMatches = hoffmanRegEx.exec(bCode);
	if (!aMatches || !bMatches || aMatches.length <= 1 || bMatches.length <= 1) {
		Notify.log('No matches found for Item!', aCode, bCode);
		return;
	}
	let aCollection = aMatches[RegexEnum.Collection];
	let bCollection = bMatches[RegexEnum.Collection];
	let aColour = padWithZeros(aMatches[RegexEnum.ColourCode], 3);
	let bColour = padWithZeros(bMatches[RegexEnum.ColourCode], 3);

	return comp(aCollection, bCollection) || comp(aColour, bColour)
}