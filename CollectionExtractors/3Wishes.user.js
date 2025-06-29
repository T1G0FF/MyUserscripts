// ==UserScript==
// @name         # VicText Collection Extractor - 3 Wishes
// @namespace    http://www.tgoff.me/
// @version      2023.03.21.8
// @description  Gets the names and codes from a 3 Wishes Collection
// @author       www.tgoff.me
// @match        *://fabriceditions.com/shop/3-Wishes-*-Collections/*
// @match        *://*.fabriceditions.com/shop/3-Wishes-*-Collections/*
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/tg-lib.js
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/collection-extract-lib.js
// @grant        GM_setClipboard
// @grant        GM_download
// @run-at       document-idle
// ==/UserScript==

(function () {
	'use strict';
	createButtons();
	addSortFilterInputs();
})();

function getCompany() {
	return '3 Wishes';
}

function getTitleElement() {
	return document.querySelector('div.container > div.row > div[align*="center"] > h1');
}

function getCollection() {
	return document.querySelectorAll('div.cItemDivContainer');
}

let ThreeWishesRegEx = /^([0-9]{5}|[\w]+)(?:-([\w ]+))?(?:-([\w]+)-([\w]+))?$/;
let RegexEnum = {
	'Purchase': 0,
	'Code': 1,
	'Colour': 2,
	'Type': 3,
};

let ColourLookup = {
	'AQU': 'Aqua',
	'BGE': 'Beige',
	'BLK': 'Black',
	'BLU': 'Blue',
	'BRN': 'Brown',
	'BRK': 'Brick',
	'CHC': 'Charcoal',
	'CHR': 'Charcoal',
	'COR': 'Coral',
	'CRL': 'Coral',
	'CRM': 'Cream',
	'GLD': 'Gold',
	'GRN': 'Green',
	'GRY': 'Grey',
	'LIL': 'Lilac',
	'MAN': 'Mango',
	'MGN': 'Magenta',
	'MLN': 'Melon',
	'MLT': 'Multi',
	'MNT': 'Mint',
	'MUL': 'Multi',
	'NAV': 'Navy',
	'NVY': 'Navy',
	'ORG': 'Orange',
	'PLM': 'Plum',
	'PNK': 'Pink',
	'PNL': 'Panel',
	'PRP': 'Purple',
	'PUR': 'Purple',
	'RED': 'Red',
	'ROY': 'Royal Blue',
	'SLT': 'Slate',
	'SLV': 'Silver',
	'SND': 'Sand',
	'TAN': 'Tan',
	'TRQ': 'Turquoise',
	'WHT': 'White',
	'WOC': 'White on Cream',
	'WOW': 'White on White',
	'YEL': 'Yellow',
	'YLW': 'Yellow',
}

let TypeLookup = {
	'CTN': 'Cotton',
	'FLN': 'Flannel',
	'AST': 'Assorted',
}

