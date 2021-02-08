// ==UserScript==
// @name         VicText Collection Extractor - Quiltworx / Judy Niemeyer Quilting
// @namespace    http://www.tgoff.me/
// @version      1.0.0
// @description  Gets the names and codes from a Dear Stella or Timeless Treasures Collection
// @author       www.tgoff.me
// @match        *://quiltworx.com/patterns/*
// @match        *://www.quiltworx.com/patterns/*
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/tg-lib.js
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/collection-extract-lib.js
// @grant        GM_setClipboard
// @grant        GM_download
// @runat        document-idle
// ==/UserScript==

(function () {
	'use strict';
	createButtons();
})();

function getCompany() {
	let company = 'Quiltworx';
	return company;
}

function getTitleElement() {
	let titleElement = document.querySelector('h1.page_title');
	return titleElement;
}

function getAvailabilityDate() {
	//Notify.log('No Date found for Collection!', getTitle());
	return undefined;
}

function getCollection() {
	let collection = document.querySelectorAll('div.patternGalleryContent div.patternFourth');
	return collection;
}

async function getItemObject(item) {
	let result = await scrapeItemInfo(item.querySelector('li.smallBuyButton > a'));

	//return {
	//	'Prefix': prefix,
	//	'CollectionCode': collectionCode,
	//	'ColourCode': colourCode,
	//	'ColourName': colourName,
	//	'PurchaseCode': purchaseCode,
	//	'PatternName': patternName,
	//	'CollectionName': title,
	//	'SpecialNotes': special,
	//	'Material': material,
	//	'Width': width,
	//	'Repeat': repeat,
	//	'ReleaseDates': dates
	//};
	return undefined;
}

function formatInformation(itemElement) {
	let item = getItemObject(itemElement);
	if (!item) return;

	//let result = { 'itemCode': itemCode, 'barCode': barCode, 'description': description, 'webName': webName, 'webDesc': webDesc, 'delDate': delDateString, 'purchaseCode': item.PurchaseCode, 'webCategory': webCategory };
	let result = {};
	return result;
}

async function formatImage(item) {
	let result = "IMAGE_LINK";
	return result;
}

function addScraperIFrame() {
	if (inIframe()) return;
	let cssText = `
	#scraperFrame {
		height: 25%;
		width: 25%;
		position: absolute;
		display: block;
		top: 0px;
		left: 0px;
		z-index: 999;
	}`;
	MyStyles.addStyle('Scraper iFrame', cssText);

	let ScraperIFrame = document.createElement('iframe');
	ScraperIFrame.id = ScraperIFrame.name = 'scraperFrame';
	ScraperIFrame.sandbox = 'allow-same-origin allow-scripts';
	ScraperIFrame.domain = 'store.quiltworx.com';
	document.body.appendChild(ScraperIFrame);
}

async function scrapeItemInfo(item) {
	let ScraperIFrame = document.querySelector('#scraperFrame');
	if (!ScraperIFrame) {
		addScraperIFrame();
		ScraperIFrame = document.querySelector('#scraperFrame')
	}

	let returnedData;
	const scraperLoadPromise = new Promise(resolve => {
		ScraperIFrame.style.visibility = 'visible';
		ScraperIFrame.src = item.getAttribute('href');
		ScraperIFrame.addEventListener("load", function () {
			let doc;
			do {
				doc = ScraperIFrame.contentDocument;
			} while (doc == null);
			let rows = doc.querySelectorAll('form.search_results_section table.v65-productDisplay table.v65-productDisplay > tbody > tr');

			if (rows.length > 0 && rows.length % 6) {
				//let link = img.getAttribute('data-src');
				returnedData = rows;
				ScraperIFrame.src = 'about:blank';
				ScraperIFrame.style.visibility = 'hidden';
				resolve();
			}
		});
	});
	await scraperLoadPromise;

	return returnedData;
}