// ==UserScript==
// @name         # VicText Collection Extractor - Blank Quilting / Studio E
// @namespace    http://www.tgoff.me/
// @version      2025.01.31.2
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
// @run-at       document-idle
// ==/UserScript==

const Company = {
	BlankQuilting: 0,
	StudioE: 1,
	Stof: 2
}

let isSearch = false;
let isCollectionPage = false;
let companyEnum = Company.BlankQuilting;
(function () {
	'use strict';
	isSearch = window.location.pathname.includes('search-results-page');
	isCollectionPage = document.querySelectorAll('div.parent-category-area li').length > 0;

	let breadcrumbs = document.querySelector('ul.breadcrumbs');
	if (breadcrumbs?.innerText.indexOf('Stof Fabrics') >= 0) {
		companyEnum = Company.Stof;
	}
	else if (window.location.hostname.includes('studioefabrics')) {
		companyEnum = Company.StudioE;
	}

	let elem = document.querySelector('div.ship-in span.shipin-title');
	if (!elem) elem = getTitleElement();
	if (isCollectionPage) {
		ShowShipDates();

		createButton('Copy All Collections', function () { CollectionsToClipBoard(GetAllCollections()); }, elem, 'beforeEnd', isCollectionPage);
		createButton('Copy New Collections', function () { CollectionsToClipBoard(GetNewCollections()); }, elem, 'beforeEnd', isCollectionPage);
	}
	else {
		createButtons(elem);
	}
	addSortFilterInputs(elem);
})();

function ShowShipDates() {
	// Add :hover to the 'li' for only on hover.
	let cssText = `
div.parent-category-area ul.grid_subcat li .card-title .cat-by-designer p:has(span.shipin-title) {
	display: inline;
}

div.parent-category-area ul.grid_subcat li .card-title > a {
	line-height: 1;
}

div.parent-category-area ul.grid_subcat li p.cat-name {
	margin-bottom: auto;
}
`;

	MyStyles._addStyle(cssText); // 'Shows hidden shipping date'
}

function GetNewCollections() {
	let collection = GetAllCollections();
	return Array.prototype.filter.call(collection, (item) => {
		let link = item.querySelector('a');
		return link.title.indexOf('*') >= 0;
	});
}

function GetAllCollections() {
	let collection = document.querySelectorAll('div.parent-category-area ul.grid_subcat li div.cat-img');
	return collection;
}

async function CollectionsToClipBoard(collection) {
	let result = {
		info: '<html>\n<body>\n',
		count: 0
	};
	collection.forEach((item) => {
		let link = item.querySelector('a');
		let image = link.querySelector('img');
		let title = link.title;
		if (title[0] === '*') title = title.substr(1).trim();
		let current = '<div>' + title + '<img src="' + image.src + '"></div>\n';
		result.info += current;
		result.count++;
	});
	result.info += '</body>\n</html>'

	let msg = 'None found!';
	if (result.count > 0) {
		GM_setClipboard(result.info);
		msg = result.count + ' found and copied!';
	}
	await Notify.log(msg);
}