function getItemObject(itemElement) {
	let item = itemElement;

	let givenCode = getCodeFromItem(item);

	ThreeWishesRegEx.lastIndex = 0;
	let matches = ThreeWishesRegEx.exec(givenCode);
	if (!matches || (matches.filter(i => i !== undefined).length - 1) <= 1) {
		//Notify.log('No matches found for Item!', item);
		return;
	}

	let prefix = 'FT';
	let collectionCode = matches[RegexEnum.Code];
	let purchaseCode = matches[RegexEnum.Purchase].toUpperCase();
	let title = getFormattedTitle();
	let dates = getReleaseDates();
	let special = '';

	let givenType = matches[RegexEnum.Type]?.toUpperCase() ?? '';
	let typeName = TypeLookup.hasOwnProperty(givenType) ? TypeLookup[givenType] : '';
	switch (givenType) {
		default:
		case 'CTN':
			break;
		case 'FLN':
			special = special.length > 0 ? special + ', ' + typeName : typeName;
			break;
		case 'FQBX':
			// Fat Quarter Box
			return;
		case 'AST':
			// Full Collection Item
			prefix = '3W';
			let itemName = title + ' Full Collection';

			let countingElements = document.querySelectorAll('div.cItemDivContainer div.cItemTitleDiv p.cItemTitle');
			let collectionCount = 0
			let ignoreTypes = ['AST', 'FQBX']
			for (const countingElement in countingElements) {
				if (countingElements.hasOwnProperty(countingElement)) {
					const element = countingElements[countingElement];
					let testCode = getCodeFromItemHtml(element.innerHTML);

					let ignore = false;
					for (const ignoreType of ignoreTypes) {
						ignore = ignore || testCode.indexOf(ignoreType) >= 0;
					}

					ThreeWishesRegEx.lastIndex = 0;
					if (!ignore && ThreeWishesRegEx.test(testCode)) {
						collectionCount++;
					}
				}
			}

			return {
				'isFullCollection': true,
				'Prefix': 'COL-' + prefix,
				'CollectionCode': collectionCode,
				'PurchaseCode': purchaseCode,
				'CollectionName': title,
				'ItemName': itemName,
				'CollectionCount': collectionCount,
				'BoltLength': { 'Measurement': '11', 'Unit': 'm' },
				'ReleaseDates': dates,
			};
	}

	let colourCode = matches[RegexEnum.Colour].toUpperCase();
	let colourName = '';
	if (ColourLookup.hasOwnProperty(colourCode)) {
		colourName = ColourLookup[colourCode];
	} else {
		console.log('Unlisted Colour: ' + givenCode + " | " + colourCode);
		colourCode = colourCode.replace(' ', '');
		if (colourCode.startsWith('LT')) {
			colourName = colourCode.replace('LT', 'Light ').toLowerCase().toTitleCase();
		}
		else if (colourCode.startsWith('DK')) {
			colourName = colourCode.replace('DK', 'Dark ').toLowerCase().toTitleCase();
		} else {
			colourName = colourCode.toLowerCase().toTitleCase();
		}
	}

	let parent = document.querySelector('div.cItemsContainer').parentElement;
	let infoElements = parent.querySelectorAll('div[style="text-align: center;"]');

	let designer = '';
	for (const infoElem of infoElements) {
		let innerText = infoElem.innerText;
		if (innerText.toUpperCase().indexOf('DIGITALLY PRINTED') >= 0) {
			special = 'Digital';
			continue;
		}
		if (innerText.toUpperCase().indexOf('METALLIC') >= 0) {
			special = 'Metallic';
			continue;
		}
		if (innerText.toUpperCase().indexOf('GLITTER') >= 0) {
			special = 'Glitter';
			continue;
		}
		if (innerText.toUpperCase().indexOf('LICENSED BY') >= 0) {
			designer = innerText.substring('LICENSED BY'.length).trim();
			continue;
		}
	}

	if (!designer) {
		infoElements = parent.querySelectorAll('table[style*="margin-left: auto; margin-right: auto;"] tr')

		for (const infoElem of infoElements) {
			let innerText = infoElem.innerText;
			if (innerText.toUpperCase().indexOf('LICENSED BY') >= 0) {
				designer = innerText.substring('LICENSED BY'.length).trim();
				if (!designer) {
					designer = infoElem.querySelector('img')?.getAttribute('alt') ?? '';
				}
				continue;
			}
		}
	}

	let material = 'C100%';
	let width = { 'Measurement': '45', 'Unit': 'in' };
	let repeat = '';

	return {
		'Prefix': prefix,
		'CollectionCode': collectionCode,
		'ColourCode': colourCode,
		'ColourName': colourName,
		'PurchaseCode': purchaseCode,
		'CollectionName': title,
		'SpecialNotes': special,
		'Designer': designer,
		'Material': material,
		'Width': width,
		'Repeat': repeat,
		'ReleaseDates': dates,
	};
}

