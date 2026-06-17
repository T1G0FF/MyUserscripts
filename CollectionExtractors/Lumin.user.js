// ==UserScript==
// @name         # VicText Collection Extractor - Lumin Fabrics
// @namespace    http://www.tgoff.me/
// @version      2026.06.17.1
// @description  Gets the names and codes from a Ecco Cotton, Island Batik, Tide+Loom Collections, or White Owl Textiles
// @author       www.tgoff.me
// @match        *://luminfabrics.com/shop/*
// @match        *://*.luminfabrics.com/shop/*
// @match        *://luminfabrics.com/shop/category/*
// @match        *://*.luminfabrics.com/shop/category/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=luminfabrics.com
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/tg-lib.js
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/collection-extract-lib.js
// @grant        GM_setClipboard
// @grant        GM_download
// @run-at       document-idle
// @noframes
// ==/UserScript==

const Company = {
	LuminFabrics: 0,
	EccoCotton: 1,
	IslandBatik: 2,
	TideLoom: 3,
	WhiteOwl: 4,
}

let companyEnum = Company.LuminFabrics;
(function () {
	'use strict';
	if (window.location.pathname.includes('ecco-cotton')) {
		companyEnum = Company.EccoCotton;
	}
	else if (window.location.pathname.includes('island-batik')) {
		companyEnum = Company.IslandBatik;
	}
	else if (window.location.pathname.includes('tide-loom')) {
		companyEnum = Company.TideLoom;
	}
	else if (window.location.pathname.includes('white-owl-textiles')) {
		companyEnum = Company.WhiteOwl;
	}

	waitForElements('div#products_grid header#o_wsale_products_header').then((elems) => {
		let headerElem = getTitleElement().querySelector('div#category_header') ?? getTitleElement().querySelector('h1.o_wsale_category_title');
		createButtons(headerElem, 'afterEnd');
		addSortFilterInputs();

		let dropContainer = document.querySelector('.tg-container-dropdown');
		if (dropContainer) dropContainer.style.marginRight = 'auto';
	});
})();

function getCompany() {
	let company = (() => {
		switch (companyEnum) {
			case Company.LuminFabrics: return 'Lumin Fabrics';
			case Company.EccoCotton: return 'Ecco Cotton';
			case Company.IslandBatik: return 'Island Batik';
			case Company.TideLoom: return 'Tide+Loom';
			case Company.WhiteOwl: return 'White Owl Textiles';
		}
	})();
	return company;
}

function getTitleElement() {
	let titleElement = document.querySelector('div#products_grid header#o_wsale_products_header');
	return titleElement;
}

function getTitle() {
	let title = getTitleElement().querySelector('h1.o_wsale_category_title > span').innerText;
	return title;
}

function getAvailabilityDate() {
	//Notify.log('No Date found for Collection!', getFormattedTitle());
	return undefined;
}

function getCollection() {
	let collection = document.querySelectorAll('section#o_wsale_products_grid div[data-name="Product"]');
	return collection;
}

var knownCollections = {
	'108" Widebacks': { 'title': 'Widebacks', 'desc': '', 'width': { 'Measurement': '108', 'Unit': 'in' }, 'boltLength': { 'Measurement': '18', 'Unit': 'yd' } },
	'ECCO Cotton': { 'title': 'ECCO Cotton', 'desc': 'Solid', 'width': { 'Measurement': '45', 'Unit': 'in' }, 'boltLength': { 'Measurement': '10', 'Unit': 'yd' } },
	'Codici': { 'title': 'Codici', 'desc': '', 'width': { 'Measurement': '45', 'Unit': 'in' }, 'boltLength': { 'Measurement': '10', 'Unit': 'yd' } },
	'Cortina': { 'title': 'Cortina', 'desc': '', 'width': { 'Measurement': '56', 'Unit': 'in' }, 'boltLength': { 'Measurement': '12', 'Unit': 'yd' } },
	'Florette': { 'title': 'Florette', 'desc': '', 'width': { 'Measurement': '45', 'Unit': 'in' }, 'boltLength': { 'Measurement': '10', 'Unit': 'yd' } },
	'Foliage': { 'title': 'Foliage', 'desc': '', 'width': { 'Measurement': '45', 'Unit': 'in' }, 'boltLength': { 'Measurement': '10', 'Unit': 'yd' } },
	'Gesso': { 'title': 'Gesso', 'desc': '', 'width': { 'Measurement': '45', 'Unit': 'in' }, 'boltLength': { 'Measurement': '10', 'Unit': 'yd' } },
	'Peppercorn': { 'title': 'Peppercorn', 'desc': '', 'width': { 'Measurement': '45', 'Unit': 'in' }, 'boltLength': { 'Measurement': '10', 'Unit': 'yd' } },
	'Stucco': { 'title': 'Stucco', 'desc': '', 'width': { 'Measurement': '45', 'Unit': 'in' }, 'boltLength': { 'Measurement': '10', 'Unit': 'yd' } },
	'Subtle Symmetry': { 'title': 'Subtle Symmetry', 'desc': '', 'width': { 'Measurement': '45', 'Unit': 'in' }, 'boltLength': { 'Measurement': '10', 'Unit': 'yd' } },
};

