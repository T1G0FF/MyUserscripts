// ==UserScript==
// @name         # VicText Collection Extractor - Kawaguchi / Cohana
// @namespace    http://www.tgoff.me/
// @version      2024.06.20.1
// @description  Gets the names and codes from a Kawaguchi Collection
// @author       www.tgoff.me
// @match        *://cohana.shop/products/*
// @match        *://*.cohana.shop/products/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=cohana.shop
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
	let company = 'Kawaguchi';
	return company;
}

function getTitleElement() {
	let titleElement = document.querySelector('div.product-section div.page-content--product div.product-block--header > h1');
	return titleElement;
}

function getCollection() {
	let collection = document.querySelectorAll('div.product-section div.swatches-type-products li.swatch-view-item');
	return collection;
}

function formatInformation(item) {
	// Asobi ITO Elastic Warp Beige (15-446)
	let givenCode = item.querySelector('div.swatch-image').getAttribute('data-value');
	let purchaseCode = givenCode.replace(/.*\((.*)\)/, '$1').toUpperCase();
	let itemCode = 'K' + purchaseCode;
	let barCode = formatBarCode(itemCode.replace(/[^A-Z0-9]/g, ''));

	let title = getTitle();
	let colourName = givenCode.replace(title, '').replace(/(.*)\(.*\)/, '$1').trim();
	let description = colourName + ' - ' + title;

	let result = { 'itemCode': itemCode, 'barCode': barCode, 'description': description, 'purchaseCode': purchaseCode };
	return result;
}

// https://figofabrics.com/images/SwatchImages/90097-99.jpg
function formatImage(item) {
	let imgElem = item.querySelector('ul.swatch-view div.swatch-image div.star-set-image');
	let style = imgElem.currentStyle || window.getComputedStyle(imgElem, false);
	let src = style.backgroundImage;
	src = src.slice(4, -1).replace(/['"]/g, "");
	src = src.split('?')[0];
	return src;
}