// ==UserScript==
// @name         VicText Collection Extractor - Madeira
// @namespace    http://www.tgoff.me/
// @version      2023.10.13.1
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
		link.setAttribute('href', window.location.origin + window.location.pathname + '?cp=1&ppp=' + itemCountElem.innerText + '&sort=featured');

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

	let givenName = item.querySelector('a.productTitle');
	let firstSpace = givenName.indexOf(' ');
	let givenCode = givenName.substr(0, firstSpace);
	let givenTitle = givenName.substr(firstSpace + 1);
	let hashIndex = givenTitle.indexOf('#');
	let givenWeight = '';
	if (hashIndex >= 0) {
		givenWeight = givenTitle.substr(hashIndex);
		givenTitle = givenTitle.substr(0, hashIndex).trim();
	}

	let givenDesc = item.querySelector('div.shortDesc');
	let givenSize = '';
	let givenColour = '';

	for (const size in ['CONE', 'SPOOL']) {
		let index = givenDesc.indexOf(size);
		if (index >= 0) {
			index += size.length;
			givenSize = givenDesc.substr(0, index);
			givenColour = givenDesc.substr(index);
			break;
		}
	}

	debugger;

	let itemCode = (givenName + ' ' + colorCode).toUpperCase();
	let barCode = formatBarCode(itemCode);
	let purchaseCode = itemCode;
	let material = document.querySelector('div.product-detail__header > p').innerText.trim();
	let length = getLength();

	let webName = givenColour.toTitleCase() + ' - ' + title;
	let webDesc = material + ' - ' + length;
	let description = webName + ' - ' + webDesc;

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