let monthRegex = '(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(?:uary|ruary|ch|il|e|y|ust|tember|ober|ember|ember)?';
let dateRegex = new RegExp(`Shipping: ${monthRegex}(?:/${monthRegex})?[ .]([0-9]{4})`);
let RegexEnum = {
	'Month1': 1,
	'Month2': 2,
	'Year': 3,
};

function getItemObject(itemElement) {
	let codeElement = itemElement.querySelector('div.o_wsale_product_information_text h2.o_wsale_products_item_title > a > span');
	let givenDesc = codeElement?.innerText.trim();
	if (!codeElement || !givenDesc || givenDesc == '') {
		codeElement = itemElement.querySelector('form.oe_product_cart[role="article"]');
		givenDesc = codeElement.getAttribute('aria-label').trim();
		if (!codeElement || !givenDesc || givenDesc == '') {
			Notify.log('Code element not found!', itemElement);
			return;
		}
	}
	givenDesc = normalizeUnicodePunctuation(givenDesc);
	if (!givenDesc || givenDesc == '')
		debugger;
	let descElements = givenDesc.split('/');
	let givenCode = descElements[0].trim().toUpperCase();

	for (const ignore of ['-05', '-05', '-2.5', '-FQ']) {
		if (givenCode.endsWith(ignore)) return undefined;
	}

	let prefix = (() => {
		switch (companyEnum) {
			case Company.LuminFabrics: return '';
			case Company.EccoCotton: return 'EC';
			case Company.IslandBatik: return 'IB';
			case Company.TideLoom: return 'TL';
			case Company.WhiteOwl: return 'WO';
		}
	})();

	let colourName = descElements[1].trim();
	let patternName = '';
	if (colourName && colourName.includes('-')) {
		let split = colourName.split('-');
		patternName = split[0].trim().toTitleCase();
		colourName = split[1].trim();
	}
	if (colourName && colourName.length > 0) {
		colourName = fixColourName(colourName);
		colourName = colourName.trim();
	}

	for (const ignore of ['Stamp', 'Stack', 'Strip', 'Stamp Pack', 'Stack Pack', 'Strip Pack', 'Fat Quarter Pack']) {
		if (colourName.endsWith(ignore)) return undefined;
	}

	let title = getTitle()
	if ((!patternName || patternName == '') && knownCollections.hasOwnProperty(title)) {
		patternName = knownCollections[title].desc;
	}

	let purchaseCode = formatPurchaseCode(givenCode);

	//let title = getFormattedTitle();
	let special = '';
	let designer = '';

	let material = 'C100%';
	let width = { 'Measurement': '45', 'Unit': 'in' };
	let repeat = '';
	let boltLength = { 'Measurement': '7', 'Unit': 'm' };

	if (knownCollections.hasOwnProperty(title)) {
		width = knownCollections[title].width;
		boltLength = knownCollections[title].boltLength;
	}

	let isWideback = givenCode.startsWith('WB-')
	let itemCode = givenCode;
	if (isWideback) {
		itemCode = itemCode.replace(/^WB-/, '');
	}
	switch (companyEnum) {
		case Company.LuminFabrics:
			break;
		case Company.EccoCotton:
			itemCode = itemCode.replace(/^EC-/, '');
			break;
		case Company.IslandBatik:
			itemCode = itemCode.replace(/([0-9]{3})([0-9]{3})([0-9]{3})/, '$1-$2-$3');
			break;
		case Company.TideLoom:
			itemCode = itemCode.replace(/^T/, '');
			break;
		case Company.WhiteOwl:
			itemCode = itemCode.replace(/^W/, '');
			break;
	}
	if (isWideback) {
		itemCode = itemCode + 'WB';
		boltLength = { 'Measurement': '18', 'Unit': 'yd' };
	}

	let dates = {};
	// Available Now!
	// Shipping: Jan/Feb 2026
	// Shipping: March/April 2026
	let catHeader = document.querySelector('#category_header.o_wsale_category_description');
	if (isObjectEmpty(dates) && catHeader) {
		if (catHeader.innerText.includes('Available Now')) {
			dates = getReleaseDates();
		}
		else if (catHeader.innerText.includes('Shipping:')) {
			let expectedDate = catHeader.innerText.trim();
			let matches = dateRegex.exec(expectedDate)
			if (matches && matches.length > 1) {
				dates = getReleaseDates(`${matches[RegexEnum.Month2]} ${matches[RegexEnum.Year]}`);
			}
		}
	}

	// Shipping Now!
	// Est. Ship Nov 2026
	let ribbon = itemElement.querySelector('span.o_ribbons');
	if (isObjectEmpty(dates) && ribbon) {
		if (ribbon.innerText.includes('Shipping Now')) {
			dates = getReleaseDates();
		}
		else if (ribbon.innerText.includes('Est. Ship')) {
			let expectedDate = ribbon.innerText.trim();
			expectedDate = expectedDate.replace('Est. Ship', '').trim();
			dates = getReleaseDates(expectedDate);
		}
	}

	if (isObjectEmpty(dates)) {
		dates = getReleaseDates()
	}

	return {
		'Prefix': prefix,
		'StrippedCode': itemCode,
		'ColourName': colourName,
		'PurchaseCode': purchaseCode,
		'PatternName': patternName,
		'CollectionName': title,
		'SpecialNotes': special,
		'Designer': designer,
		'Material': material,
		'Width': width,
		'Repeat': repeat,
		'BoltLength': boltLength,
		'ReleaseDates': dates,
		'IsWideback': isWideback
	};
}

