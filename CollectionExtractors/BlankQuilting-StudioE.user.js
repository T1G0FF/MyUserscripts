// ==UserScript==
// @name         VicText Collection Extractor - Blank Quilting / Studio E
// @namespace    http://www.tgoff.me/
// @version      2021.03.26.2
// @description  Gets the names and codes from a Blank Quilting or Studio E Collection
// @author       www.tgoff.me
// @match        *://www.blankquilting.net/*
// @match        *://blankquilting.net/*
// @match        *://www.studioefabrics.net/*
// @match        *://studioefabrics.net/*
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/tg-lib.js
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/collection-extract-lib.js
// @grant        GM_setClipboard
// @grant        GM_download
// @runat        document-idle
// ==/UserScript==

let isSearch = false;
let isCollectionPage = false;
(function () {
	'use strict';
	isSearch = window.location.pathname.includes('search-results-page');
	let elem = document.querySelector('span.shipin-title');
	if (!elem) elem = getTitleElement();
	createButtons(elem);
	addSortFilterInputs(elem);
})();

let blankRegEx = /([0-9]+)([A-z]+)?(?:-[ ]*(?:([0-9]+)([A-z]+)?)?)(?:[ ]*([\w\ \-\.\/]+))?/;
let RegexEnum = {
	'Collection': 1,
	'LetterBefore': 2,
	'ColourCode': 3,
	'LetterAfter': 4,
	'ColourName': 5,
};

function getCompany() {
	let company = window.location.hostname.includes('studioefabrics') ? 'Studio E' : 'Blank Quilting';
	return company;
}

function getTitleElement() {
	let titleElement = isSearch ? document.querySelector('h1.page-heading') : document.querySelector('.page-heading > span');
	return titleElement;
}

function getTitle() {
	let titleElement = isSearch ? document.querySelector('div.snize-search-results-header > a.snize-no-products-found-link') : getTitleElement();
	let title = !titleElement ? '' : titleElement.innerText.trim();
	return title;
}

function getAvailabilityDate() {
	let availableElement = document.querySelector('span.shipin-title')
	if (availableElement) {
		let available = availableElement.innerText;
		if (available == 'Shipping Now') return undefined;
		available = available.replaceAll('Ships in ', '');
		return available;
	}
	return undefined;
}

function getCollection() {
	let collection = isSearch ? document.querySelectorAll('div.snize-search-results li.snize-product') : document.querySelectorAll('main.page-content li.product.item');
	if (!collection || collection.length < 1) {
		collection = document.querySelectorAll('div.parent-category-area li');
		isCollectionPage = collection.length > 0;
	}
	return collection;
}

