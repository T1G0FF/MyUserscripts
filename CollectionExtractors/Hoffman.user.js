// ==UserScript==
// @name         VicText Collection Extractor - Hoffman
// @namespace    http://www.tgoff.me/
// @version      2023.08.28.1
// @description  Gets the names and codes from a Hoffman Collection
// @author       www.tgoff.me
// @match        *://hoffmancaliforniafabrics.net/php/catalog/fabricshop.php*
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/tg-lib.js
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/collection-extract-lib.js
// @grant        GM_setClipboard
// @grant        GM_download
// @run-at       document-idle
// ==/UserScript==

let isSearch = false;
let isCollectionPage = false;
(function () {
	'use strict';
	isSearch = !hasParam(window.location.search, 'Category');
	let inputLoc = document.querySelector('.section.title h3');
	createButtons(inputLoc, 'afterend');
	addSortFilterInputs(inputLoc);
})();

let hoffmanRegEx = /(([a-zA-Z]{1,3})?([0-9]+))[ -]([a-zA-Z]?)([0-9]+)([a-zA-Z]?)[ -]([\w- ]+)/;
let RegexEnum = {
	'Collection': 1,
	'CollectionPrefix': 2,
	'CollectionCode': 3,
	'LetterBefore': 4,
	'ColourCode': 5,
	'LetterAfter': 6,
	'ColourName': 7,
}

function getCompany() {
	let company = 'Hoffman';
	return company;
}

function getTitleElement() {
	let titleElement = isSearch ? document.querySelector('.section.page .container:first-of-type b') : document.querySelector('.section.title h3');
	return titleElement;
}

function getCollection() {
	let collection = document.querySelectorAll('div.section.title + div.section.page > div.container > .masonbox.masoncol5');
	if (!collection || collection.length < 1) {
		collection = document.querySelectorAll('div.section.title + div.section.page > div.container > .masonbox.masoncol4');
		isCollectionPage = collection.length > 0;
	}
	return collection;
}

function getItemObject(item) {
	if (isCollectionPage) {
		let collElement = item.querySelector('div[style*="font-weight: bold"] > a');
		return { 'CollectionName': collElement.innerText.trim() };
	}

	let codeElement = item.querySelector('span:nth-child(3)');
	let givenCode = (codeElement ? codeElement.innerText : item.innerText).trim().toUpperCase();
	if (givenCode && givenCode.trim().length < 1) {
		Notify.log('Code elements not found!', item);
		return;
	}
	givenCode = givenCode.trim().toUpperCase();

	hoffmanRegEx.lastIndex = 0;
	let matches = hoffmanRegEx.exec(givenCode);
	if (!matches || matches.length <= 1) {
		Notify.log('No matches found for Item!', item);
		return;
	}

	let prefix = 'H';

	let collectionCode = matches[RegexEnum.Collection].toUpperCase();

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
		colourName = colourName.trim().toTitleCase();
	}

	let purchaseCode = givenCode;
	if (matches[RegexEnum.ColourName] && matches[RegexEnum.ColourName].length > 0 && matches[RegexEnum.ColourCode] && matches[RegexEnum.ColourCode].length > 0) {
		purchaseCode = purchaseCode.replaceAll('-' + matches[RegexEnum.ColourName].toUpperCase(), '');
	}
	purchaseCode = formatPurchaseCode(purchaseCode.trim());

	let patternName = '';

	let title = getFormattedTitle();
	let special = '';

	let material = 'C100%';
	let isWideback = title.includes('108') || (matches[RegexEnum.CollectionPrefix] && matches[RegexEnum.CollectionPrefix].startsWith('W'));
	let width = isWideback ? { 'Measurement': '108', 'Unit': 'in' } : { 'Measurement': '45', 'Unit': 'in' };
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

	if (isCollectionPage) {
		return { 'description': item.CollectionName };
	}

	let tempCodeColour = (((item.ColourCode.length > 0) ? item.ColourCode + ' ' : '') + shortenColourName(item.ColourName)).toUpperCase();
	let itemCode = formatItemCode(item.Prefix, item.CollectionCode + ' ' + tempCodeColour);

	let barCode = formatBarCode(itemCode.replaceAll(' ', '-'));

	let company = getCompany();
	let widthString = item.Width.Measurement + item.Width.Unit;
	let description = formatSapDescription({ 'Colour': item.ColourName, 'Pattern': item.PatternName, 'Collection': (company === 'Studio E') ? company + ' ' + item.CollectionName : item.CollectionName, 'Special': item.SpecialNotes, 'Material': item.Material, 'Width': 'W' + widthString, 'Repeat': item.Repeat })

	let collectionName = item.CollectionName;
	switch (item.CollectionCode) {
		case '839':
			collectionName = 'Bali Mottles';
			break;
		case '884':
			collectionName = 'Bali Sunflowers';
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
	let imgElement = item.querySelector('img')
	let result = imgElement ? imgElement.getAttribute('src') : '';
	result = result.replaceAll(/(thumbs\/)(tn_)?/, 'media\/');
	return result;
}

/***********************************************
 * Collection Sorting & Filtering
 ***********************************************/
function getItemContainer() {
	let containers = document.querySelectorAll('div.section.title + div.section.page > div.container');
	for (let i = 0; i < containers.length; i++) {
		const container = containers[i];
		if (container.querySelectorAll('div.masonbox[class*="masoncol"]').length > 0) {
			return container;
		}
	}
	return undefined;
}

function getCodeFromItem(item) {
	let codeElement = item.querySelector('span:nth-child(3)');
	let givenCode = codeElement ? codeElement.innerText : item.innerText;
	return givenCode.trim();
}

addSortBy('Codes', (item) => {
	let matches = hoffmanRegEx.exec(getCodeFromItem(item));
	if (!matches || matches.length <= 1) {
		Notify.log('No matches found for Item!', item);
		return 0;
	}

	let collection = matches[RegexEnum.Collection];
	let colour = padWithZeros(matches[RegexEnum.ColourCode], 3);
	return [collection, colour]
});

function testFilterAgainst(item) {
	return getCodeFromItem(item);
}

function addFilterMatchStyle(item) {
	let elem = item.querySelector('div:nth-of-type(2)');
	if (elem) elem.style.boxShadow = 'green inset 0 25px 5px -20px';
}

function removeFilterMatchStyle(item) {
	let elem = item.querySelector('div:nth-of-type(2)');
	if (elem) elem.style.boxShadow = '';
}