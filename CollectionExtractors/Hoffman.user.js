// ==UserScript==
// @name         VicText Collection Extractor - Hoffman
// @namespace    http://www.tgoff.me/
// @version      3.0.1
// @description  Gets the names and codes from a Hoffman Collection
// @author       www.tgoff.me
// @match        *://hoffmancaliforniafabrics.net/php/catalog/fabricshop.php?a=sc&Category=*
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/tg-lib.js
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/collection-extract-lib.js
// @grant        GM_setClipboard
// @grant        GM_download
// @runat        document-idle
// ==/UserScript==

(function () {
	'use strict';
	createButtons();
	createButton('Sort Codes', sortSearch, getTitleElement(), 'beforeEnd');
})();

let hoffmanRegEx = /((?:[A-z]{1,2}|[A-z]{3})?[0-9]+)-([A-z]?)([0-9]+)([A-z]?)-([\w- ]+)/;
let RegexEnum = {
	'Collection': 1,
	'LetterBefore': 2,
	'ColourCode': 3,
	'LetterAfter': 4,
	'ColourName': 5,
}

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

function getItemObject(item) {
	let codeElement = item.querySelector('span:nth-child(3)');
	if (!codeElement) {
		Notify.log('Code elements not found!', item);
		return;
	}
	let givenCode = (codeElement ? codeElement.innerText : item.innerText).trim().toUpperCase();
	
	hoffmanRegEx.lastIndex = 0;
	let matches = hoffmanRegEx.exec(givenCode);
	if (!matches || matches.length <= 1) {
		Notify.log('No matches found for Item!', item);
		return;
	}

	let prefix = 'H';

	let collectionCode = matches[RegexEnum.Collection];

	let colourCode = '';
	if (matches[RegexEnum.ColourCode] && matches[RegexEnum.ColourCode].length > 0) {
		colourCode = padWithZeros(matches[RegexEnum.ColourCode], 3);
	}
	if (matches[RegexEnum.LetterBefore]) {
		colourCode = matches[RegexEnum.LetterBefore].toUpperCase() + colourCode;
	}
	if (matches[RegexEnum.LetterAfter]) {
		colourCode = colourCode + matches[RegexEnum.LetterAfter].toUpperCase();
	}

	let colourName = '';
	if (matches[RegexEnum.ColourName] && matches[RegexEnum.ColourName].length > 0) {
		colourName = fixColourName(matches[RegexEnum.ColourName]);
		colourName = colourName.trim().toTitleCase(false);
	}

	let purchaseCode = givenCode;
	if (matches[RegexEnum.ColourName] && matches[RegexEnum.ColourName].length > 0 && matches[RegexEnum.ColourCode] && matches[RegexEnum.ColourCode].length > 0) {
		purchaseCode = purchaseCode.replaceAll('-' + matches[RegexEnum.ColourName].toUpperCase(), '');
	}
	purchaseCode = formatPurchaseCode(purchaseCode.trim());

	let title = getTitle();
	let special = '';
	
	let material = 'C100%';
	let width = title.includes('108') ? { 'Measurement': '108', 'Unit': 'in' } : { 'Measurement': '45', 'Unit': 'in' };
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

	let tempCodeColour = (((item.ColourCode.length > 0) ? item.ColourCode + ' ' : '') + item.ColourName).toUpperCase();
	let itemCode = formatItemCode(item.Prefix, item.CollectionCode + ' ' + tempCodeColour);

	let barCode = formatBarCode(itemCode.replaceAll(' ', '-'));

	let company = getCompany();
	let widthString = item.Width.Measurement + item.Width.Unit;
	let description = formatSapDescription({ 'Colour': item.ColourName, 'Pattern': item.PatternName, 'Collection': (company === 'Studio E') ? company + ' ' + item.CollectionName : item.CollectionName, 'Special': item.SpecialNotes, 'Material': item.Material, 'Width': 'W' + widthString, 'Repeat': item.Repeat })

	let collectionName = title;
	switch (collectionCode) {
		case '839':
			collectionName = 'Bali Mottles';
			break;
		case '884':
			collectionName = 'Bali Batiks Sunflowers';
			break;
		case '885':
			collectionName = 'Bali Dot Batiks';
			break;
		case '1384':
			collectionName = 'Bali Smoothies';
			break;
		case '1895':
			collectionName = 'Bali Watercolours';
			break;
		default:
			break;
	}

	let webName = (((item.ColourName.length > 0) ? item.ColourName + ' - ' : '') + collectionName);

	let relDateString = toReleaseString(item.ReleaseDates);
	let webDesc = formatWebDescription({ 'Collection': item.CollectionName, 'Notes': item.SpecialNotes, 'Fibre': item.Material, 'Width': widthString, 'Release': relDateString, 'Delivery From': item.ReleaseDates.Delivery });
	let delDateString = "Not Given - " + toDeliveryString(item.ReleaseDates);

	let result = { 'itemCode': itemCode, 'barCode': barCode, 'description': description, 'webName': webName, 'webDesc': webDesc, 'delDate': delDateString, 'purchaseCode': item.PurchaseCode, 'webCategory': item.CollectionName };
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