function formatInformation(itemElement) {
	let item = getItemObject(itemElement);
	if (!item) return;

	let itemCode = formatItemCode(item.Prefix, item.StrippedCode);

	let barCode = formatBarCode(itemCode);

	let company = getCompany();
	let widthString = item.Width.Measurement + item.Width.Unit;
	let description = formatSapDescription({ 'Colour': item.ColourName, 'Pattern': item.PatternName, 'Collection': item.CollectionName, 'Special': item.SpecialNotes, 'Material': item.Material, 'Width': 'W' + widthString, 'Repeat': item.Repeat })

	let webName = (((item.ColourName.length > 0) ? item.ColourName + ' - ' : '') + item.PatternName);

	let relDateString = toReleaseString(item.ReleaseDates);
	let comma = item.SpecialNotes && item.SpecialNotes.length > 0 ? ', ' : '';
	let designer = item.Designer && item.Designer.length > 0 ? comma + 'By ' + item.Designer : '';
	let webDesc = formatWebDescription({ 'Collection': item.CollectionName, 'Notes': item.SpecialNotes + designer, 'Fibre': item.Material, 'Width': widthString, 'Release': relDateString, 'Delivery From': item.ReleaseDates.Delivery });
	let delDateString = toDeliveryString(item.ReleaseDates);

	let webCategory = company

	let boltLength = item.BoltLength.Unit === 'm' ? item.BoltLength.Measurement : (item.BoltLength.Measurement * 0.9144);
	boltLength = Math.round((boltLength + Number.EPSILON) * 10) / 10;

	let result = { 'itemCode': itemCode, 'barCode': barCode, 'description': description, 'webName': webName, 'webDesc': webDesc, 'delDate': delDateString, 'purchaseCode': item.PurchaseCode, 'boltLength': boltLength, 'webCategory': webCategory };
	return result;
}

// https://www.luminfabrics.com/web/image/product.product/39145/image_1024/%5BEC-001%5D%20EC-001%20-%20PFD%20Bleach%20White?unique=44c416f
// https://www.luminfabrics.com/web/image/product.product/39145/image_1920/%5BEC-001%5D%20EC-001%20-%20PFD%20Bleach%20White

function formatImage(itemElement) {
	let img = itemElement.querySelector('img.oe_product_image_img');
	let result = img.src;
	result = result.replace('/image_1024/', '/image_1920/');
	result = result.replace(/\?unique=[^&]+?(?:&|$)/, '?');
	result = result.replace(/\?$/, '');
	return result;
}