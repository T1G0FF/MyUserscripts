// ==UserScript==
// @name         VicText Collection Extractor - Madeira
// @namespace    http://www.tgoff.me/
// @version      2023.10.13.3
// @description  Gets the names and codes from a Madeira Range
// @author       www.tgoff.me
// @match        *://www.madeirausa.com/*
// @match        *://madeirausa.com/*
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/tg-lib.js
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/collection-extract-lib.js
// @grant        GM_setClipboard
// @grant        GM_download
// @run-at       document-idle
// ==/UserScript==

(function () {
	'use strict';
	let viewCountElem = document.querySelector('div#viewCount');
	if (viewCountElem) {
		createButtons();

		var itemCountElem = document.querySelector('#ResultSorting > div.countWrap > span.num');
		//var showAllElem = viewCountElem.querySelector('div.selectric-hide-select select option[value="500"]');
		//showAllElem.value = itemCountElem.innerText;

		var link = document.createElement('a');
		link.innerHTML = itemCountElem.outerHTML;
		link.setAttribute('href', window.location.origin + window.location.pathname + '?cp=1&ppp=' + itemCountElem.innerText + '&sort=title');

		itemCountElem.parentNode.insertBefore(link, itemCountElem);
		itemCountElem.remove();
	}
})();

function getCompany() {
	let company = 'Madeira';
	return company;
}

function getTitleElement() {
	let titleElement = document.querySelector('#page > div.subpage > div.row > div > h1');
	return titleElement;
}

function getCollection() {
	let collection = document.querySelectorAll('div.SearchResults > div.GridResult');
	return collection;
}

function formatInformation(item) {
	let title = getFormattedTitle();
	let company = getCompany();

	let nameElem = item.querySelector('a.productTitle');
	let givenName = nameElem?.innerText.toUpperCase() ?? '';	// 910-1001 MADEIRA CLASSIC RAYON #40 WEIGHT
	let spaceIndex = givenName.indexOf(' ');
	let givenCode = givenName.substr(0, spaceIndex); // 910-1001
	let givenTitle = givenName.substr(spaceIndex + 1); // MADEIRA CLASSIC RAYON #40 WEIGHT
	let hashIndex = givenTitle.indexOf('#');
	let givenWeight = '';
	if (hashIndex >= 0) {
		givenWeight = givenTitle.substr(hashIndex); // #40 WEIGHT
		givenTitle = givenTitle.substr(0, hashIndex).trim(); // MADEIRA CLASSIC RAYON
	}

	let descElem = item.querySelector('div.shortDesc');	
	let givenDesc = descElem?.innerText.toUpperCase() ?? ''; // 5500yd CONE WHITE
	let givenSize = '';
	let givenColour = '';
	for (const ignore of ['ASST', 'COLLECTION', 'KIT']) {
		let ignoreIndex = givenDesc.indexOf(ignore);
		if (ignoreIndex >= 0) {
			return;
		}
	}
	for (const size of ['CONE', 'SPOOL']) {
		let sizeIndex = givenDesc.indexOf(size);
		if (sizeIndex >= 0) {
			sizeIndex += size.length;
			givenSize = givenDesc.substr(0, sizeIndex);	// 5500yd CONE
			givenColour = givenDesc.substr(sizeIndex).trim();	// WHITE
			break;
		}
	}

	let prefix = '';
	let itemCode = (prefix + givenCode);
	let barCode = formatBarCode(itemCode);
	let purchaseCode = givenCode;

	let colour = givenColour.toTitleCase();
	let name = givenTitle.replace('MADEIRA', '').trim().toTitleCase();
	let length = getLengths(givenSize);
	let material = 'MAT%';
	let weight = givenWeight.replace(/#([0-9]+) WEIGHT/, '$1W');
	
	// Metrosene 100 150m - 4000 Black
	let mesStr = length.hasOwnProperty('Metres') ? `${length.Metres.Measurement}${length.Metres.Unit}` : `${length.Measurement}${length.Unit}`;
	let webName = `${name} ${weight} - ${mesStr} - ${givenCode} ${colour}`;
	// Black - Metrosene 100 - 150m (164yd) - P100% - 60W/2P
	let description = `${colour} - ${name} ${weight} - ${getLengthString(length)} - ${material} - ${weight}`;
	/*
	!! ONLY APPEARS ON PARENT !!
	Cotton, synthetics, mixed fabrics, linen or silk. Clothes make the man. And the universal thread METROSENE will ensure that you and your clothes make a particularly dazzling appearance - and more. Its excellent smoothness, high tensile strength and ideal sewability make the universal METROSENE a reliable partner for all your creations.<br>
	<b>Fibre: </b>100% Polyester, Corespun<br>
	<b>Length: </b>150m|164yd<br>
	<b>Weight: </b>60W/2Ply<br>
	<b>Box of: </b>5<br>
	<b>Needle size: </b>80-90
	*/
	let webDesc = '';

	let delDate = '';//toDeliveryString(getReleaseDates());
	let result = { 'itemCode': itemCode, 'barCode': barCode, 'description': description, 'webName': webName, 'webDesc': webDesc, 'delDate': delDate, 'purchaseCode': purchaseCode };
	return result;
}

// https://www.madeirausa.com/_resources/cache/images/product/910-1001_375x387-pad.jpg
// https://www.madeirausa.com/_resources/images/product/910-1001.jpg

function formatImage(item) {
	let thumbElem = item.querySelector('div.productImage img');
	let thumbUrl = thumbElem.src;

	let fullUrl = thumbUrl.replace('cache/', '').replace('_375x387-pad', '');
	return fullUrl;
}

function getLengths(lengthInput) {
	for (const size of ['CONE', 'SPOOL']) {
		lengthInput = lengthInput.replace(size, '').trim();
	}

	let measurement = parseInt(lengthInput);
	let metres = -1;
	let yards = -1;
	let unit = lengthInput.replace(/^[0-9]+/, '');
	switch (unit) {
		case 'yd':
			yards = measurement;
			metres = yards * 0.9144;
			metres = MRound(metres, 5);
			break;
		case 'm':
			metres = measurement;
			yards = metres / 0.9144;
			yards = MRound(yards, 5);
		default:
			return { 'Measurement': measurement, 'Unit': unit };
	}
	return {
		'Metres': { 'Measurement': metres, 'Unit': 'm' },
		'Yards': { 'Measurement': yards, 'Unit': 'yd' }
	};
}

function getLengthString(lengthObject) {
	return lengthObject.hasOwnProperty('Metres') ? `${lengthObject.Metres.Measurement}m (${lengthObject.Yards.Measurement}yd)` : `${lengthObject.Measurement}${lengthObject.Unit}`;
}

function MRound(number, roundto) {
	return roundto * Math.round(number / roundto);
}