function getItemObject(item) {
	if (isCollectionPage) {
		let collElement = item.querySelector('div.card-title > a');
		return { 'CollectionName': collElement.innerText.trim() };
	}

	let codeElement = isSearch ? item.querySelector('span.snize-title') : item.querySelector('h4.card-title > a');
	if (!codeElement) {
		Notify.log('Code elements not found!', item);
		return;
	}
	let givenCode = codeElement.innerText.trim().toUpperCase();

	blankRegEx.lastIndex = 0;
	let matches = blankRegEx.exec(givenCode);
	if (!matches || matches.length <= 1) {
		Notify.log('No matches found for Item!', item);
		return;
	}

	let prefix = 'BQ';

	let collectionCode = matches[RegexEnum.Collection];
	if (matches[RegexEnum.LetterBefore]) {
		collectionCode = collectionCode + matches[RegexEnum.LetterBefore];
	}

	let colourCode = '';
	if (matches[RegexEnum.ColourCode] && matches[RegexEnum.ColourCode].length > 0) {
		colourCode = padWithZeros(matches[RegexEnum.ColourCode], 3);
	}
	if (matches[RegexEnum.LetterAfter]) {
		colourCode = colourCode + matches[RegexEnum.LetterAfter];
	}

	let colourName = '';
	if (matches[RegexEnum.ColourName] && matches[RegexEnum.ColourName].length > 0) {
		colourName = fixColourName(matches[RegexEnum.ColourName]);
		colourName = colourName.trim().toTitleCase(false);
	}

	let purchaseCode = givenCode;
	if (matches[RegexEnum.ColourName] && matches[RegexEnum.ColourName].length > 0 && matches[RegexEnum.ColourCode] && matches[RegexEnum.ColourCode].length > 0) {
		purchaseCode = purchaseCode.replaceAll(matches[RegexEnum.ColourName].toUpperCase(), '').trim();
	}
	purchaseCode = formatPurchaseCode(purchaseCode.trim());

	let descElement = isSearch ? item.querySelector('span.snize-description') : item.querySelector('h4.card-title > p.card-text');
	if (!descElement) {
		Notify.log('Description element not found!', item);
		return;
	}
	let givenDesc = descElement.innerText.trim();
	let patternName = givenDesc.replaceAll('["″]', 'in').toTitleCase();

	let title = getFormattedTitle();
	let special = '';
	if (title.indexOf(' - ') > 0) {
		let dash = title.indexOf(' - ');
		special = title.substr(dash + 3);
		title = title.substr(0, dash)
	}

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

	if (isCollectionPage) {
		return { 'description': item.CollectionName };
	}

	let tempCodeColour = (((item.ColourCode.length > 0) ? item.ColourCode + ' ' : '') + shortenColourName(item.ColourName)).toUpperCase();
	let itemCode = formatItemCode(item.Prefix, item.CollectionCode + ' ' + tempCodeColour);

	let barCode = formatBarCode(itemCode);

	let company = getCompany();
	let widthString = item.Width.Measurement + item.Width.Unit;
	let description = formatSapDescription({ 'Colour': item.ColourName, 'Pattern': item.PatternName, 'Collection': (company === 'Studio E') ? company + ' ' + item.CollectionName : item.CollectionName, 'Special': item.SpecialNotes, 'Material': item.Material, 'Width': 'W' + widthString, 'Repeat': item.Repeat })

	let webName = (((item.ColourName.length > 0) ? item.ColourName + ' - ' : '') + item.PatternName);

	let relDateString = toReleaseString(item.ReleaseDates);
	let webDesc = formatWebDescription({ 'Collection': item.CollectionName, 'Notes': item.SpecialNotes, 'Fibre': item.Material, 'Width': widthString, 'Release': relDateString, 'Delivery From': item.ReleaseDates.Delivery });
	let delDateString = toDeliveryString(item.ReleaseDates);

	let result = { 'itemCode': itemCode, 'barCode': barCode, 'description': description, 'webName': webName, 'webDesc': webDesc, 'delDate': delDateString, 'purchaseCode': item.PurchaseCode, 'webCategory': item.CollectionName };
	return result;

	//////////////////////////////////////////////
	//let nameString = givenDesc.toTitleCase() + ' - ' + titleString;
	//if (givenDesc.toUpperCase() === title.replaceAll('108', '').trim().toUpperCase()) {
	//	nameString = titleString;
	//}
	//nameString = nameString.replaceAll('["]', 'in');
}

// https://cdn7.bigcommerce.com/s-par0o0ta6b/images/stencil/500x659/products/1517/14348/9422-44__27613.1526386264.jpg

function formatImage(item) {
	let img = isSearch ? item.querySelector('span.snize-thumbnail img') : item.querySelector('img');
	let result = img.getAttribute('src');
	return result;
}

/***********************************************
 * Collection Sorting & Filtering
 ***********************************************/
function getItemContainer() {
	return document.querySelector('ul.productGrid');
}

function getCodeFromItem(item) {
	let codeElement = isSearch ? item.querySelector('span.snize-title') : item.querySelector('h4.card-title > a');
	return codeElement.innerText.trim();
}

function testFilterAgainst(item) {
	let codeElement = isSearch ? item.querySelector('span.snize-item') : item.querySelector('h4.card-title');
	let str = codeElement ? codeElement.innerText : item.innerText.toLowerCase().replace('choose options', '').replace('where to buy?', '');
	return str;
}

function addFilterMatchStyle(item) {
	let elem = item.querySelector('div.card-body');
	if (elem) elem.style.boxShadow = 'green inset 0 25px 5px -20px';
}

function removeFilterMatchStyle(item) {
	let elem = item.querySelector('div.card-body');
	if (elem) elem.style.boxShadow = '';
}