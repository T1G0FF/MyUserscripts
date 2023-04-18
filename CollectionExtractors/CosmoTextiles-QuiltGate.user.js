// ==UserScript==
// @name         VicText Collection Extractor - Cosmo Textiles / Quilt Gate
// @namespace    http://www.tgoff.me/
// @version      2023.04.18.2
// @description  Gets the names and codes from a Cosmo Textiles / Quilt Gate Collection
// @author       www.tgoff.me
// @match        *://www.quilt-gate.com/eng/detail.php?*
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/tg-lib.js
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/collection-extract-lib.js
// @grant        GM_setClipboard
// @grant        GM_download
// @run-at       document-idle
// ==/UserScript==

(function () {
	'use strict';
	createButtons();
})();

function getCompany() {
	let company = 'Cosmo Textiles';
	return company;
}

function getTitleElement() {
	let titleElement = document.querySelector('div#mainContent table td h3')
	return titleElement;
}

function getTitle() {
	let titleElement = getTitleElement();
	let title = titleElement?.innerText.trim();
	title = title.replace(titleElement.querySelector('span.tg-dropdown-container')?.innerText, '').trim();
	if (title.indexOf(' - ') > 0) title = title.split(' - ')[0];
	return title;
}

function getCollection() {
	let collection = document.querySelectorAll('div#mainContent table div.product_box_subimage');
	return collection;
}

function getAvailabilityDate() {
	// Not Given
	return undefined;
}

let CosmoRegEx = /([A-z]+[0-9]+)_([0-9]+)([A-z]+)/;
let RegexEnum = {
	'Collection': 1,
	'Pattern': 2,
	'Colour': 3,
};

function getItemObject(item) {
	let imgLink = item.querySelector('a')?.getAttribute('href');
	if (!imgLink) {
		Notify.log('No image link found for Item!', item);
		return;
	}

	let codeMatches = /products_photo\/(.*?)\.jpg/.exec(imgLink);
	if (!codeMatches || codeMatches.length <= 1) {
		Notify.log('No matches found in link for Item!', item);
		return;
	}

	let givenCode = codeMatches[1];

	let prefix = 'QG';

	CosmoRegEx.lastIndex = 0;
	let matches = CosmoRegEx.exec(givenCode);
	if (!matches || matches.length <= 1) {
		Notify.log('No matches found for Item!', item);
		return;
	}

	let collectionCode = matches[RegexEnum.Collection];
	let patternCode = padWithZeros(matches[RegexEnum.Pattern], 3);
	let colourCode = matches[RegexEnum.Colour].toUpperCase();

	let purchaseCode = formatPurchaseCode(matches[RegexEnum.Collection] + '-' + matches[RegexEnum.Pattern] + matches[RegexEnum.Colour]);

	let title = getFormattedTitle();
	let special = '';

	let material = 'C100%';
	let width = { 'Measurement': '45', 'Unit': 'in' };
	let repeat = '';

	let dates = getReleaseDates();

	return {
		'Prefix': prefix,
		'CollectionCode': collectionCode,
		'PatternCode': patternCode,
		'ColourCode': colourCode,
		'PurchaseCode': purchaseCode,
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

	let itemCode = formatItemCode(item.Prefix, item.CollectionCode + ' ' + item.PatternCode + item.ColourCode);

	let barCode = formatBarCode(itemCode.replaceAll(' ', ''));

	let company = getCompany();
	let widthString = item.Width.Measurement + item.Width.Unit;
	let description = formatSapDescription({ 'Collection': item.CollectionName, 'Special': item.SpecialNotes, 'Material': item.Material, 'Width': 'W' + widthString, 'Repeat': item.Repeat })

	let collectionName = item.CollectionName;

	let webName = collectionName;

	let relDateString = toReleaseString(item.ReleaseDates);
	let webDesc = formatWebDescription({ 'Collection': item.CollectionName, 'Notes': item.SpecialNotes, 'Fibre': item.Material, 'Width': widthString, 'Release': relDateString, 'Delivery From': item.ReleaseDates.Delivery });
	let delDateString = "Not Given - " + toDeliveryString(item.ReleaseDates);

	let result = { 'itemCode': itemCode, 'barCode': barCode, 'description': description, 'webName': webName, 'webDesc': webDesc, 'delDate': delDateString, 'purchaseCode': item.PurchaseCode, 'webCategory': item.CollectionName };
	return result;
}

// https://www.cosmo-tex.co.jp/quilt_gate/products_photo/RU2450_11A.jpg
function formatImage(item) {
	var imgLink = item.querySelector('a');
	let result = getAbsolutePath(imgLink.getAttribute('href'));
	return result;
}