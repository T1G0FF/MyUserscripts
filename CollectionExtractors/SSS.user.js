// ==UserScript==
// @name         # VicText Collection Extractor - SSS
// @namespace    http://www.tgoff.me/
// @version      2023.10.26.1
// @description  Gets the names and codes from a SSS
// @author       www.tgoff.me
// @match        *://sss.com.au/*
// @match        *://*.sss.com.au/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=sss.com.au
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/tg-lib.js
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/collection-extract-lib.js
// @grant        GM_setClipboard
// @grant        GM_download
// @run-at       document-idle
// ==/UserScript==

let isSearch = false;
(function () {
	'use strict';
	setTimeout(function () {
		let buttonLocation = document.querySelector("ul.breadcrumbs");
		createButtons(buttonLocation, "beforeend");
	}, 1000);
})();

function getCompany() {
	let company = '';
	return company;
}

function getTitleElement() {
	let titleElement = document.querySelector("div#prodSummary-btnsContainer");
	return titleElement;
}

function getTitle() {
	let title = '';
	return title;
}

function getCollection() {
	let collection = document.querySelectorAll('div#ProductSummary div.productblock');
	return collection;
}

function formatInformation(item) {
	let codeElement = item.querySelector('div.textholder span.codeSpan');
	let givenCode = codeElement?.innerText.trim() ?? '';
	let descElement = item.querySelector('div.textholder span.nameSpan');
	let givenDesc = descElement?.innerText.trim() ?? '';

	let description = givenDesc;

	let result = { 'itemCode': givenCode, 'barCode': '', 'description': description, 'webName': '', 'webDesc': '', 'delDate': '', 'purchaseCode': '' };
	return result;
}

// https://sss.com.au/imagepreview.ashx?p=\images\database\MADEIRA\Web\EL017.0101.jpg&w=999&h=180
// https://sss.com.au/images/database/MADEIRA/Web/EL017.0102.jpg
function formatImage(item) {
	let imageUrl = item.querySelector('a[onclick="loadingSpinner(this)"] > img').src;
	imageUrl = imageUrl.substr(0, imageUrl.indexOf('&')).replace('imagepreview.ashx?p=', '');
	return imageUrl;
}