function formatInformation(itemElement) {
	let item = getItemObject(itemElement);
	if (!item) return;

	let company = getCompany();
	let itemCode = '';
	let barCode = '';
	let description = '';
	let webName = '';
	let webDesc = '';

	let relDateString = toReleaseString(item.ReleaseDates);
	let delDateString = "Not Given - " + toDeliveryString(item.ReleaseDates);

	if (item.Designer && item.Designer.length > 0) {
		item.CollectionName = item.CollectionName.replace(' By ' + item.Designer, '');
	}

	if (item.isFullCollection) {
		itemCode = formatItemCode(item.Prefix, item.CollectionCode);
		barCode = formatBarCode(itemCode.replace('-', ''));
		// 3 Wishes Amazement Park Collection
		webName = company + ' ' + item.ItemName;
		// 3 Wishes Amazement Park Collection - 8pc - 12yd Bolts
		let boltString = item.BoltLength.Measurement + item.BoltLength.Unit;
		description = webName + ' - ' + item.CollectionCount + 'pc - ' + boltString + ' Bolts';

		webDesc = formatWebDescription({ 'Collection': item.CollectionCount + ' Bolts', 'Bolts': boltString, 'Release': relDateString, 'Delivery From': item.ReleaseDates.Delivery });
	}
	else {
		itemCode = formatItemCode(item.Prefix, item.CollectionCode + ' ' + item.ColourCode);
		barCode = formatBarCode(itemCode);

		let widthString = item.Width.Measurement + item.Width.Unit;
		description = formatSapDescription({ 'Colour': item.ColourName, 'Pattern': item.PatternName, 'Collection': item.CollectionName, 'Special': item.SpecialNotes, 'Material': item.Material, 'Width': 'W' + widthString, 'Repeat': item.Repeat })

		let comma = item.SpecialNotes && item.SpecialNotes.length > 0 ? ', ' : '';
		let designer = item.Designer && item.Designer.length > 0 ? comma + 'By ' + item.Designer : '';

		webName = (((item.ColourName.length > 0) ? item.ColourName + ' - ' : '') + item.CollectionName);
		webDesc = formatWebDescription({ 'Collection': item.CollectionName, 'Notes': item.SpecialNotes + designer, 'Fibre': item.Material, 'Width': widthString, 'Release': relDateString, 'Delivery From': item.ReleaseDates.Delivery });
	}

	let webCategory = item.CollectionName;

	let result = { 'itemCode': itemCode, 'barCode': barCode, 'description': description, 'webName': webName, 'webDesc': webDesc, 'delDate': delDateString, 'purchaseCode': item.PurchaseCode, 'webCategory': webCategory };
	return result;
}

function formatImage(item) {
	return item.querySelector('img.cItemImage').getAttribute('src');
}

/***********************************************
 * Collection Sorting & Filtering
 ***********************************************/
function getItemContainer() {
	return document.querySelector('div.cItemsContainer');
}

function getCodeFromItem(item) {
	let innerHTML = item.querySelector('p.cItemTitle').innerHTML;
	return getCodeFromItemHtml(innerHTML);
}

function getCodeFromItemHtml(innerHTML) {
	var code = innerHTML.indexOf('<br>') >= 0 ? innerHTML.split('<br>')[1] : innerHTML.substring(innerHTML.lastIndexOf(' ') + 1)
	return code.trim();
}

function compareCodes(aCode, bCode) {
	return comp(aCode, bCode);
}

function testFilterAgainst(item) {
	let elem = item.querySelector('p.cItemTitle');
	if (elem) return elem.innerText;
}

function addFilterMatchStyle(item) {
	let elem = item.querySelector('div.cItemTitleDiv');
	if (elem) elem.style.boxShadow = 'green inset 0 25px 5px -20px';
}

function removeFilterMatchStyle(item) {
	let elem = item.querySelector('div.cItemTitleDiv');
	if (elem) elem.style.boxShadow = '';
}