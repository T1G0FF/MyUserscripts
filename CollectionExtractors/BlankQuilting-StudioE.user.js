// ==UserScript==
// @name         VicText Collection Extractor - Blank Quilting / Studio E
// @namespace    http://www.tgoff.me/
// @version      2021.10.08.1
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
let isStudioE = false;
(function () {
	'use strict';
	isSearch = window.location.pathname.includes('search-results-page');
	isStudioE = window.location.hostname.includes('studioefabrics');
	let elem = document.querySelector('span.shipin-title');
	if (!elem) elem = getTitleElement();
	createButtons(elem);
	addSortFilterInputs(elem);
})();

let blankRegEx = /([A-z]+)?([0-9]+)([A-z]+)?(?:-[ ]*(?:([0-9]+)([A-z]+)?)?)(?:[ ]*([\w\ \-\.\/]+))?/;
let RegexEnum = {
	'Prefix': 1,
	'Collection': 2,
	'LetterBefore': 3,
	'ColourCode': 4,
	'LetterAfter': 5,
	'ColourName': 6,
};

function getCompany() {
	let company = isStudioE ? 'Studio E' : 'Blank Quilting';
	return company;
}

function getTitleElement() {
	let titleElement = isSearch ? document.querySelector('h1.page-heading') : document.querySelector('.page-heading > span');
	return titleElement;
}

function getTitle() {
	let titleElement = isSearch ? document.querySelector('div.snize-search-results-header > a.snize-no-products-found-link') : getTitleElement();
	let title = !titleElement ? '' : titleElement.innerText.trim();
	if (title[0] === '*') title = title.substr(1);
	return title;
}

function getAvailabilityDate() {
	let availableElement = document.querySelector('span.shipin-title')
	if (availableElement) {
		let available = availableElement.innerText;
		// Ignores everything after the first line, which is probably text from the added buttons.
		if (available.indexOf('\n') > 0) available = available.split('\n')[0];
		if (available == 'Shipping Now') return undefined;
		available = available.replaceAll('Ships in ', '');
		available = available.replaceAll('Ships ', '');
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
	if (givenCode.indexOf('||') > 0) {
		givenCode = givenCode.split('||')[0].trim();
	}

	let prefix = 'BQ';
	let title = getFormattedTitle();
	let dates = getReleaseDates();

	if (item.matches('.Full') || item.matches('.FULL')) {
		// Full Collection Item
		let imgElement = item.querySelector('img.card-image');
		let itemName = imgElement.getAttribute('alt');
		let classList = Array.from(item.classList);
		classList.remove('product', 'item', 'first', 'last');
		if(!isStudioE) {
			classList.remove('Full');
		}
		let purchaseCode = Array.prototype.join.call(classList, ' ');
		let collectionCount = document.querySelector('div.ship-in-cnt > p:last-of-type > span').innerText;
		return {
			'isFullCollection': true,
			'Prefix': 'COL-' + prefix,
			'PurchaseCode': purchaseCode,
			'CollectionName': title,
			'ItemName': itemName,
			'CollectionCount': collectionCount,
			'BoltLength': { 'Measurement': '11', 'Unit': 'm' },
			'ReleaseDates': dates,
		};
	}

	blankRegEx.lastIndex = 0;
	let matches = blankRegEx.exec(givenCode);
	if (!matches || matches.length <= 1) {
		Notify.log('No matches found for Item!', item);
		return;
	}

	let collectionCode = matches[RegexEnum.Collection];
	if (matches[RegexEnum.Prefix]) {
		collectionCode = matches[RegexEnum.Prefix] + collectionCode;
	}
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

	let patternName = 'PATTERN';
	let descElement = isSearch ? item.querySelector('span.snize-description') : item.querySelector('h4.card-title > p.card-text');
	if (descElement) {
		let givenDesc = descElement.innerText.trim();
		patternName = givenDesc.replaceAll('["″]', 'in').toTitleCase();
	}

	let special = '';
	if (title.indexOf(' - ') > 0) {
		let dash = title.indexOf(' - ');
		special = title.substr(dash + 3);
		title = title.substr(0, dash)
	}

	let material = 'C100%';
	let width = title.includes('108') ? { 'Measurement': '108', 'Unit': 'in' } : { 'Measurement': '45', 'Unit': 'in' };
	let repeat = '';

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

	let company = getCompany();
	let itemCode = '';
	let description = '';
	let webName = '';
	let webDesc = '';

	let relDateString = toReleaseString(item.ReleaseDates);
	let delDateString = toDeliveryString(item.ReleaseDates);

	if (item.isFullCollection) {
		let fullCollectionName = item.CollectionName.toUpperCase();
		fullCollectionName = fullCollectionName.replaceAll('[\'"]', '');
		fullCollectionName = fullCollectionName.replaceAll(' - DIGITAL', '');
		fullCollectionName = fullCollectionName.replaceAll('&', 'AND');
		fullCollectionName = ' ' + fullCollectionName;
		itemCode = formatItemCode(item.Prefix, fullCollectionName);
		// 3 Wishes Amazement Park Collection
		webName = company + ' ' + item.ItemName;
		// 3 Wishes Amazement Park Collection - 8pc - 12yd Bolts
		let boltString = item.BoltLength.Measurement + item.BoltLength.Unit;
		description = webName + ' - ' + item.CollectionCount + 'pc - ' + boltString + ' Bolts';

		webDesc = formatWebDescription({ 'Collection': item.CollectionCount + ' Bolts', 'Bolts': boltString, 'Release': relDateString, 'Delivery From': item.ReleaseDates.Delivery });;
	} else {
		let tempCodeColour = (((item.ColourCode.length > 0) ? item.ColourCode + ' ' : '') + shortenColourName(item.ColourName)).toUpperCase();
		itemCode = formatItemCode(item.Prefix, item.CollectionCode + ' ' + tempCodeColour);

		let widthString = item.Width.Measurement + item.Width.Unit;
		description = formatSapDescription({ 'Colour': item.ColourName, 'Pattern': item.PatternName, 'Collection': (company === 'Studio E') ? company + ' ' + item.CollectionName : item.CollectionName, 'Special': item.SpecialNotes, 'Material': item.Material, 'Width': 'W' + widthString, 'Repeat': item.Repeat })

		webName = (((item.ColourName.length > 0) ? item.ColourName + ' - ' : '') + item.PatternName);

		webDesc = formatWebDescription({ 'Collection': item.CollectionName, 'Notes': item.SpecialNotes, 'Fibre': item.Material, 'Width': widthString, 'Release': relDateString, 'Delivery From': item.ReleaseDates.Delivery });
	}

	let barCode = formatBarCode(itemCode);

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