let blankRegEx = /(?<Prefix>[a-zA-Z]+)?(?<Collection>[0-9]+)(?<LetterBefore>[a-zA-Z]+)?(?:-[ ]*(?:(?<ColourCode>[0-9]+)(?<LetterAfter>[a-zA-Z]+)?)?)?(?:[ ]*(?<ColourName>[\w\ \-\.\/\']+))?/;
let RegexEnum = {
	'Prefix': 1,
	'Collection': 2,
	'LetterBefore': 3,
	'ColourCode': 4,
	'LetterAfter': 5,
	'ColourName': 6,
};

function getCompany() {
	let company = (() => {
		switch (companyEnum) {
			case Company.BlankQuilting: return 'Blank Quilting';
			case Company.StudioE: return 'Studio E';
			case Company.Stof: return 'Stof';
		}
	})();
	return company;
}

function getTitleElement() {
	let titleElement = isSearch ? document.querySelector('h1.page-heading') : document.querySelector('.page-heading > span');
	return titleElement;
}

function getTitle() {
	let titleElement = isSearch ? document.querySelector('div.snize-search-results-header > a.snize-no-products-found-link') : getTitleElement();
	let title = titleElement?.innerText.trim();
	title = title.replace(titleElement.querySelector('span.tg-dropdown-container')?.innerText, '').trim();
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
	let collection;
	if (isCollectionPage) {
		collection = document.querySelectorAll('div.parent-category-area li');
	}
	else if (isSearch) {
		collection = document.querySelectorAll('div.snize-search-results li.snize-product');
	}
	else {
		collection = document.querySelectorAll('main.page-content li.product.item');
	}

	if (!collection || collection.length < 1) {
		Notify.log('Collection elements not found!');
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

	let prefix = (() => {
		switch (companyEnum) {
			case Company.BlankQuilting: return 'BQ';
			case Company.StudioE: return 'BQ';
			case Company.Stof: return '';
		}
	})();
	let title = getFormattedTitle();
	let dates = getReleaseDates();

	if (item.matches('.Full') || item.matches('.FULL')) {
		// Full Collection Item
		let imgElement = item.querySelector('img.card-image');
		let itemName = imgElement.getAttribute('alt');
		if (itemName.indexOf('||') > 0) {
			itemName = itemName.split('||')[0].trim();
		}

		let classList = Array.from(item.classList);
		classList.remove('product', 'item', 'first', 'last');
		if (companyEnum == Company.BlankQuilting) {
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
		colourName = colourName.trim().toTitleCase();
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
	else if (title.endsWith('Digital')) {
		special = 'Digital';
		title = title.replace('Digital', '').trim();
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
		return {
			'itemCode': 'Collection',
			'description': item.CollectionName
		};
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
		let tempCodeColour = ((item.ColourCode.length > 0) ? item.ColourCode + ' ' : '');
		tempCodeColour += (() => {
			switch (companyEnum) {
				case Company.Stof: return '';
				default: return shortenColourName(item.ColourName);
			}
		})();
		itemCode = formatItemCode(item.Prefix, item.CollectionCode + ' ' + tempCodeColour.toUpperCase());

		let widthString = item.Width.Measurement + item.Width.Unit;
		let tempCollection = (() => {
			switch (companyEnum) {
				case Company.BlankQuilting: return item.CollectionName;
				default: return company + ' ' + item.CollectionName;
			}
		})();
		description = formatSapDescription({ 'Colour': item.ColourName, 'Pattern': item.PatternName, 'Collection': tempCollection, 'Special': item.SpecialNotes, 'Material': item.Material, 'Width': 'W' + widthString, 'Repeat': item.Repeat })

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

// https://cdn11.bigcommerce.com/s-par0o0ta6b/images/stencil/500x659/products/15784/24709/3923-30__44151.1716905753.jpg?c=2
// https://cdn11.bigcommerce.com/s-par0o0ta6b/images/stencil/original/products/15804/24729/3923-30__44151.1716905753.jpg?c=2

function formatImage(item) {
	let img = isSearch ? item.querySelector('span.snize-thumbnail img') : item.querySelector('img');
	let result = img.getAttribute('src');
	result = result.replace('/500x659/', '/original/');
	return result;
}

/***********************************************
 * Collection Sorting & Filtering
 ***********************************************/
function getItemContainer() {
	return isCollectionPage ? document.querySelector('div.parent-category-area ul.grid_subcat') : document.querySelector('ul.productGrid');
}

function getCodeFromItem(item) {
	let codeElement = {};
	if (isCollectionPage) {
		codeElement = item.querySelector('div.card-title > a');
	}
	else if (isSearch) {
		codeElement = item.querySelector('span.snize-title');
	}
	else {
		codeElement = item.querySelector('h4.card-title > a');
	}
	return codeElement?.innerText.trim();
}

addSortBy('Default', (item) => {
	let collection = getCodeFromItem(item);
	return [collection]
});

addSortBy('ShipDate', (item) => {
	let collection = getCodeFromItem(item);
	let shipDateElem = item.querySelector('.card-title .cat-by-designer p span.shipin-title');

	let shipDate = Date.parse(shipDateElem?.innerText ?? '01 Jan 1970');
	return [shipDate, collection]
});

function testFilterAgainst(item) {
	let str = getCodeFromItem(item); // item.innerText.toLowerCase().replace('choose options', '').replace('where to buy?', '');
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