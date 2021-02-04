// ==UserScript==
// @name         VicText Collection Extractor - Dear Stella / Timeless Treasures
// @namespace    http://www.tgoff.me/
// @version      4.1.4
// @description  Gets the names and codes from a Dear Stella or Timeless Treasures Collection
// @author       www.tgoff.me
// @match        *://ttfabrics.com/category/*
// @match        *://www.ttfabrics.com/category/*
// @match        *://ttfabrics.com/advanced_search_result.php?*
// @match        *://www.ttfabrics.com/advanced_search_result.php?*
// @match        *://dearstelladesign.com/category/*
// @match        *://www.dearstelladesign.com/category/*
// @match        *://dearstelladesign.com/advanced_search_result.php?*
// @match        *://www.dearstelladesign.com/advanced_search_result.php?*
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/tg-lib.js
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/collection-extract-lib.js
// @grant        GM_setClipboard
// @grant        GM_download
// @runat        document-idle
// ==/UserScript==

let CONFIG_IGNORE_BASICS = !true;

let isSearch = false;
let isStella = false;
(function () {
	'use strict';
	isSearch = hasParam(window.location.search, "search-key");
	isStella = window.location.hostname.includes('dearstelladesign');
	createButtons();
})();

function getCompany() {
	let company = isStella ? 'Dear Stella' : 'Timeless Treasures';
	return company;
}

function getTitleElement() {
	let titleElement = isSearch ? document.querySelector('table td.pageHeading div#WithResult') : document.querySelector('table.pageHeading td.pageHeading h1');
	return titleElement;
}

function getTitle() {
	let elem = getTitleElement();
	let title = isSearch ? getParam(window.location.search, 'search-key') : formatTitle(_getTitle(elem));
	return title;
}

function getAvailabilityDate() {
	//Notify.log('No Date found for Collection!', getTitle());
	return undefined;
}

function getCollection() {
	// let collection = document.querySelectorAll('div.P-Items-Listing-Class a[title*="STELLA-"]'); // COLLECTION
	let collection = isSearch ? document.querySelectorAll('div.P-Items-Listing-Class a[title*=" / "]') : document.querySelectorAll('div.P-Items-Listing-Class a[title*="COLLECTION"]');
	return collection;
}

let collections = {
	// DEAR STELLA
	'1150': { 'title': 'Moonscape', 'desc': 'Moonscape' },
	'1560': { 'title': 'Jax', 'desc': 'Jax' },
	'SRR512': { 'title': 'Scallop Dot', 'desc': 'Scallop Dot' },
	'SRR613': { 'title': 'Triangle Dot', 'desc': 'Triangle Dot' },
	'SRR1300': { 'title': 'Dash Flow', 'desc': 'Dash Flow' },
	// TIMELESS TREASURES
	'B7900': { 'title': 'Java Blender Basic', 'desc': 'Batik Solid' },
	'C1820': { 'title': 'Dot Basic', 'desc': 'Dot' },
	'C1973': { 'title': 'Dot', 'desc': 'Dot' },
	'C3096': { 'title': 'Studio Basic', 'desc': 'Texture' },
	'C5300': { 'title': 'Spin Basic', 'desc': 'Solid Dot' },
	'C5526': { 'title': 'Swirly Stars', 'desc': 'Swirly Stars' },
	'C5576': { 'title': 'Check Plaid', 'desc': 'Check Plaid' },
	'C6100': { 'title': 'Solid-Ish Basic', 'desc': 'Watercolor Texture' },
	'C7178': { 'title': 'Weathered Wood', 'desc': 'Weathered Wood' },
	'C7200': { 'title': 'Mix Basic', 'desc': 'Solid' },
	'C7800': { 'title': 'Delicate Filagree', 'desc': 'Delicate Filagree' },
	'C8000': { 'title': 'Camo Blender', 'desc': 'Camo' },
	'C8109': { 'title': '1/8in Stripe', 'desc': '1/8in Stripe' },
	'C8134': { 'title': 'Burlap', 'desc': 'Crosshatch Burlap Texture' },
	'C8400': { 'title': 'Blockbuster', 'desc': 'Blockbuster Basic' },
	'CM7298': { 'title': 'Geo Blender', 'desc': 'Geo' },
	'CM8156': { 'title': 'City Brushed', 'desc': 'Metallic Brushed Texture' },
	'SHIMMER': { 'title': 'Shimmer', 'desc': 'Shimmer' },
	'SOHO': { 'title': 'Soho Basic', 'desc': 'Solid' },
};

