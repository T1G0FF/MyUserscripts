// ==UserScript==
// @name         VicText Collection Extractor - Wilmington
// @namespace    http://www.tgoff.me/
// @version      2022.07.19.10
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

var knownColours = [
	'Vanilla (White on White)',
	'White/Navy Blue',
	'White/Lt. Blue',
	'White on White',
	'Very Light Gray',
	'Very Dk. Green',
	'Very Dk. Brown',
	'Rustic Blue/White',
	'Royal Blue/White',
	'Red on Red',
	'Navy on Navy',
	'Med. Warm Gold',
	'Med. Lt. Purple',
	'Med. Dk. Purple',
	'Med. Dk. Brown',
	'Med. Dark Green',
	'Med. Dark Gray',
	'Lt. Leaf Green',
	'Lt. Bright Orange',
	'Dark Royal Blue',
	'Cream on Cream',
	'Citrus Med. Orange',
	'Citrus Lt. Cherry',
	'Citrus Bright Yellow',
	'Citrus Bright Green',
	'Bubble Gum Pink',
	'Bright Lime Green',
	'Black/Lt. Gray',
	'Black on Black',
	'Black & White',
	'Winter Navy',
	'White/Yellow',
	'White/Teal',
	'White/Red',
	'White/Purple',
	'White/Pink',
	'White/Multi',
	'White/Green',
	'White/Gray',
	'White/Blue',
	'White/Black',
	'Whipped Cream',
	'Very Black',
	'True Navy',
	'Tomato/White',
	'Teal/Yellow',
	'Teal/Aqua',
	'Soft Yellow',
	'Soda Water',
	'Sky Blue',
	'Sea Foam',
	'Ruby Slippers',
	'Royal Navy',
	'Royal Blue',
	'Rich Blue',
	'Red/Orange',
	'Purple/Red',
	'Purple/Multi',
	'Paradise Blue',
	'Pale Violet',
	'Pale Purple',
	'Pale Pink',
	'Pale Gray',
	'Pale Blue',
	'Pale Aqua',
	'Orange/Yellow',
	'Orange Peel',
	'Off Black',
	'New Leaf',
	'Navy/White',
	'Navy Blue',
	'Mulberry/White',
	'Mixed Berry',
	'Mint Green',
	'Midnight Blue',
	'Medium Teal',
	'Medium Denim',
	'Medium Cream',
	'Medium Brown',
	'Medium Blue',
	'Med. Teal',
	'Med. Tan',
	'Med. Purple',
	'Med. Gray',
	'Med. Charcoal',
	'Med. Brown',
	'Med. Blue',
	'Magenta/Multi',
	'Lt. Yellow',
	'Lt. Turquiose',
	'Lt. Tan',
	'Lt. Raspberry',
	'Lt. Purple',
	'Lt. Ivory',
	'Lt. Green',
	'Lt. Gray',
	'Lt. Cream',
	'Lt. Charcoal',
	'Lt. Blue',
	'Lime Green',
	'Lightest Taupe',
	'Lightest Purple',
	'Light Teal',
	'Light Navy',
	'Light Gray',
	'Light Denim',
	'Light Cream',
	'Light Coral',
	'Light Blush',
	'Light Blue',
	'Lemon Lime',
	'Kiwi Green',
	'Key Lime',
	'Ivory/Red',
	'Ivory/Black',
	'Island Punch',
	'Hot Pink',
	'Holly Green',
	'Holiday Red',
	'Holiday Green',
	'Green/Yellow',
	'Green/Blue',
	'Green Apple',
	'Gray/Purple',
	'Gray/Pink',
	'Gray/Black',
	'Golden/White',
	'Golden Yellow',
	'Forest Green',
	'Flannel Black',
	'Emerald Green',
	'Electric Blue',
	'Dk. Teal',
	'Dk. Tan',
	'Dk. Royal',
	'Dk. Red',
	'Dk. Purple',
	'Dk. Pink',
	'Dk. Ivory',
	'Dk. Green',
	'Dk. Gray',
	'Dk. Eggplant',
	'Dk. Denim',
	'Dk. Cream',
	'Dk. Chocolate',
	'Dk. Charcoal',
	'Dk. Brown',
	'Dk. Brick',
	'Dk. Blue',
	'Dk. Asphalt',
	'Darkest Purple',
	'Dark Teal',
	'Dark Rust',
	'Dark Red',
	'Dark Purple',
	'Dark Ivory',
	'Dark Green',
	'Dark Gray',
	'Dark Denim',
	'Dark Chocolate',
	'Dark Brown',
	'Dark Blue',
	'Cream/Pink',
	'Cream/Multi',
	'Cream/Green',
	'Cream/Blue',
	'Cream/Black',
	'Cream/Aqua',
	'Cotton Candy',
	'Cherry Red',
	'Butter Yellow',
	'Burnt Brown',
	'Bubble Gum',
	'Brown/Taupe',
	'Bright Yellow',
	'Bright Red',
	'Bright Lime',
	'Bright Green',
	'Bright Blue',
	'Bright Aqua',
	'Blueberry Cream',
	'Blue/Purple',
	'Blue/Green',
	'Blue/Black',
	'Blue Raspberry',
	'Black/White',
	'Black/Red',
	'Black/Multi',
	'Black/Gray',
	'Baby Blue',
	'Aqua/Multi',
	'Aqua Marine',
	'Yellow',
	'White-on-White',
	'White',
	'Violet',
	'Turquoise',
	'Tungsten',
	'Teal',
	'Taupe',
	'Tan',
	'Sunshine',
	'Suede',
	'Stone',
	'Slate',
	'Silver',
	'Shell',
	'Seafoam',
	'Schale',
	'Sandstone',
	'Sand',
	'Ruby',
	'Red',
	'Raisin',
	'Purple',
	'Platinum',
	'Pink',
	'Pineapple',
	'Pewter',
	'Persimmon',
	'Periwinkle',
	'Passion',
	'Orchard',
	'Orange',
	'Onyx',
	'Navy',
	'Multi',
	'Mist',
	'Mint',
	'Meringue',
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
	'Gold',
	'Fuchsia',
	'Forest',
	'Emerald',
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
	'Carmel',
	'Caramel',
	'Burgundy',
	'Buff',
	'Brown',
	'Blue',
	'Black',
	'Bark',
	'Aqua',
	'Amethyst'
];

(function () {
	'use strict';
	setInterval(function () {
		if (!document.querySelector('tg-dropdown-container')) {
			createButtons(document.querySelector('p#toolbar-amount'), 'beforeBegin');
			//addSortFilterInputs();
		}
	}, 250); // Check every 250ms
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
	givenDesc = givenDesc.toTitleCase().replace(', ', ' ');
	givenDesc = givenDesc.toTitleCase().replace(' - New', '');

	if (givenDesc.toUpperCase().indexOf('KARAT') >= 0 ) return; // Ignore Precuts

	let descElements = [];
	let patternName = givenDesc.toTitleCase();
	let colourName = givenDesc.toTitleCase();

	for (const key in knownColours) {
		if (Object.hasOwnProperty.call(knownColours, key)) {
			const color = knownColours[key];

			let index = givenDesc.toUpperCase().indexOf(color.toUpperCase());
			if (index >= 0) {
				patternName = givenDesc.substring(0, index - 1);
				colourName = givenDesc.substring(index);
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