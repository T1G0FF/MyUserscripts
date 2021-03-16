// ==UserScript==
// @name         VicText Collection Extractor - Lewis & Irene
// @namespace    http://tgoff.me/
// @version      2021.03.16.1
// @description  Gets the names and codes from a Lewis & Irene Collection. Also adds some visible item & collection labels.
// @author       www.tgoff.me
// @match        *://www.lewisandirene.com/our-fabrics/*
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/tg-lib.js
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/collection-extract-lib.js
// @grant        GM_setClipboard
// @grant        GM_download
// @runat        document-idle
// ==/UserScript==

let LewisIreneRegEx = /([A-z]+)([0-9]+)(?:\.([0-9]+)|(?:\s+[A-z]{2}[0-9]{2}))?(?:[-\s]+)([\/\w -()&]+)/;
let RegexEnum = {
	'CollectionLetters': 1,
	'CollectionNumbers': 2,
	'ColourCode': 3,
	'ColourName': 4,
};

(function () {
	'use strict';
	if (getTitleElement()) {
		createButtons();
		addSortFilterInputs();
	}
	showCollectionNames();
	showItemNames();
})();

function getCompany() {
	let company = 'Lewis & Irene';
	return company;
}

function getTitleElement() {
	let titleElement = document.querySelector('.author > .company-name > span');
	return titleElement;
}

function getCollection() {
	let collection = document.querySelectorAll('body div.foogallery > .fg-item');
	return collection;
}

function getAvailabilityDate() {
	let availableElement = document.querySelector('h3.title-heading-center em')
	if (availableElement) {
		let available = availableElement.innerText.replaceAll('Available in all good fabric shops and stores from ', '');
		if (available == 'Shipping Now') return undefined;
		available = available.replaceAll('Ships in ', '');
		return available;
	}
	return undefined;
}

function formatInformation(item) {
	let title = getFormattedTitle();
	let company = getCompany();

	let givenCode = item.querySelector('.fg-item-inner > a').getAttribute('data-caption-title');

	let itemCode = '';
	let barCode = '';
	let purchaseCode = '';
	let material = 'C100%';
	let width = title.includes('108') ? 'W108in' : 'W45in';

	LewisIreneRegEx.lastIndex = 0;
	let matches = LewisIreneRegEx.exec(givenCode);
	let separator = '';
	if (!matches || matches.length <= 1) {
		Notify.log('No matches found for Item!', item);
		return;
	}

	let collectionCode;
	let colourCode;
	let colourName;
	let givenCodeColour;
	let description;
	if (matches[RegexEnum.ColourCode] === undefined) {
		if (matches[RegexEnum.CollectionLetters] === 'BB') {
			collectionCode = matches[RegexEnum.CollectionLetters] + ' ' + padWithZeros(matches[RegexEnum.CollectionNumbers], 3);
		} else {
			collectionCode = matches[RegexEnum.CollectionLetters] + matches[RegexEnum.CollectionNumbers];
		}
		colourName = fixColourName(matches[RegexEnum.ColourName]);

		itemCode = formatItemCode('LE', collectionCode);
		barCode = formatBarCode(itemCode);
		purchaseCode = formatPurchaseCode(matches[RegexEnum.CollectionLetters] + matches[RegexEnum.CollectionNumbers] + ' ' + matches[RegexEnum.ColourName]);

		if (title === 'Bumbleberries') {
			if (itemCode === 'LEBB 020' || itemCode === 'LEBB 040' || itemCode === 'LEBB 094' || itemCode === 'LEBB 110' || itemCode === 'LEBB 111') {
				title = 'Stock ' + title;
			} else {
				let season = getTitleElement().innerText.match(/((?:AW|SS)[0-9]{2})/g);
				title = season + ' ' + title
			}
		}
	} else {
		collectionCode = matches[RegexEnum.CollectionLetters] + matches[RegexEnum.CollectionNumbers];
		colourCode = padWithZeros(matches[RegexEnum.ColourCode], 3);
		colourName = fixColourName(matches[RegexEnum.ColourName]);
		givenCodeColour = (colourCode).toUpperCase();

		itemCode = formatItemCode('LE', collectionCode + ' ' + givenCodeColour);
		barCode = formatBarCode(itemCode);
		purchaseCode = formatPurchaseCode(matches[RegexEnum.CollectionLetters] + matches[RegexEnum.CollectionNumbers] + '.' + matches[RegexEnum.ColourCode] + ' ' + matches[RegexEnum.ColourName]);
	}

	let webName = colourName.toTitleCase() + ' - ' + title;
	let webDesc = material + ' - ' + width;
	description = webName + ' - ' + webDesc;

	let dates = getReleaseDates(availDate, delDelay);
	let delDate = toDeliveryString(dates);

	let result = { 'itemCode': itemCode, 'barCode': barCode, 'description': description, 'webName': webName, 'webDesc': webDesc, 'delDate': delDate, 'purchaseCode': purchaseCode };
	return result;
}

// https://i0.wp.com/www.lewisandirene.com/wp-content/uploads/2018/09/A329.1.jpg
function formatImage(item) {
	let result = item.querySelector('figure > a').getAttribute('href');
	return 'https:' + result;
}

/***********************************************
 * Collection Sorting & Filtering
 ***********************************************/
