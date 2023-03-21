// ==UserScript==
// @name         VicText Collection Extractor - Dear Stella / Timeless Treasures
// @namespace    http://www.tgoff.me/
// @version      2023.03.21.1
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
// @noframes
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/tg-lib.js
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/collection-extract-lib.js
// @grant        GM_setClipboard
// @grant        GM_download
// @run-at        document-idle
// ==/UserScript==

let CONFIG_IGNORE_BASICS = !true;

let isSearch = false;
let isStella = false;
(function () {
	'use strict';
	isSearch = hasParam(window.location.search, "search-key");
	isStella = window.location.hostname.includes('dearstelladesign');

	waitForElements('div.P-Items-Listing-Class').then((elems) => {
		createButtons();
		addSortFilterInputs();
	});
})();

function getCompany() {
	let company = isStella ? 'Dear Stella' : 'Timeless Treasures';
	return company;
}

function getTitleElement() {
	let titleElement = isSearch ? document.querySelector('table td.pageHeading div#WithResult') : document.querySelector('table td.pageHeading h1');
	return titleElement;
}

function getFormattedTitle() {
	let title = isSearch ? getParam(window.location.search, 'search-key') : formatTitle(getTitle(getTitleElement()));
	return title;
}

function getAvailabilityDate() {
	//Notify.log('No Date found for Collection!', getFormattedTitle());
	return undefined;
}

function getCollection() {
	// let collection = document.querySelectorAll('div.P-Items-Listing-Class a[title*="STELLA-"]'); // COLLECTION
	let collection = document.querySelectorAll('div.P-Items-Listing-Class');

	collection.forEach(item => {
		item.style.position = '';
		item.style.top = '';
		item.style.left = '';
		item.style.float = 'left';
		item.style.marginRight = '20px';
		item.style.marginBottom = '20px';
	});

	return collection;
}

var collections = {
	// DEAR STELLA
	'1150': { 'title': 'Moonscape', 'desc': 'Moonscape' },
	'1560': { 'title': 'Jax', 'desc': 'Jax' },
	'2220': { 'title': 'Biased', 'desc': 'Diagonal Stripe' },
	'SRR512': { 'title': 'Scallop Dot', 'desc': 'Scallop Dot' },
	'SRR613': { 'title': 'Triangle Dot', 'desc': 'Triangle Dot' },
	'SRR1300': { 'title': 'Dash Flow', 'desc': 'Dash Flow' },
	'SRR1920': { 'title': 'Speckle', 'desc': 'Speckle' },
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
	'C8760': { 'title': 'Moon Dust Basic', 'desc': 'Texture' },
	'CM7298': { 'title': 'Geo Blender', 'desc': 'Geo' },
	'CM8156': { 'title': 'City Brushed', 'desc': 'Metallic Brushed Texture' },
	'SHIMMER': { 'title': 'Shimmer', 'desc': 'Shimmer' },
	'SOHO': { 'title': 'Soho Basic', 'desc': 'Solid' },
};

var designers = {
	'JL': 'August Wren',
	'AW': 'August Wren',
	'CWR': 'Caitlin Wallace-Rowland',
	'CJ': 'Clara Jean Design',
	'LQ': 'Leezaworks',
	'MB': 'Miriam Bos',
	'NS': 'Nina Stajner',
	'RR': 'Rae Ritchie',
	'WG': 'Wee Gallery',
};

