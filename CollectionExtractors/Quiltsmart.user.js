// ==UserScript==
// @name         VicText Collection Extractor - Quiltsmart
// @namespace    http://www.tgoff.me/
// @version      2021.03.09.1
// @description  Gets the names and codes from Quiltsmart
// @author       www.tgoff.me
// @match        *://quiltsmart.com/shop/*
// @match        *://www.quiltsmart.com/shop/*
// @noframes
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/tg-lib.js
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/collection-extract-lib.js
// @grant        GM_setClipboard
// @grant        GM_download
// @runat        document-idle
// ==/UserScript==

let isSearch = false;
(function () {
	'use strict';
	let buttonLocation = document.querySelector("div.cItemsContainer");
	createButtons(buttonLocation, "beforebegin");
})();

let idRegex = /.*(?:-x(.*).htm)/;
let RegexEnum = {
	'ID': 1,
};

function getCompany() {
	let company = 'Quiltsmart';
	return company;
}

function getTitleElement() {
	let titleElement = document.querySelector('ul[ng-if="category.current"] li strong');
	if (!titleElement) {
		titleElement = document.querySelector('body > div.secondaryPageDiv > div.ng-scope > div > div > div.col-lg-9 strong:last-of-type');
		isSearch = true;
	}
	return titleElement;
}

function getCollection() {
	let collection = document.querySelectorAll('div.cItemDivContainer');
	return collection;
}

let localColl;
async function formatInformation(item) {
	let nameElement = item.querySelector('div.cItemTitleDiv p.cItemTitle');
	if (!nameElement) {
		Notify.log('Name element not found!', item);
		return;
	}

	let givenDesc = nameElement.innerText;
	localColl = localColl == undefined ? getCollection() : localColl;
	let coll = localColl;
	let info = await scrapeItemInfo(item, item == coll[coll.length - 1]);
	let givenCode = info.sku;
	let itemCode = formatItemCode('P-QS', givenCode);
	let barCode = formatBarCode(itemCode);

	let description = givenDesc.trim();

	let result = { 'itemCode': itemCode, 'barCode': barCode, 'description': description, 'webName': '', 'webDesc': '', 'delDate': '', 'purchaseCode': givenCode };
	return result;
}

// https://media.rainpos.com/8837/58_inch_lone_star_cover.jpg
// https://media.rainpos.com/8837/58_inch_lone_star_cover.jpg
async function formatImage(item) {
	let coll = getCollection();
	let info = await scrapeItemInfo(item, item == coll[coll.length - 1]);
	//let imageUrl = item.querySelector('img.cItemImage').getAttribute('src');
	return info.images;
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

async function scrapeItemInfo(item, lastCall) {
	let ScraperIFrame = document.querySelector('#scraperFrame');
	if (!ScraperIFrame) {
		addScraperIFrame();
		ScraperIFrame = document.querySelector('#scraperFrame')
	}

	let info = getLinkAndID(item);

	let returnedData = {};
	const scraperLoadPromise = new Promise(resolve => {
		ScraperIFrame.style.visibility = 'visible';
		ScraperIFrame.src = info.Link;
		if (ScraperIFrame.contentWindow) {
			ScraperIFrame.contentWindow.onerror = () => { };
		}
		ScraperIFrame.addEventListener("load", function () {
			if (ScraperIFrame.src != 'about:blank') {
				let doc;
				do {
					doc = ScraperIFrame.contentDocument;
				} while (doc == null);

				if (ScraperIFrame.contentWindow['prices' + info.ID]) {
					let givenCode = ScraperIFrame.contentWindow['prices' + info.ID]['0']['sku'];
					returnedData['sku'] = givenCode;
					let imgElements = doc.querySelectorAll('div[id*="pImgImg"] img');
					returnedData['images'] = Array.from(imgElements).map(i => i.getAttribute('src').replace('THUMB_', ''));

					if (lastCall) {
						ScraperIFrame.src = 'about:blank'; // This counts against our navigation count, so only do it once at the end.
						ScraperIFrame.style.visibility = 'hidden';
					}
				}
			}
			resolve();
		});
	});
	await scraperLoadPromise;

	return returnedData;
}

function getLinkAndID(item) {
	let linkElement = item.querySelector('div.cItemImageDiv a');
	if (!linkElement) {
		Notify.log('Link element not found!', item);
		return;
	}
	let link = linkElement.getAttribute('href');

	let matches = idRegex.exec(link);
	if (!matches || matches.length <= 1) {
		Notify.log('No matches found for Item!', item);
		return;
	}
	let id = matches[RegexEnum.ID];

	return { 'Link': link, 'ID': id };
}