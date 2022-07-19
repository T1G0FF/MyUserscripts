// ==UserScript==
// @name         VicText Collection Extractor - Wilmington
// @namespace    http://www.tgoff.me/
// @version      2022.07.19.6
// @description  Gets the names and codes from a Wilmington Collection
// @author       www.tgoff.me
// @match        *://wilmingtonprints.com/*
// @match        *://www.wilmingtonprints.com/*
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/tg-lib.js
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/collection-extract-lib.js
// @grant        GM_setClipboard
// @grant        GM_download
// @runat        document-idle
// ==/UserScript==

var collections = {
	'1150': { 'title': 'Moonscape', 'desc': 'Moonscape' },
};

var knownColours = [
	'White On White',
	'Very Dk. Green',
	'Med. Warm Gold',
	'Dark Royal Blue',
	'Citrus Med. Orange',
	'Citrus Lt. Cherry',
	'Citrus Bright Yellow',
	'Citrus Bright Green',
	'Bubble Gum Pink',
	'Black/Lt. Gray',
	'Whipped Cream',
	'True Navy',
	'Soft Yellow',
	'Sky Blue',
	'Royal Blue',
	'Red/Orange',
	'Purple/Red',
	'Paradise Blue',
	'Pale Violet',
	'Pale Purple',
	'Pale Pink',
	'Pale Blue',
	'Pale Aqua',
	'Orange/Yellow',
	'Orange Peel',
	'New Leaf',
	'Medium Denim',
	'Medium Brown',
	'Med. Brown',
	'Lt. Tan',
	'Lt. Raspberry',
	'Lt. Gray',
	'Lt. Blue',
	'Lime Green',
	'Lightest Taupe',
	'Light Coral',
	'Light Blush',
	'Light Blue',
	'Hot Pink',
	'Holly Green',
	'Gray/Purple',
	'Gray/Pink',
	'Golden Yellow',
	'Forest Green',
	'Dk. Teal',
	'Dk. Purple',
	'Dk. Pink',
	'Dk. Ivory',
	'Dk. Green',
	'Dk. Gray',
	'Dk. Eggplant',
	'Dk. Denim',
	'Dk. Chocolate',
	'Dk. Brown',
	'Dk. Brick',
	'Dk. Blue',
	'Dk. Asphalt',
	'Dark Rust',
	'Dark Red',
	'Dark Gray',
	'Dark Chocolate',
	'Dark Brown',
	'Cherry Red',
	'Butter Yellow',
	'Bright Red',
	'Bright Blue',
	'Blue/Purple',
	'Blue/Green',
	'Blue/Black',
	'Black/Gray',
	'Baby Blue',
	'White',
	'Violet',
	'Turquoise',
	'Tungsten',
	'Teal',
	'Tan',
	'Sunshine',
	'Suede',
	'Stone',
	'Slate',
	'Silver',
	'Shell',
	'Seafoam',
	'Schale',
	'Sand',
	'Ruby',
	'Red',
	'Raisin',
	'Purple',
	'Pewter',
	'Persimmon',
	'Orchard',
	'Orange',
	'Navy',
	'Multi',
	'Matcha',
	'Magenta',
	'Lime',
	'Lavender',
	'Ivory',
	'Hazelnut',
	'Green',
	'Gray',
	'Grape',
	'Goldenrod',
	'Forest',
	'Denim',
	'Daffodil',
	'Cream',
	'Cornflower',
	'Coral',
	'Cookie',
	'Cobalt',
	'Cider',
	'Chocolate',
	'Cherry',
	'Cheddar',
	'Charcoal',
	'Cerulean',
	'Cement',
	'Burgundy',
	'Buff',
	'Brown',
	'Blue',
	'Black',
	'Bark',
	'Aqua',
	'Amethyst',
];

(function () {
	'use strict';
	createButtons(document.querySelector('p#toolbar-amount'), 'beforeBegin');
	//addSortFilterInputs();
})();

function getCompany() {
	let company = 'Wilmington';
	return company;
}

function getTitleElement() {
	let titleElement = undefined;
	return titleElement;
}

function getFormattedTitle() {
	let title = undefined;
	return title;
}

function getAvailabilityDate() {
	//Notify.log('No Date found for Collection!', getFormattedTitle());
	return undefined;
}

function getCollection() {
	let collection = document.querySelectorAll('ol.products.items li.product.item');
	return collection;
}

function getItemObject(itemElement) {
	let codeElement = itemElement.querySelector('div.product.details *[itemprop="name"]');
	if (!codeElement) {
		Notify.log('Code element not found!', itemElement);
		return;
	}

	let givenCode = codeElement.innerText.trim().toUpperCase();

	let codeElements = givenCode.split(' ');
	let collectionCode = codeElements[0];
	let patternCode = codeElements[1];
	let colourCode = codeElements[2];

	let prefix = 'WM';

	let purchaseCode = padWithZeros(collectionCode, 6) + padWithZeros(patternCode, 6) + ' ' + colourCode;

	let descElement = itemElement.querySelector('div.product.details *[itemprop="description"]');
	if (!descElement) {
		Notify.log('Description element not found!', itemElement);
		return;
	}
	let givenDesc = descElement.innerText.trim();
	givenDesc = givenDesc.toTitleCase().replace(' - New', '');

	let descElements = [];
	let patternName = givenDesc.toTitleCase();
	let colourName = givenDesc.toTitleCase();

	for (const key in knownColours) {
		if (Object.hasOwnProperty.call(knownColours, key)) {
			const color = knownColours[key];

			let index = givenDesc.indexOf(color)
			if (index >= 0) {
				patternName = givenDesc.substring(0, index);
				colourName = givenDesc.substring(index + 1);
				break;
			}
		}
	}

	if (colourName && colourName.length > 0) {
		colourName = fixColourName(colourName);
		colourName = colourName.trim().toTitleCase();
	}

	let title = '';
	let special = '';
	let designer = '';

	let material = 'C100%';
	let width = { 'Measurement': '45', 'Unit': 'in' };
	let repeat = '';

	let dates = getReleaseDates();

	return {
		'Prefix': prefix,
		'CollectionCode': collectionCode,
		'PatternCode': patternCode,
		'ColourCode': colourCode,
		'ColourName': colourName,
		'PurchaseCode': purchaseCode,
		'PatternName': patternName,
		'CollectionName': title,
		'SpecialNotes': special,
		'Designer': designer,
		'Material': material,
		'Width': width,
		'Repeat': repeat,
		'ReleaseDates': dates
	};
}

