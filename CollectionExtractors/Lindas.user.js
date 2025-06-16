// ==UserScript==
// @name         # VicText Collection Extractor - Linda's Electric Quilters
// @namespace    http://www.tgoff.me/
// @version      2025.03.07.1
// @description  Gets the names and codes from a Linda's Electric Quilters Collection
// @author       www.tgoff.me
// @match        *://lindas.com/collections/*
// @match        *://www.lindas.com/collections/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=lindas.com
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/tg-lib.js
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/collection-extract-lib.js
// @grant        GM_setClipboard
// @grant        GM_download
// @run-at       document-idle
// ==/UserScript==

(function () {
	'use strict';

	morePagerOptions();
	createButtons();
	//addSortFilterInputs();
})();

function morePagerOptions() {
	let listElem = document.querySelector('div.value-picker-wrapper div.value-picker div.value-picker__choice-list');
	let buttonElem = listElem.querySelector('button.value-picker__choice-item');
	let newButton = buttonElem.cloneNode(true);
	let currVal = newButton.getAttribute('data-value');
	let newVal = '100';
	newButton.setAttribute('data-value', newVal);
	var textNode = newButton.getTextNode(1);
	var text = textNode.nodeValue.replace(currVal, newVal);
	textNode.nodeValue = text;
	listElem.insertAdjacentElement('beforeEnd', newButton);
}

function getCompany() {
	return 'Lindas';
}

function getTitleElement() {
	return document.querySelector('div.collection h1.collection__title');
}

function getCollection() {
	return document.querySelectorAll('div.collection div.product-list > div.product-item');
}

function getItemObject(item) {
	var infoElem = item.querySelector('div.product-item__info');
	var collectionName = infoElem.querySelector('a.product-item__title').innerText;
	let dates = getReleaseDates();

	return {
		'Prefix': '',
		'CollectionCode': '',
		'ColourCode': '',
		'ColourName': '',
		'PurchaseCode': '',
		'PatternName': '',
		'CollectionName': collectionName,
		'SpecialNotes': '',
		'Material': '',
		'Width': '',
		'Repeat': '',
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

	//let tempCodeColour = ((item.ColourCode.length > 0) ? item.ColourCode : shortenColourName(item.ColourName));
	//itemCode = formatItemCode(item.Prefix, item.CollectionCode + ' ' + tempCodeColour.toUpperCase());
	let barCode = '';//formatBarCode(itemCode);

	if (item.ColourName.length > 0) {
		itemCode = formatItemCode(item.Prefix, item.CollectionCode + ' ' + shortenColourName(item.ColourName));
	}

	//let widthString = item.Width.Measurement + item.Width.Unit;
	description = formatSapDescription({ 'Colour': item.ColourName, 'Pattern': item.PatternName, 'Collection': item.CollectionName, 'Special': item.SpecialNotes, 'Material': item.Material, 'Width': item.Width, 'Repeat': item.Repeat })

	webName = (((item.ColourName.length > 0) ? item.ColourName + ' - ' : '') + item.CollectionName);

	webDesc = formatWebDescription({ 'Collection': item.CollectionName, 'Notes': item.SpecialNotes, 'Fibre': item.Material, 'Width': item.Width, 'Release': relDateString, 'Delivery From': item.ReleaseDates.Delivery });

	let result = { 'itemCode': itemCode, 'barCode': barCode, 'description': description, 'webName': webName, 'webDesc': webDesc, 'delDate': delDateString, 'purchaseCode': item.PurchaseCode, 'webCategory': item.CollectionName };
	return result;
}

// https://static.visionamp.co/rubix/MDGI/orig_27322_Camo-Canopy.jpg
function formatImage(item) {
	let img = item.querySelector('a.product-item__image-wrapper img.product-item__primary-image');
	let result = img.getAttribute('data-src');
	return result;
}