function getItemContainer() {
	return document.querySelector('div.foogallery-container');
}

function getCodeFromItem(item) {
	let matches = LewisIreneRegEx.exec(givenCode);
	let separator = '';
	if (!matches || matches.length <= 1) {
		//Notify.log('No matches found for Item!', item);
		return;
	}
	let collectionCode = ''
	if (matches[RegexEnum.ColourCode] === undefined && matches[RegexEnum.CollectionLetters] === 'BB') {
		collectionCode = matches[RegexEnum.CollectionLetters] + ' ' + padWithZeros(matches[RegexEnum.CollectionNumbers], 3);
	} else {
		collectionCode = matches[RegexEnum.CollectionLetters] + matches[RegexEnum.CollectionNumbers];
	}
	return collectionCode;
}

function testFilterAgainst(item) {
	return item.querySelector('img.fg-image').getAttribute('alt').trim().replace('(Bumbleberries basic)', '(Basic)').replace('(BB basic)', '(Basic)');
	//item.querySelector('.fg-item-inner > a').getAttribute('data-caption-title');
}

function addFilterMatchStyle(item) {
	let parent = item.querySelector('figure.fg-item-inner');
	let elem = parent.querySelector('#matchOverlay');
	if (!elem) {
		elem = document.createElement('div');
		elem.classList.add('matchOverlay');
		elem.style.boxShadow = 'green inset 0 25px 5px -20px';
		elem.style.height = '100%';
		elem.style.position = 'absolute';
		elem.style.bottom = '0';
		elem.style.width = '100%';
		elem.style.pointerEvents = 'none';
		elem.style.zIndex = '9999';
		parent.insertAdjacentElement('beforeEnd', elem);
	}
	elem.style.display = 'block';
}

function removeFilterMatchStyle(item) {
	let elem = item.querySelector('#matchOverlay');
	if (elem) matchOverlay.style.display = 'none';
}

function showCollectionNames() {
	let collections = document.querySelectorAll('.fusion-image-wrapper');
	if (!collections) {
		Notify.log('No Collections Found!');
		return;
	}

	let count = 0;
	for (let item in collections) {
		let currentItem = collections[item];
		if (collections.hasOwnProperty(item)) {
			let currentTitle = currentItem.querySelector('.fusion-rollover-title a').innerText.trim();
			let newTitle = document.createElement('div');
			newTitle.innerText = currentTitle.toTitleCase();
			newTitle.style.color = 'black';
			newTitle.style.fontWeight = 'bolder';
			newTitle.style.left = '50%';
			newTitle.style.position = 'absolute';
			newTitle.style.textAlign = 'center';
			newTitle.style.textIndent = '-100%';
			newTitle.style.textShadow = '-2px -2px 2px white, 0px -2px 2px white, 2px -2px 2px white, -2px 0px 2px white, 0px 0px 2px white, 2px 0px 2px white, -2px 2px 2px white, 0px 2px 2px white, 2px 2px 2px white';
			newTitle.style.top = '0px';
			let currentImage = currentItem.querySelector('img');
			currentImage.insertAdjacentElement('afterEnd', newTitle);
		}
	}

}

function showItemNames() {
	let collections = document.querySelectorAll('.fg-image-wrap');
	if (!collections) {
		Notify.log('No Collections Found!');
		return;
	}

	let count = 0;
	for (let item in collections) {
		let currentItem = collections[item];
		if (collections.hasOwnProperty(item)) {
			let currentTitle = currentItem.querySelector('img.fg-image').getAttribute('alt').trim().replace('(Bumbleberries basic)', '(Basic)').replace('(BB basic)', '(Basic)');

			let matches = LewisIreneRegEx.exec(currentTitle);
			let code = matches[RegexEnum.CollectionLetters];
			code += matches[RegexEnum.CollectionNumbers] ? matches[RegexEnum.CollectionNumbers] : '';
			code += matches[RegexEnum.ColourCode] ? '.' + matches[RegexEnum.ColourCode] : '';
			let color = matches[RegexEnum.ColourName].toTitleCase();
			let newTitle = document.createElement('div');
			let codeP = document.createElement('p');
			codeP.innerText = code;
			newTitle.appendChild(codeP);
			let colorP = document.createElement('p');
			colorP.innerText = color;
			newTitle.appendChild(colorP);
			newTitle.style.width = '100%';
			newTitle.style.color = 'black';
			newTitle.style.fontSize = 'medium';
			newTitle.style.fontWeight = 'bolder';
			newTitle.style.fontFamily = 'monospace';
			newTitle.style.left = '50%';
			newTitle.style.position = 'absolute';
			newTitle.style.textAlign = 'center';
			newTitle.style.textIndent = '-100%';
			newTitle.style.textShadow = '-2px -2px 2px white, 0px -2px 2px white, 2px -2px 2px white, -2px 0px 2px white, 0px 0px 2px white, 2px 0px 2px white, -2px 2px 2px white, 0px 2px 2px white, 2px 2px 2px white';
			newTitle.style.top = '20px';
			newTitle.style.zIndex = '999999';
			newTitle.style.wordWrap = 'break-word';
			let currentImage = currentItem.querySelector('img');
			currentImage.insertAdjacentElement('beforeBegin', newTitle);
		}
	}

}