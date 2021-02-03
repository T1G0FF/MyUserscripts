// ==UserScript==
// @name         VicText Collection Extractor - Blank Quilting / Studio E
// @namespace    http://www.tgoff.me/
// @version      3.1.0
// @description  Gets the names and codes from a Blank Quilting or Studio E Collection
// @author       www.tgoff.me
// @match        *://www.blankquilting.net/*
// @match        *://blankquilting.net/*
// @match        *://www.studioefabrics.net/*
// @match        *://studioefabrics.net/*
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/tg-lib.js?token=9461da6511cdd88e73bb62eb66eaa3a0a201bef0
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/collection-extract-lib.js?token=9461da6511cdd88e73bb62eb66eaa3a0a201bef0
// @grant        GM_setClipboard
// @grant        GM_download
// @runat        document-idle
// ==/UserScript==

let isSearch = false;
let isCollectionPage = false;
(function () {
	'use strict';
	isSearch = window.location.pathname.includes('search-results-page');
	createButtons();
})();

let blankRegEx = /([0-9]+)([A-z]+)?(?:-[ ]*(?:([0-9]+)([A-z]+)?)?)(?:[ ]*([\w\ \-\.\/]+))?/;
let RegexEnum = {
	'Collection': 1,
	'LetterBefore': 2,
	'ColourCode': 3,
	'LetterAfter': 4,
	'ColourName': 5,
};

function getCompany() {
	let company = window.location.hostname.includes('studioefabrics') ? 'Studio E' : 'Blank Quilting';
	return company;
}

function getTitleElement() {
	let titleElement = isSearch ? document.querySelector('h1.page-heading') : document.querySelector('.page-heading > span');
	return titleElement;
}

function getTitle() {
	let elem = isSearch ? document.querySelector('div.snize-search-results-header > a.snize-no-products-found-link') : getTitleElement();
	let title = formatTitle(_getTitle(elem));
	return title;
}

function getAvailabilityDate() {
	let availableElement = document.querySelector('span.shipin-title')
	if (availableElement) {
		let available = availableElement.innerText;
		if (available == 'Shipping Now') return undefined;
		available = available.replaceAll('Ships in ', '');
		return available;
	}
	return undefined;
}

function getCollection() {
	let collection = isSearch ? document.querySelectorAll('div.snize-search-results li.snize-product') : document.querySelectorAll('main.page-content li.product.item');
	if (!collection || collection.length < 1) {
		collection = document.querySelectorAll('div.parent-category-area li');
		isCollectionPage = collection.length > 0;
	}
	return collection;
}

function formatInformation(item) {
	let title = getTitle();
	let company = getCompany();

	if (isCollectionPage) {
		let collElement = item.querySelector('div.card-title > a');
		return { 'description': collElement.innerText.trim() };
	}

	let codeElement = isSearch ? item.querySelector('span.snize-title') : item.querySelector('h4.card-title > a');
	let descElement = isSearch ? item.querySelector('span.snize-description') : item.querySelector('h4.card-title > p.card-text');
	if (!codeElement || !descElement) {
		Notify.log('One or More Elements Not Found!', item);
		return;
	}

	let givenCode = codeElement.innerText.trim().toUpperCase();
	let givenDesc = descElement.innerText.trim();

	let itemCode = '';
	let barCode = '';
	let purchaseCode = '';
	let material = 'C100%';
	let width = title.includes('108') ? 'W108in' : 'W45in';
	let special = '';

	blankRegEx.lastIndex = 0;
	let matches = blankRegEx.exec(givenCode);
	if (!matches || matches.length <= 1) {
		Notify.log('No matches found for Item!', item);
		return;
	}

	let collectionCode = matches[RegexEnum.Collection];
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
		if (colourCode.length > 0) {
			colourName = ' ' + colourName;
		}
	}
	let givenCodeColour = (colourCode + colourName).toUpperCase();

	itemCode = formatItemCode('BQ', collectionCode + ' ' + givenCodeColour);
	barCode = formatBarCode(itemCode);

	let tempGivenCode = givenCode;
	if (matches[RegexEnum.ColourName] && matches[RegexEnum.ColourName].length > 0 && matches[RegexEnum.ColourCode] && matches[RegexEnum.ColourCode].length > 0) {
		tempGivenCode = tempGivenCode.replaceAll(matches[RegexEnum.ColourName].toUpperCase(), '').trim();
	}
	purchaseCode = formatPurchaseCode(tempGivenCode.trim());

	if (title.indexOf(' - ') > 0) {
		let dash = title.indexOf(' - ');
		special = title.substr(dash + 3);
		title = title.substr(0, dash)
	}

	let titleString = title;
	if (company === 'Studio E') {
		titleString = company + ' ' + title;
	}

	let nameString = givenDesc.toTitleCase() + ' - ' + titleString;
	if (givenDesc.toUpperCase() === title.replaceAll('108', '').trim().toUpperCase()) {
		nameString = titleString;
	}
	nameString = nameString.replaceAll('["]', 'in');

	let colourString = colourName.trim().toTitleCase(false);
	let patternString = givenDesc.replaceAll('["]', 'in').toTitleCase();
	let webName = colourString;
	webName += webName.length > 0 ? ' - ' : '';
	webName += patternString;
	let description = formatSapDescription({ 'Colour': colourString, 'Pattern': patternString, 'Collection': title, 'Special': special, 'Material': material, 'Width': width, 'Repeat': null })

	let dates = getReleaseDates();
	let relDate = toReleaseString(dates);
	let delDate = toDeliveryString(dates);
	let webDesc = formatWebDescription({ 'Collection': title, 'Notes': special, 'Fibre': material, 'Width': width, 'Release': relDate, 'Delivery From': dates.Delivery });

	let result = { 'itemCode': itemCode, 'barCode': barCode, 'description': description, 'webName': webName, 'webDesc': webDesc, 'delDate': delDate, 'purchaseCode': purchaseCode, 'webCategory': title };
	return result;
}

function toReleaseString(dates) {
	let result = getQuarter(dates.Received);
	let relDate = getCompany() + ' ' + result.Quarter + 'Q' + result.Year;
	return relDate;
}

// https://cdn7.bigcommerce.com/s-par0o0ta6b/images/stencil/500x659/products/1517/14348/9422-44__27613.1526386264.jpg

function formatImage(item) {
	let img = isSearch ? item.querySelector('span.snize-thumbnail img') : item.querySelector('img');
	let result = img.getAttribute('src');
	return result;
}