function getItemObject(item) {
	let codeElements = isStella ? item.querySelectorAll('td.ItemsListingInfo > table td') : item.querySelectorAll('td.ItemsListingInfo span.CustomeFieldFormatB');
	if (!codeElements || codeElements.length < 2) {
		Notify.log('Code elements not found!', item);
		return;
	}
	let givenCode = codeElements[0].innerText.trim().toUpperCase();
	
	let collectionFuzz = givenCode.substring(0, givenCode.indexOf('-'));
	let collectionCode = givenCode.substring(givenCode.indexOf('-') + 1);

	let isTonga = (collectionFuzz.indexOf('TONGA') >= 0);

	let prefix = isStella ? 'DS ' : isTonga ? 'JN ' : 'TT';

	let colourCode = '';

	let colourName = codeElements[1].innerText.trim();
	if (colourName && colourName.length > 0) {
		colourName = fixColourName(colourName);
		colourName = colourName.trim().toTitleCase(false);
	}

	let purchaseCode = formatPurchaseCode(givenCode + '-' + colourName);

	let descElement = isStella ? item.querySelector('td.ItemsListingInfo span.CustomeFieldFormatB') : item.querySelector('td.ItemsListingInfo span.CustomeFieldFormatR');
	if (!descElement) {
		Notify.log('Description element not found!', item);
		return;
	}
	let givenDesc = descElement.innerText.trim();
	let patternName = givenDesc.replaceAll('["″]', 'in').toTitleCase();

	let title = getTitle();
	let special = '';
	if (collections.hasOwnProperty(collectionCode)) {
		if (CONFIG_IGNORE_BASICS && title !== collections[collectionCode].title) return undefined;
		title = collections[collectionCode].title;
		patternName = collections[collectionCode].desc;
	}

	let material = 'C100%';
	let width = { 'Measurement': '45', 'Unit': 'in' };
	let repeat = '';
	 

	if (isStella) {
		if (givenCode[0].toUpperCase() == 'W' && givenCode[1].toUpperCase() != 'W') {
			prefix += 'W';
			width = { 'Measurement': '60', 'Unit': 'in' };
			material = 'P100%';
		}
		if (collectionCode[0].toUpperCase() == 'K' && collectionCode[1].toUpperCase() != 'K') {
			material = 'C95% S5%';
			special = 'Knit';
		}
		if (collectionCode[0].toUpperCase() == 'F' && collectionCode[1].toUpperCase() != 'F') {
			material = 'C100%';
			special = 'Flannel';
		}
		if (givenCode[0].toUpperCase() == 'P' && givenCode[1].toUpperCase() != 'P') {
			prefix += 'P';
		}
	} else {
		if (collectionFuzz === 'HUE') {
			if (colourName.toUpperCase() === 'BLACK' || colourName.toUpperCase() === 'WHITE') {
				title = colourName + 'out';
			}
		}
		if (collectionFuzz === 'XTONGA') {
			title = 'Extra Wide Tongas';
		}
		if (collectionFuzz.indexOf('PANEL') >= 0) {
			collectionFuzz = 'PANEL';
		}
		if (collectionFuzz.indexOf('SOFTIE') >= 0) {
			collectionFuzz = 'SOFTIE';
			material = 'P100%';
			width = { 'Measurement': '60', 'Unit': 'in' };
		}
		if (givenCode[0].toUpperCase() == 'X' && givenCode[1].toUpperCase() != 'X') {
			prefix += 'X';
			width = { 'Measurement': '106', 'Unit': 'in' };
		}
	}

	let dates = getReleaseDates();

	return {
		'Prefix': prefix,
		'CollectionCode': collectionCode,
		'ColourCode': colourCode,
		'ColourName': colourName,
		'PurchaseCode': purchaseCode,
		'PatternName': patternName,
		'CollectionName': title,
		'SpecialNotes': special,
		'Material': material,
		'Width': width,
		'Repeat': repeat,
		'ReleaseDates': dates,
		'CollectionFuzz': collectionFuzz,
		'IsTonga': isTonga,
	};
}