function formatInformation(itemElement) {
	let item = getItemObject(itemElement);
	if (!item) return;

	let tempItemCode = item.CollectionCode + ' ' + item.PatternCode + ' ' + item.ColourCode;
	let itemCode = formatItemCode(item.Prefix, tempItemCode);

	let barCode = formatBarCode(tempItemCode);

	let company = getCompany();
	let widthString = item.Width.Measurement + item.Width.Unit;
	let description = formatSapDescription({ 'Colour': item.ColourName, 'Pattern': item.PatternName, 'Collection': item.CollectionName, 'Special': item.SpecialNotes, 'Material': item.Material, 'Width': 'W' + widthString, 'Repeat': item.Repeat })

	let webName = (((item.ColourName.length > 0) ? item.ColourName + ' - ' : '') + item.PatternName);

	let relDateString = toReleaseString(item.ReleaseDates);
	let comma = item.SpecialNotes && item.SpecialNotes.length > 0 ? ', ' : '';
	let designer = item.Designer && item.Designer.length > 0 ? comma + 'By ' + item.Designer : '';
	let webDesc = formatWebDescription({ 'Collection': item.CollectionName, 'Notes': item.SpecialNotes + designer, 'Fibre': item.Material, 'Width': widthString, 'Release': relDateString, 'Delivery From': item.ReleaseDates.Delivery });
	let delDateString = "Not Given - " + toDeliveryString(item.ReleaseDates);

	let webCategory = item.CollectionName;

	let result = { 'itemCode': itemCode, 'barCode': barCode, 'description': description, 'webName': webName, 'webDesc': webDesc, 'delDate': delDateString, 'purchaseCode': item.PurchaseCode, 'webCategory': webCategory };
	return result;
}

// https://wilmingtonprints.com/pub/media/catalog/product/cache/b2dc3f25879ce9c2207d16fffde75f0f/Q/1/Q1013-51000-100_1.jpg
// https://wilmingtonprints.com/pub/media/catalog/product/cache/c9e0b0ef589f3508e5ba515cde53c5ff/Q/1/Q1013-51000-100_1.jpg

function formatImage(itemElement) {
	let img = itemElement.querySelector('img.product-image-photo') ;
	let result = img.getAttribute('src');
	result = result.replace('b2dc3f25879ce9c2207d16fffde75f0f', 'c9e0b0ef589f3508e5ba515cde53c5ff');
	return result;
}

/***********************************************
 * Collection Sorting & Filtering
 ***********************************************/
function getItemContainer() {
	return document.querySelector('div#P_Items_Listing_Img_Class');
}

function getCodeFromItem(item) {
	let codeElements = item.querySelectorAll('td.ItemsListingInfo > table td');
	if (codeElements.length > 0) {
		let code = codeElements[0].innerText.substring(codeElements[0].innerText.indexOf('-') + 1).trim();
		let colour = codeElements[1].innerText.trim();
		return code + ' ' + colour;
	}
}

addSortBy('Default', (item) => {
	let codeElements = item.querySelectorAll('td.ItemsListingInfo > table td');
	if (codeElements.length > 0) {
		let collection = codeElements[0].innerText.trim();
		let code = '';
		let dash = codeElements[0].innerText.indexOf('-')
		if (dash > 0) {
			code = collection.substring(dash + 1).trim();
			collection = collection.substring(0, dash).trim();
		}
		let colour = codeElements[1].innerText.trim();
		return [collection, code, colour];
	}
});

addSortBy('Code', (item) => {
	let codeElements = item.querySelectorAll('td.ItemsListingInfo > table td');
	if (codeElements.length > 0) {
		let code = codeElements[0].innerText.substring(codeElements[0].innerText.indexOf('-') + 1).trim();
		let colour = codeElements[1].innerText.trim();
		return [code, colour];
	}
});

addSortBy('Colours', (item) => {
	let codeElements = item.querySelectorAll('td.ItemsListingInfo > table td');
	if (codeElements.length > 0) {
		let code = codeElements[0].innerText.substring(codeElements[0].innerText.indexOf('-') + 1).trim();
		let colour = codeElements[1].innerText.trim();
		return [colour, code];
	}
});

function testFilterAgainst(item) {
	let codeElements = item.querySelectorAll('td.ItemsListingInfo');
	let str = '';
	for (const key in codeElements) {
		if (Object.hasOwnProperty.call(codeElements, key)) {
			const element = codeElements[key];
			str += element.innerText + ' ';
		}
	}
	return str.trim();
}

function addFilterMatchStyle(item) {
	let elem = item.querySelector('tr:nth-of-type(2)');
	if (elem) elem.style.boxShadow = 'green inset 0 25px 5px -20px';
}

function removeFilterMatchStyle(item) {
	let elem = item.querySelector('tr:nth-of-type(2)');
	if (elem) elem.style.boxShadow = '';
}