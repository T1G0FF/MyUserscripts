// ==UserScript==
// @name         # VicText Collection Extractor - Daruma
// @namespace    http://www.tgoff.me/
// @version      2023.03.21.1
// @description  Gets the names and codes from a Daruma product page
// @author       www.tgoff.me
// @match        *://www.daruma-ito.co.jp/products/*
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/tg-lib.js
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/collection-extract-lib.js
// @grant        GM_setClipboard
// @grant        GM_download
// @run-at        document-idle
// ==/UserScript==

(function () {
	'use strict';
	createButtons(getTitleElement(), "beforeend");
})();

function getCompany() {
	let company = 'Daruma';
	return company;
}

function getTitleElement() {
	let titleElement = document.querySelector('#item > div.group > div.title:nth-of-type(3)');
	if (!titleElement) {
		titleElement = document.querySelector('#item > div.group > div.title');
	}
	return titleElement;
}

function getCollection() {
	let collection = document.querySelectorAll('#item > div.group > div[class^="col"] > dl');
	return collection;
}

function getItemObject(itemElem) {
	let infoContainerElement = itemElem.closest('#item > div.group')?.querySelector('ul:not(.add-img):last-of-type');
	if (!infoContainerElement) {
		Notify.log('Information container element not found!', itemElem);
		return;
	}

	let givenCode = '';
	let givenFibre = '';
	let givenLength = '';

	for (let infoElement of infoContainerElement.querySelectorAll('li')) {
		if (infoElement.innerText.startsWith('Code：')) {
			givenCode = infoElement.innerText.split('：')[1];
			if (givenCode.indexOf('／') > 0) {
				givenCode = givenCode.split('／')[0];
			}
			givenCode = givenCode.trim();
		}
		else if (infoElement.innerText.startsWith('Quality：')) {
			givenFibre = infoElement.innerText.split('：')[1];
			givenFibre = givenFibre.trim();
		}
		else if (infoElement.innerText.startsWith('Quantity：')) {
			givenLength = infoElement.innerText.split('：')[1];
			givenLength = givenLength.trim();
		}
	}

	let collectionCode = givenCode.toUpperCase();

	let prefix = 'KI';

	let colorElement = itemElem.querySelector('dd');
	if (!colorElement) {
		Notify.log('Colour element not found!', itemElem);
		return;
	}

	let colourCode = colorElement.innerText.split('\n')[0];
	colourCode = colourCode.match(/[0-9]+/g); // Remove Japanese characters from colour code.
	colourCode = padWithZeros(colourCode, 3);

	let colourName = colorElement.innerText.split('\n')[1] ?? '';
	if (colourName && colourName.length > 0) {
		colourName = fixColourName(colourName);
		colourName = colourName.trim().toTitleCase();
	}

	let purchaseCode = formatPurchaseCode(collectionCode + '-' + colourCode);

	let patternName = '';

	let title = getFormattedTitle();
	let special = '';
	let material = '';
	if (givenFibre === '100% Cotton') {
		material = 'C100%';
	}
	else {
		material = givenFibre;
	}

	let width = { 'Measurement': givenLength, 'Unit': '' };

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
	};
}

function formatInformation(itemElement) {
	// Ignore items that are actually follow up images.
	if (!itemElement.closest('div.col2')) {
		return;
	}

	let item = getItemObject(itemElement);
	if (!item) return;

	let itemCode = formatItemCode(item.Prefix, item.CollectionCode + ' ' + item.ColourCode);

	let barCode = formatBarCode(itemCode);

	let company = getCompany();
	let widthString = item.Width.Measurement + item.Width.Unit;
	let description = formatSapDescription({ 'Colour': item.ColourName, 'Pattern': item.PatternName, 'Collection': item.CollectionName, 'Special': item.SpecialNotes, 'Material': item.Material, 'Width': 'W' + widthString, 'Repeat': item.Repeat })

	let webName = (((item.ColourName.length > 0) ? item.ColourName + ' - ' : '') + item.PatternName);

	let webDesc = formatWebDescription({ 'Collection': item.CollectionName, 'Fibre': item.Material, 'Width': widthString });

	let webCategory = item.CollectionName;

	let result = { 'itemCode': itemCode, 'barCode': barCode, 'description': description, 'webName': webName, 'webDesc': webDesc, 'purchaseCode': item.PurchaseCode, 'webCategory': webCategory };
	return result;
}

// http://www.daruma-ito.co.jp/products/img/01-2400-0201.jpg
function formatImage(item) {
	let imageUrl = item.querySelector('dt img').getAttribute('src');
	return imageUrl;
}