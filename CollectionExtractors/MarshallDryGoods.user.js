// ==UserScript==
// @name         VicText Collection Extractor - Marshall Dry Goods
// @namespace    http://www.tgoff.me/
// @version      2024.12.06.1
// @description  Gets the names and codes from a Marshall Dry Goods Collection
// @author       www.tgoff.me
// @match        *://www.marshalldrygoods.com/shop/fabrics/*
// @match        *://marshalldrygoods.com/shop/fabrics/*
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/tg-lib.js
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/collection-extract-lib.js
// @grant        GM_setClipboard
// @grant        GM_download
// @run-at       document-idle
// ==/UserScript==

(function () {
	'use strict';

	createButtons();
	//addSortFilterInputs();
})();

function getCompany() {
	return 'Marshall Dry Goods';
}

function getTitleElement() {
	return document.querySelector('#cartHeader > div.text-center > h1');
}

function getCollection() {
	return document.querySelectorAll('#cartHome div.products > div.item');
}


function getItemObject(item) {
	let codeElement = item.querySelector('a.mt-3 strong');
	if (!codeElement) {
		Notify.log('Code elements not found!', item);
		return;
	}

	let givenCode = codeElement.innerText.trim().toUpperCase();
	if (givenCode.indexOf('3 YARD PIECE') > 0) {
		givenCode = givenCode.split('3 YARD PIECE')[0].trim();
	}
	givenCode = givenCode.replace('MDG', '');
	givenCode = givenCode.replace('"', '');
	givenCode = givenCode.replace(/[ ]{2,}/, ' ');

	let prefix = 'MG';
	let title = getFormattedTitle();
	title = title.replace(/(?: - )?Marshall Dry Goods/, '');
	let dates = getReleaseDates();

	let tempName = shortenColourName(givenCode);

	let collectionName = title;
	let collectionCode = '';
	let patternName = '';
	let colourCode = '';
	let colourName = '';
	let special = '';
	if (tempName.indexOf('#') >= 0) {
		let split = tempName.split('#');
		split = split.map(s => s.trim());
		split[0] = split[0].replace(/PATTERN$/, '').trim();

		if (split[0].indexOf('DIGITAL') >= 0) {
			split[0] = split[0].replace(/DIGITAL$/, '').trim();
			split[0] = split[0].replace(/DIGITALLY PRINTED/, 'DIGITAL').trim();
			special = 'Digital';
		}

		collectionCode = split[0];
		collectionName = split[0].toTitleCase();
		colourCode = split[1];
	}
	else if (givenCode.indexOf('WHITE ON WHITE') >= 0) {
		let temp = givenCode.replace('WHITE ON WHITE', '').trim();
		collectionCode = temp;
		collectionName = temp.toTitleCase();
		colourName = 'WOW';
	}
	else {
		collectionCode = tempName;
	}

	let purchaseCode = givenCode;
	purchaseCode = formatPurchaseCode(purchaseCode.trim());

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
		'CollectionName': collectionName,
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

	let company = getCompany();
	let itemCode = item.PurchaseCode;
	let description = '';
	let webName = '';
	let webDesc = '';

	let relDateString = toReleaseString(item.ReleaseDates);
	let delDateString = toDeliveryString(item.ReleaseDates);

	let tempCodeColour = ((item.ColourCode.length > 0) ? item.ColourCode + ' ' : '');
	tempCodeColour += shortenColourName(item.ColourName);
	itemCode = formatItemCode(item.Prefix, item.CollectionCode + ' ' + tempCodeColour.toUpperCase());

	let widthString = item.Width.Measurement + item.Width.Unit;
	description = formatSapDescription({ 'Colour': item.ColourName, 'Pattern': item.PatternName, 'Collection': item.CollectionName, 'Special': item.SpecialNotes, 'Material': item.Material, 'Width': 'W' + widthString, 'Repeat': item.Repeat })

	webName = (((item.ColourName.length > 0) ? item.ColourName + ' - ' : '') + item.PatternName);

	webDesc = formatWebDescription({ 'Collection': item.CollectionName, 'Notes': item.SpecialNotes, 'Fibre': item.Material, 'Width': widthString, 'Release': relDateString, 'Delivery From': item.ReleaseDates.Delivery });

	let barCode = formatBarCode(itemCode);

	let result = { 'itemCode': itemCode, 'barCode': barCode, 'description': description, 'webName': webName, 'webDesc': webDesc, 'delDate': delDateString, 'purchaseCode': item.PurchaseCode, 'webCategory': item.CollectionName };
	return result;
}

// https://static.visionamp.co/rubix/MDGI/orig_27322_Camo-Canopy.jpg
function formatImage(item) {
	let img = item.querySelector('div.zoom');
	let result = img.getAttribute('data-image');
	return result;
}