function getItemObject(itemElement) {
	let item = itemElement.querySelector('a[title*=" / "]') ?? itemElement.querySelector('a[title*=" | "]'); //isSearch ? itemElement.querySelector('a[title*=" / "]') : itemElement.querySelector('a[title*="COLLECTION"]');

	let codeElements = item.querySelectorAll('td.ItemsListingInfo > table td');
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
		colourName = colourName.trim().toTitleCase();
	}

	let purchaseCode = formatPurchaseCode(givenCode + '-' + colourName);

	let descElement = item.querySelector('td.ItemsListingInfo span[class*="CustomeFieldFormat"]');
	if (!descElement) {
		Notify.log('Description element not found!', item);
		return;
	}
	let givenDesc = descElement.innerText.trim();
	let patternName = givenDesc.replaceAll('["″]', 'in').toTitleCase();

	let title = getFormattedTitle();
	let special = '';
	let designer = '';
	if (collections.hasOwnProperty(collectionCode)) {
		if (CONFIG_IGNORE_BASICS && title !== collections[collectionCode].title) return undefined;
		if (collectionCode === '1150') prefix = prefix.trim();
		title = collections[collectionCode].title;
		patternName = collections[collectionCode].desc;
	}

	let material = 'C100%';
	let width = { 'Measurement': '45', 'Unit': 'in' };
	let repeat = '';

	if (isStella) {
		for (const signature of Object.keys(designers)) {
			if (collectionCode.toUpperCase().indexOf(signature) >= 0) {
				designer = designers[signature];
				break;
			}
		}

		if (givenCode[0]?.toUpperCase() == 'W') {
			// Wide | WSTELLA
			prefix += 'W';
			width = { 'Measurement': '60', 'Unit': 'in' };
		}
		else if (givenCode[0]?.toUpperCase() == 'P') {
			// Panel | PSTELLA
			prefix += 'P';
		}

		if (collectionCode[0]?.toUpperCase() == 'D') {
			special = 'Digital';
		}
		else if (collectionCode[0]?.toUpperCase() == 'F') {
			special = 'Flannel';
		}
		else if (collectionCode[0]?.toUpperCase() == 'K') {
			material = 'C95% S5%';
			special = 'Knit';
		}
		else if (collectionCode[0]?.toUpperCase() == 'P') {
			// Monochrome is cotton, but has a 'P' prefix?
			if (title.toUpperCase().indexOf('MONOCHROME') < 0) {
				material = 'P100%';
				special = 'Digital';
			}
		}
		else if (collectionCode[0]?.toUpperCase() == 'S') {
			// Not sure about this one, doesn't seem consistent.
			//special = 'Shirting';
		}
	} else {
		if (collectionFuzz === 'HUE') {
			if (colourName.toUpperCase() === 'BLACK' || colourName.toUpperCase() === 'WHITE') {
				title = colourName + 'out';
			}
		}
		else if (collectionFuzz === 'XTONGA') {
			title = 'Extra Wide Tongas';
		}
		else if (collectionFuzz.indexOf('PANEL') >= 0) {
			collectionFuzz = 'PANEL';
		}
		else if (collectionFuzz.indexOf('SOFTIE') >= 0) {
			collectionFuzz = 'SOFTIE';
			width = { 'Measurement': '60', 'Unit': 'in' };
		}
		if (givenCode[0]?.toUpperCase() == 'X' && givenCode[1]?.toUpperCase() != 'X') {
			// eXtra Wide
			prefix += 'X';
			width = { 'Measurement': '106', 'Unit': 'in' };
		}

		if (collectionCode[0]?.toUpperCase() == 'C') {
			material = 'C100%';
		}
		else if (collectionCode[0]?.toUpperCase() == 'B') {
			material = 'C100%';
		}
		else if (collectionCode[0]?.toUpperCase() == 'P') {
			material = 'P100%';
		}

		if (collectionCode[1]?.toUpperCase() == 'D') {
			special = 'Digital';
		}
		else if (collectionCode[1]?.toUpperCase() == 'M') {
			special = 'Metallic';
		}
		else if (collectionCode[1]?.toUpperCase() == 'G') {
			special = 'Glow';
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
		'Designer': designer,
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

	let tempCodeColour = (((item.ColourCode.length > 0) ? item.ColourCode + ' ' : '') + shortenColourName(item.ColourName)).toUpperCase();
	let itemCode = formatItemCode(item.Prefix, item.CollectionCode + ' ' + tempCodeColour);

	let barCode = formatBarCode(itemCode);

	let company = getCompany();
	let widthString = item.Width.Measurement + item.Width.Unit;
	let description = formatSapDescription({ 'Colour': item.ColourName, 'Pattern': item.PatternName, 'Collection': item.CollectionName, 'Special': item.SpecialNotes, 'Material': item.Material, 'Width': 'W' + widthString, 'Repeat': item.Repeat })

	let webName = (((item.ColourName.length > 0) ? item.ColourName + ' - ' : '') + item.PatternName);

	let relDateString = toReleaseString(item.ReleaseDates);
	let comma = item.SpecialNotes && item.SpecialNotes.length > 0 ? ', ' : '';
	let designer = item.Designer && item.Designer.length > 0 ? comma + 'By ' + item.Designer : '';
	let webDesc = formatWebDescription({ 'Collection': item.CollectionName, 'Notes': item.SpecialNotes + designer, 'Fibre': item.Material, 'Width': widthString, 'Release': relDateString, 'Delivery From': item.ReleaseDates.Delivery });
	let delDateString = "Not Given - " + toDeliveryString(item.ReleaseDates);

	let webCategory = isStella || item.IsTonga ? item.CollectionName : 'TT ' + item.CollectionFuzz.toTitleCase();

	let result = { 'itemCode': itemCode, 'barCode': barCode, 'description': description, 'webName': webName, 'webDesc': webDesc, 'delDate': delDateString, 'purchaseCode': item.PurchaseCode, 'webCategory': webCategory };
	return result;
}

// https://www.dearstelladesign.com/image/itemIR-210297/w-260/h-360/4c9cac5d/STELLA-1623-WHITE.jpg
// https://www.dearstelladesign.com/image/watermark/itemIR-210297/addImg-102/w-500/h-500/960d8422/STELLA-1623-WHITE.jpg

// https://www.ttfabrics.com/image/itemIR-212447/w-280/h-300/0dd618d7/HOLIDAY-CM8511-BLACK.jpg
// https://www.ttfabrics.com/image/watermark/itemIR-212447/addImg-102/w-500/h-500/0dd618d7/HOLIDAY-CM8511-BLACK.jpg

async function formatImage(item, index, total) {
	let result = await scrapeFullSizeImage(item, index === total-1);
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

async function scrapeFullSizeImage(item, lastCall) {
	let ScraperIFrame = document.querySelector('#scraperFrame');
	if (!ScraperIFrame) {
		addScraperIFrame();
		ScraperIFrame = document.querySelector('#scraperFrame')
	}

	let returnedLink;
	const scraperLoadPromise = new Promise(resolve => {
		ScraperIFrame.style.visibility = 'visible';
		ScraperIFrame.src = item.querySelector('a[title*=" / "]').getAttribute('href');
		ScraperIFrame.addEventListener("load", function () {
			if (ScraperIFrame.src != 'about:blank') {
				let img = ScraperIFrame.contentDocument.querySelector('ul#ItemImagesGallery li.active');
				if (img) {
					let link = img.getAttribute('data-src');
					returnedLink = link;
					if (lastCall) {
						ScraperIFrame.src = 'about:blank';
						ScraperIFrame.style.visibility = 'hidden';
					}
				}
			}
			resolve();
		});
	});
	await scraperLoadPromise;

	return returnedLink;
}

/***********************************************
 * Collection Sorting & Filtering
 ***********************************************/
function getItemContainer() {
	return document.querySelector('div#P_Items_Listing_Img_Class');
}

function getCodeFromItem(item) {
	let codeElements = item.querySelectorAll('td.ItemsListingInfo > table td');
	if (codeElements.length > 0) {
		let code = codeElements[0].innerText.substring(codeElements[0].innerText.indexOf('-') + 1).trim();
		let colour = codeElements[1].innerText.trim();
		return code + ' ' + colour;
	}
}

addSortBy('Default', (item) => {
	let codeElements = item.querySelectorAll('td.ItemsListingInfo > table td');
	if (codeElements.length > 0) {
		let collection = codeElements[0].innerText.trim();
		let code = '';
		let dash = codeElements[0].innerText.indexOf('-')
		if (dash > 0) {
			code = collection.substring(dash + 1).trim();
			collection = collection.substring(0, dash).trim();
		}
		let colour = codeElements[1].innerText.trim();
		return [collection, code, colour];
	}
});

addSortBy('Code', (item) => {
	let codeElements = item.querySelectorAll('td.ItemsListingInfo > table td');
	if (codeElements.length > 0) {
		let code = codeElements[0].innerText.substring(codeElements[0].innerText.indexOf('-') + 1).trim();
		let colour = codeElements[1].innerText.trim();
		return [code, colour];
	}
});

addSortBy('Colours', (item) => {
	let codeElements = item.querySelectorAll('td.ItemsListingInfo > table td');
	if (codeElements.length > 0) {
		let code = codeElements[0].innerText.substring(codeElements[0].innerText.indexOf('-') + 1).trim();
		let colour = codeElements[1].innerText.trim();
		return [colour, code];
	}
});

function testFilterAgainst(item) {
	let codeElements = item.querySelectorAll('td.ItemsListingInfo');
	let str = '';
	for (const key in codeElements) {
		if (Object.hasOwnProperty.call(codeElements, key)) {
			const element = codeElements[key];
			str += element.innerText + ' ';
		}
	}
	return str.trim();
}

function addFilterMatchStyle(item) {
	let elem = item.querySelector('tr:nth-of-type(2)');
	if (elem) elem.style.boxShadow = 'green inset 0 25px 5px -20px';
}

function removeFilterMatchStyle(item) {
	let elem = item.querySelector('tr:nth-of-type(2)');
	if (elem) elem.style.boxShadow = '';
}