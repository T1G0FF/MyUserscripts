// ==UserScript==
// @name         VicText Collection Extractor - Cosmo Textiles / Quilt Gate
// @namespace    http://www.tgoff.me/
// @version      2023.07.11.9
// @description  Gets the names and codes from a Cosmo Textiles / Quilt Gate Collection
// @author       www.tgoff.me
// @match        *://www.quilt-gate.com/eng/detail.php?*
// @match        *://cosmo-tex.co.jp/hcd/search_detail.php?*
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/tg-lib.js
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/collection-extract-lib.js
// @grant        GM_setClipboard
// @grant        GM_download
// @run-at       document-idle
// ==/UserScript==

let isCosmo = false;
(function () {
	'use strict';
	isCosmo = window.location.hostname.includes('cosmo-tex');
	createButtons();
})();

function getCompany() {
	let company = 'Cosmo Textiles';
	return company;
}

function getTitleElement() {
	let titleElement = isCosmo ? document.querySelector('div#main_content_box h2 span:last-of-type') : document.querySelector('div#mainContent table td h3');
	return titleElement;
}

function getTempTitle() {
	var tempTitle = document.querySelector('div#main_content_box h2 span strong')?.innerText;
	if (tempTitle.indexOf('【品番】') >= 0) tempTitle = tempTitle.split('【品番】')[1];
	return tempTitle.trim();
}

function getTitle() {
	let titleElement = getTitleElement();
	let title = titleElement?.innerText.trim();
	title = title.replace(titleElement.querySelector('span.tg-dropdown-container')?.innerText, '').trim();

	if (isCosmo) {
		let tempTitle = getTempTitle();

		if (title.indexOf('（') >= 0) title = title.split('（')[1];
		if (title.indexOf('）') >= 0) title = title.split('）')[0];
		if (title.indexOf('商品名 ：') >= 0) title = title.split('商品名 ：')[1];
		title = title.replace(tempTitle, '');
	}
	else {
		if (title.indexOf(' - ') >= 0) title = title.split(' - ')[0];
	}

	return title.trim();
}

function getCollection() {
	let collection;
	if (isCosmo) {
		collection = document.querySelectorAll('div#main_content_box table a[data-lightbox="color_img"]');
		if (!collection || collection.length < 1) {
			collection = document.querySelectorAll('div#main_content_box table[bordercolor="#CCCCCC"] tr td:first-of-type[align="center"]:not([bgcolor^="#"])');
		}
	}
	else {
		collection = document.querySelectorAll('div#mainContent table div.product_box_subimage a');
	}
	return collection;
}

function getAvailabilityDate() {
	// Not Given
	return undefined;
}

let CosmoRegEx = /([A-Z]+[0-9]+[A-Z]?)_?([0-9]+)?([A-Z]+)?/i;
let CosmoRegExEnum = {
	'Collection': 1,
	'Pattern': 2,
	'Colour': 3,
};

function getItemObject(item) {
	let givenCode = '';

	let imgLink = item.getAttribute('href');
	if (imgLink) {
		let codeMatches = isCosmo ? /shohin_images\/hcd_big\/[A-Z0-9]+\/(.*?)\.jpg/i.exec(imgLink) : /products_photo\/(.*?)\.jpg/i.exec(imgLink);
		if (!codeMatches || codeMatches.length <= 1) {
			Notify.log('No matches found in link for Item!', item);
			return;
		}
		givenCode = codeMatches[1];
	}
	else {
		//'AN3701S_1A';
		givenCode = getTempTitle() + '_' + item.getTextNodeValue(0, true).trim();
	}

	let prefix = 'QG';

	CosmoRegEx.lastIndex = 0;
	let matches = CosmoRegEx.exec(givenCode);
	if (!matches || matches.length <= 1) {
		Notify.log('No matches found for Item!', item);
		return;
	}

	let collectionCode = matches[CosmoRegExEnum.Collection];
	let patternCode = matches[CosmoRegExEnum.Pattern] ? padWithZeros(matches[CosmoRegExEnum.Pattern], 3) : '';
	let colourCode = matches[CosmoRegExEnum.Colour] ? matches[CosmoRegExEnum.Colour].toUpperCase() : '';

	let purchaseCode = formatPurchaseCode(matches[CosmoRegExEnum.Collection] + '-' + (matches[CosmoRegExEnum.Pattern] ?? '') + matches[CosmoRegExEnum.Colour]);

	let title = getFormattedTitle();

	let materialElem = document.querySelector('div.row03 div.column02');
	let material = materialElem?.innerText ?? '';
	material = material.replace(/100%[\s]*COTTON/i, '');
	material = material.replace(/C\/L[\s]*85\/15%/i, '');
	material = material.replace('C100%', '');
	material = material.replace('PRINTED', '');
	let special = material.trim().toTitleCase();

	let fibreElem = document.querySelector('div.row05 div.column02');
	let fibre = fibreElem?.innerText ?? 'C100%';

	let measureElem = document.querySelector('div.row04 div.column02');
	let width = { 'Measurement': '45', 'Unit': 'in' };
	let measureStr = measureElem?.innerText ?? '45in×7m';
	let measureMatches = /([0-9.]+)(cm|m|in)×([0-9.]+)(cm|m|in)/i.exec(measureStr);
	if (measureMatches && measureMatches.length > 1) {
		width = { 'Measurement': parseFloat(measureMatches[1]), 'Unit': measureMatches[2].toLowerCase() };
		let flt = parseFloat(measureMatches[3]);
		let length = (() => {
			switch (flt) {
				case 36: return '12';
				case 40: return '10';
				case 55: return '18';
				default: return flt;
			}
		})();
		special += (special.length > 0 ? ' - ' : '') + 'L' + length + measureMatches[4].toLowerCase();
	}

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
		'Material': fibre,
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
	let imgLink = item.getAttribute('href');
	let result = getAbsolutePath(imgLink);
	return result;
}