function formatInformation(itemElement) {
	let item = getItemObject(itemElement);
	if (!item) return;

	let tempCodeColour = (((item.ColourCode.length > 0) ? item.ColourCode + ' ' : '') + item.ColourName).toUpperCase();
	let itemCode = formatItemCode(item.Prefix, item.CollectionCode + ' ' + tempCodeColour);

	let barCode = formatBarCode(itemCode);

	let company = getCompany();
	let widthString = item.Width.Measurement + item.Width.Unit;
	let description = formatSapDescription({ 'Colour': item.ColourName, 'Pattern': item.PatternName, 'Collection': item.CollectionName, 'Special': item.SpecialNotes, 'Material': item.Material, 'Width': 'W' + widthString, 'Repeat': item.Repeat })

	let webName = (((item.ColourName.length > 0) ? item.ColourName + ' - ' : '') + item.PatternName);

	let relDateString = toReleaseString(item.ReleaseDates);
	let webDesc = formatWebDescription({ 'Collection': item.CollectionName, 'Notes': item.SpecialNotes, 'Fibre': item.Material, 'Width': widthString, 'Release': relDateString, 'Delivery From': item.ReleaseDates.Delivery });
	let delDateString = "Not Given - " + toDeliveryString(item.ReleaseDates);

	let webCategory = isStella || item.IsTonga ? item.CollectionName : 'TT ' + item.CollectionFuzz.toTitleCase();

	let result = { 'itemCode': itemCode, 'barCode': barCode, 'description': description, 'webName': webName, 'webDesc': webDesc, 'delDate': delDateString, 'purchaseCode': item.PurchaseCode, 'webCategory': webCategory };
	return result;
}

// https://www.dearstelladesign.com/image/itemIR-210297/w-260/h-360/4c9cac5d/STELLA-1623-WHITE.jpg
// https://www.dearstelladesign.com/image/watermark/itemIR-210297/addImg-102/w-500/h-500/960d8422/STELLA-1623-WHITE.jpg

// https://www.ttfabrics.com/image/itemIR-212447/w-280/h-300/0dd618d7/HOLIDAY-CM8511-BLACK.jpg
// https://www.ttfabrics.com/image/watermark/itemIR-212447/addImg-102/w-500/h-500/0dd618d7/HOLIDAY-CM8511-BLACK.jpg

async function formatImage(item) {
	let result = await scrapeFullSizeImage(item);
	result = result.replace("watermark/", "");
	//result = result.replace("image/", "image/addImg-102/");
	result = result.replace(/(?:\/w-\d+)?(?:\/h-\d+)?/g, "");
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
	ScraperIFrame.domain = document.domain;
	document.body.appendChild(ScraperIFrame);
}

async function scrapeFullSizeImage(item) {
	let ScraperIFrame = document.querySelector('#scraperFrame');
	if (!ScraperIFrame) {
		addScraperIFrame();
		ScraperIFrame = document.querySelector('#scraperFrame')
	}

	let returnedLink;
	const scraperLoadPromise = new Promise(resolve => {
		ScraperIFrame.style.visibility = 'visible';
		ScraperIFrame.src = item.getAttribute('href');
		ScraperIFrame.addEventListener("load", function () {
			let img = ScraperIFrame.contentDocument.querySelector('ul#ItemImagesGallery li.active');
			if (img) {
				let link = img.getAttribute('data-src');
				returnedLink = link;
				ScraperIFrame.src = 'about:blank';
				ScraperIFrame.style.visibility = 'hidden';
				resolve();
			}
		});
	});
	await scraperLoadPromise;

	return returnedLink;
}