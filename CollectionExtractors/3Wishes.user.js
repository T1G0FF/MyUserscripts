// ==UserScript==
// @name         VicText Collection Extractor - 3 Wishes
// @namespace    http://www.tgoff.me/
// @version      2021.04.22.2
// @description  Gets the names and codes from a 3 Wishes Collection
// @author       www.tgoff.me
// @match        *://www.fabriceditions.com/shop/3-Wishes-*-Collections/*
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/tg-lib.js
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/collection-extract-lib.js
// @grant        GM_setClipboard
// @grant        GM_download
// @runat        document-idle
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

let ThreeWishesRegEx = /([0-9]{5})-([\w]+)-([\w]+)(?:-([\w]+))*/;
let RegexEnum = {
	'Code': 1,
	'Colour': 2,
	'Type': 3,
};

let ColourLookup = {
	'BLK': 'Black',
	'BLU': 'Blue',
	'BRN': 'Brown',
	'CHC': 'Charcoal',
	'CHR': 'Charcoal',
	'COR': 'Coral',
	'CRL': 'Coral',
	'CRM': 'Cream',
	'GLD': 'Gold',
	'GRN': 'Green',
	'GRY': 'Grey',
	'MAN': 'Mango',
	'MGN': 'Magenta',
	'MLT': 'Multi',
	'MNT': 'Mint',
	'MUL': 'Multi',
	'NAV': 'Navy',
	'NVY': 'Navy',
	'ORG': 'Orange',
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

function formatInformation(item) {
	let title = getFormattedTitle();
	let company = getCompany();

	let givenCode = getCodeFromItem(item);

	let itemCode = '';
	let barCode = '';
	let purchaseCode = givenCode;
	let material = 'C100%';
	let width = title.includes('108') ? 'W108in' : 'W45in';

	ThreeWishesRegEx.lastIndex = 0;
	let matches = ThreeWishesRegEx.exec(givenCode);
	let separator = '';
	if (!matches || matches.length <= 1) {
		//Notify.log('No matches found for Item!', item);
		return;
	}

	let givenColourName = matches[RegexEnum.Colour].toUpperCase();
	let colourName = '';
	if (ColourLookup.hasOwnProperty(givenColourName)) {
		colourName = ColourLookup[givenColourName];
	} else {
		if (givenColourName.startsWith('LT')) {
			colourName = givenColourName.replace('LT', 'Light ').toLowerCase().toTitleCase();
		} else {
			colourName = givenColourName.toLowerCase().toTitleCase();
		}
	}

	let givenType = matches[RegexEnum.Type].toUpperCase();
	let typeName = TypeLookup.hasOwnProperty(givenType) ? TypeLookup[givenType] : '';
	switch (givenType) {
		default:
		case 'CTN':
			break;
		case 'FLN':
			title += typeName.length > 0 ? ' - ' + typeName : '';
			break;
		case 'AST':
			return;
	}

	itemCode = formatItemCode('FT', matches[RegexEnum.Code] + ' ' + givenColourName);
	barCode = formatBarCode(itemCode);

	let webName = colourName.trim().toTitleCase(false) + ' - ' + title;
	let webDesc = material + ' - ' + width;
	let description = webName + ' - ' + webDesc;

	let delDate = "Not Given - " + toDeliveryString(getReleaseDates());

	let result = { 'itemCode': itemCode, 'barCode': barCode, 'description': description, 'webName': webName, 'webDesc': webDesc, 'delDate': delDate, 'purchaseCode': purchaseCode };
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
	return item.querySelector('p.cItemTitle').innerHTML.split('<br>')[1];
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