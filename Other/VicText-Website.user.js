// ==UserScript==
// @name         VicText Website Additions
// @namespace    http://tgoff.me/
// @version      2021.03.15.4
// @description  Adds Misc CSS, Item codes to swatch images, the option to show more items per page and a button to find items without images. Implements Toast popups.
// @author       www.tgoff.me
// @match        *://www.victoriantextiles.com.au/*
// @noframes
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/tg-lib.js
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/collection-extract-lib.js
// @run-at       document-idle
// @grant        GM_setClipboard
// ==/UserScript==

/* eslint-disable no-undef */
const DEBUG = true;
const WEBADD_CONFIG = {
	'MISC_CSS': true,
	'CODES_ON_SWATCHES': true,
	'MORE_PER_PAGE': true,
	'COPY_CODES': true,
	'COPY_IMAGES': true,
	'SORT_CODES': true,
	'FIND_IMAGELESS': true,
	'FIND_CHILDLESS': true,
	'HOVER_PREVIEW': true,
	'SCRAPE_TEMP_PARENTS': true,
	'SCRAPE_IMAGELESS': true,
};

// Browser doesn't like when we make too many navigation calls
let SCRAPER_CALL_FIELD = {};
let SCRAPER_MAX_CALLS = 15;

var cachedCollection = undefined;
var cachedImagelessCollection = undefined;
var cachedChildlessCollection = undefined;

(async function () {
	'use strict';
	if (WEBADD_CONFIG.MISC_CSS) addMiscCSS();
	if (WEBADD_CONFIG.CODES_ON_SWATCHES) addItemCodesToSwatches();
	if (WEBADD_CONFIG.MORE_PER_PAGE) morePerPage();
	if (WEBADD_CONFIG.COPY_CODES) createButton('Copy Codes', getCodesOnPage, getTitleElement(), 'beforeEnd');
	if (WEBADD_CONFIG.COPY_IMAGES) createButton('Copy Images', getImagesOnPage, getTitleElement(), 'beforeEnd');
	if (WEBADD_CONFIG.SORT_CODES) addSortFilterInputs();
	if (WEBADD_CONFIG.FIND_IMAGELESS) {
		// TODO: Until Optional chaining support makes it to stable.
		// createButton('Copy Imageless', getImagelessOnPage, getTitleElement(), 'beforeEnd', getImagelessCollection()?.Collection?.length > 0);
		let test = getImagelessCollection().Collection;
		if (test) {
			createButton('Copy Imageless', getImagelessOnPage, getTitleElement(), 'beforeEnd', test.length > 0);
		}
	}
	if (WEBADD_CONFIG.FIND_CHILDLESS) {
		// TODO: Until Optional chaining support makes it to stable.
		// createButton('Copy Childless', getChildlessOnPage, getTitleElement(), 'beforeEnd', getChildlessCollection()?.length > 0);
		let test = getChildlessCollection();
		if (test) {
			createButton('Copy Childless', getChildlessOnPage, getTitleElement(), 'beforeEnd', test.length > 0);
		}
	}
	if (WEBADD_CONFIG.HOVER_PREVIEW) btnAction_addHoverPreview();
	if (WEBADD_CONFIG.SCRAPE_TEMP_PARENTS) createButton('Temp Parents', btnAction_scrapeFirstImage, getTitleElement(), 'beforeEnd');
	if (WEBADD_CONFIG.SCRAPE_IMAGELESS) addScrapeImagelessInputs();
})();

function addMiscCSS() {
	let cssText = '';
	cssText = `/* 4 per row */
#productListWrapper .col-xs-4:not(.item),
#productListWrapper .col-sm-4:not(.item),
#productListWrapper .col-md-4:not(.item),
#productListWrapper .col-lg-4:not(.item) {
	width: 25%;
	max-height: 230px !important;
	min-height: 230px !important;
}

#productListWrapper .col-xs-4:not(.item) a div,
#productListWrapper .col-sm-4:not(.item) a div,
#productListWrapper .col-md-4:not(.item) a div,
#productListWrapper .col-lg-4:not(.item) a div {
	position: absolute;
	width: 100%;
	top: 0;
	left: 50%;
	display: block;
	z-index: 999;
	transform: translate(-50%, -25%);
}

#productListWrapper .col-xs-4.item,
#productListWrapper .col-sm-4.item,
#productListWrapper .col-md-4.item,
#productListWrapper .col-lg-4.item {
	width: 25%;
	max-height: 310px !important;
}

.galleryWrapper {
	min-height: auto !important;
}

.galleryName {
	min-height: 32px !important;
	max-height: 32px !important;
}

.galleryName a {
	display: block;
	width: 100%;
	white-space: nowrap;
	overflow-x: hidden;
	overflow-y: hidden;
	font-size: 12px;
}

.galleryImage {
	min-height: 200px !important;
	max-height: 200px !important;
}`;
	MyStyles.addStyle('4PerRow', cssText);

	cssText = `/* Hover shadow */
#productListWrapper .col-xs-4:hover,
#productListWrapper .col-sm-4:hover,
#productListWrapper .col-md-4:hover,
#productListWrapper .col-lg-4:hover {
	box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}`;
	MyStyles.addStyle('HoverShadow', cssText);

	cssText = `/* Center Images */
.galleryImage img,
#productListWrapper img {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
}`;
	MyStyles.addStyle('CenterImages', cssText);

	cssText = `/* Category Margins */
.col-md-4.col-sm-4:not(.item) {
	margin-top: 10px;
	margin-bottom: 10px;
}`;
	MyStyles.addStyle('CategoryMargins', cssText);

	cssText = `/* Remove Register */
.login-widget > a:nth-child(6) {
	display:none;
}`;
	MyStyles.addStyle('RemoveRegister', cssText);

	cssText = `/* Special Star */
div.onSpecial, div.onSpecial> span {
    padding: 0px;
    background: none;
    border: none;
}

div.onSpecial {
    margin: 15px 0;
    position: relative;
    display: block;
    color: black;
    width: 0px;
    height: 0px;
    border-right: 50px solid transparent;
    border-bottom: 45px solid yellow;
    border-left: 50px solid transparent;
    transform: rotate(35deg);
}
div.onSpecial:before {
    border-bottom: 40px solid yellow;
    border-left: 15px solid transparent;
    border-right: 15px solid transparent;
    position: absolute;
    height: 0px;
    width: 0px;
    top: -23px;
    left: -33px;
    display: block;
    content: '';
    transform: rotate(-35deg);
}
div.onSpecial:after {
    position: absolute;
    display: block;
    color: black;
    top: 0px;
    left: -50px;
    width: 0px;
    height: 0px;
    border-right: 50px solid transparent;
    border-bottom: 45px solid yellow;
    border-left: 50px solid transparent;
    transform: rotate(-70deg);
    content: '';
}

div.onSpecial > span {
    position: absolute;
    display: inline-block;
    z-index: 999;
    color: black;
    transform: rotate(-35deg) translateX(-58%) translateY(-25%);
}`;
	MyStyles.addStyle('SpecialStar', cssText);
	document.getElementById('CSSToggleCheckbox_SPECIALSTAR').checked = false;
	MyStyles.disableStyle('SpecialStar');
}

function addItemCodesToSwatches() {
	let swatchSpace = '13px';
	let cssText = `
.swatcher-swatch {
	position: relative;
	margin-bottom: calc(2px + ${swatchSpace});
}

.swatch-product-code {
	font-size: 9px;
	font-weight: 900;
	position: absolute;
	display: inline-block;
	height: 1em;
	width: 100%;
	bottom: calc(-1 * ${swatchSpace});
	left: 0;
	z-index: 100;
	color: #7E8075;
	text-shadow: -1px 0 white, 0 1px white, 1px 0 white, 0 -1px white;
}

.swatcher-swatch:hover .swatch-product-code {
	font-size: 18px;
	width: 100%;
	height: calc(100% + 1em);
	z-index: 101;
	left: 0px;
	bottom: auto;
	top: 0px;
	color: black;
	overflow-x: visible;
	white-space: nowrap;
    text-indent: -100%;
}

.swatch-product-img {
	position: absolute;
	display: none;
	z-index: 100;
}

.swatcher-swatch:hover .swatch-product-img {
	width: 250px;
	height: 250px;
	max-width: 250px;
	max-height: 250px;
	display: block;
	z-index: 101;
	top: -250px;
	left: calc((50px / 2) - (250px / 2));
}
`;
	MyStyles.addStyle('SwatchLabels', cssText);
	let collection = document.querySelectorAll('.swatcher-swatch');
	for (let item in collection) {
		if (collection.hasOwnProperty(item)) {
			let currentItem = collection[item];
			let currentImage = currentItem.querySelector('img');
			let productCode = getCodeFromItem(currentItem);

			let imgElement = document.createElement('img');
			imgElement.classList.add('swatch-product-img');
			imgElement.src = '-';
			imgElement.setAttribute('thumbImage', currentImage.src.replaceAll('/swatches', ''));
			currentItem.insertAdjacentElement('beforeEnd', imgElement);

			let codeElement = document.createElement('span');
			codeElement.classList.add('swatch-product-code');
			codeElement.innerText = productCode;
			currentItem.insertAdjacentElement('beforeEnd', codeElement);

			currentItem.addEventListener('mouseover', lazyLoadThumbImages);
		}
	}
}

function morePerPage() {
	let select = document.getElementsByName('perPageSelect');
	if (select.length > 0) {
		let option = document.createElement('option');
		// let option = new Option('All', '500');
		option.text = '100';
		option.value = '100';
		select[0].add(option);
	}
}

/***********************************************
 * Collection Functions
 ***********************************************/
async function getCollection(doc) {
	doc = doc || document;
	let now = Date.now();
	if (!cachedCollection || !cachedCollection[doc] || cachedCollection[doc]['timestamp'] - now > 5000) {
		cachedCollection = {};
		cachedCollection[doc] = {};
		cachedCollection[doc]['timestamp'] = now;
		cachedCollection[doc]['collection'] = doc.querySelectorAll('div.col-md-4.col-sm-4'); // .item
	}
	return cachedCollection[doc]['collection'];
}

async function getImagelessCollection(doc) {
	doc = doc || document;
	let now = Date.now();
	if (!cachedImagelessCollection || !cachedImagelessCollection[doc] || cachedImagelessCollection['timestamp'] - now > 5000) {
		cachedImagelessCollection = {};
		cachedImagelessCollection[doc] = {};
		cachedImagelessCollection[doc]['timestamp'] = now;

		let collection = await getCollection(doc);
		let compareSize = 250;

		// For Swatch Pages
		if (collection.length < 1) {
			collection = doc.querySelectorAll('.swatcher-swatch');
			compareSize = 50;
		}

		let result = [];
		for (let item in collection) {
			if (collection.hasOwnProperty(item)) {
				let currentItem = collection[item];
				let currentImage = currentItem.querySelector('img');
				if (currentImage.getAttribute('src').includes('NoImage.gif')
					|| (currentImage.naturalWidth > 0 && currentImage.naturalWidth < compareSize)
					|| (currentImage.naturalHeight > 0 && currentImage.naturalHeight < compareSize)) {
					result.push(currentItem);
				}
			}
		}
		cachedImagelessCollection[doc]['collection'] = { 'Collection': result, 'CompareSize': compareSize };
	}

	return cachedImagelessCollection[doc]['collection'];
}

async function getChildlessCollection(doc) {
	doc = doc || document;
	let now = Date.now();
	if (!cachedChildlessCollection || !cachedChildlessCollection[doc] || cachedChildlessCollection['timestamp'] - now > 5000) {
		cachedChildlessCollection = {};
		cachedChildlessCollection[doc] = {};
		cachedChildlessCollection[doc]['timestamp'] = now;

		let collection = await getCollection();
		let result = [];
		for (let item in collection) {
			if (collection.hasOwnProperty(item)) {
				let currentItem = collection[item];
				let productCode = getCodeFromItem(currentItem);
				if (productCode.indexOf('WEB-') == 0) {
					result.push(currentItem);
				}
			}
		}
		cachedChildlessCollection[doc]['collection'] = result;
	}
	return cachedChildlessCollection[doc]['collection'];
}

async function getCodesOnPage() {
	let result = '';
	let count = 0;
	if (window.location.href.indexOf('WEB_dash_') > 0) {
		let url = window.location.href;
		let parentRegex = /((?:WEB_dash_)[A-z0-9\_]+)\/(.*)\//;
		let matches = parentRegex.exec(url);
		if (matches && matches.length > 1) {
			result += matches[1].replaceAll('_dash_', '-') + '\t' + matches[2].replaceAll('-', ' ').replaceAll('_dash_', '-') + '\n';
			count++;
		}
	}

	let collection = await getCollection();
	// For Swatch Pages
	if (collection.length < 1) collection = document.querySelectorAll('.swatcher-swatch');
	for (let item in collection) {
		if (collection.hasOwnProperty(item)) {
			let currentItem = collection[item];
			let productCode = getCodeFromItem(currentItem);
			let productName = currentItem.querySelector('img').getAttribute('title');
			result += productCode + '\t' + productName + '\n';
			count++;
		}
	}
	let msg = 'None found!';
	if (count > 0) {
		GM_setClipboard(result);
		msg = count + ' found and copied!';
	}
	if (Toast.CONFIG_TOAST_POPUPS) await Toast.enqueue(msg);
}

async function getImagesOnPage() {
	let imageHtml = '<html>\n<body>\n';
	let collection = Array.prototype.map.call(await getCollection(), el => el.querySelector('img'));
	let compareSize = 250;
	// For Swatch Pages
	if (collection.length < 1) {
		collection = document.querySelectorAll('.swatcher-swatch img:not(.swatch-product-img)');
		compareSize = 50;
	}
	let count = 0;
	for (let item in collection) {
		if (collection.hasOwnProperty(item)) {
			let currentItem = collection[item];
			console.log(compareSize + ': ' + currentItem.naturalWidth + 'x' + currentItem.naturalHeight);
			let givenURL = currentItem.getAttribute('src');
			let currentURL = getAbsolutePath(givenURL).replaceAll('thumbnails/swatches/', '');
			imageHtml = imageHtml + '<img src="' + currentURL + '">\n';
			count++;
		}
	}
	imageHtml = imageHtml + '</body>\n</html>';

	let msg = 'None found!';
	if (count > 0) {
		GM_setClipboard(imageHtml);
		msg = count + ' found and copied!';
	}
	if (Toast.CONFIG_TOAST_POPUPS) await Toast.enqueue(msg);
}

async function getImagelessOnPage() {
	let imageless = getImagelessCollection();
	let result = await formatImageless(imageless);

	let msg = 'None found!';
	if (result.Count > 0) {
		if (result.Output.NoImage != '') result.Output.NoImage = '# Have No Images: \n' + result.Output.NoImage;
		if (result.Output.OddSize != '') result.Output.OddSize = '# Have Small Images: \n' + result.Output.OddSize;
		GM_setClipboard(result.Output.NoImage + '\n' + result.Output.OddSize);
		msg = result.Count + ' found and copied!';
	}
	if (Toast.CONFIG_TOAST_POPUPS) await Toast.enqueue(msg);
}

async function getChildlessOnPage() {
	let collection = getChildlessCollection();
	let result = formatChildless(collection);

	let msg = 'None found!';
	if (result.Count > 0) {
		GM_setClipboard(result.Output);
		msg = result.Count + ' found and copied!';
	}
	if (Toast.CONFIG_TOAST_POPUPS) await Toast.enqueue(msg);
}

function formatImageless(imageless) {
	let result = {};
	result.NoImage = '';
	result.OddSize = '';
	let count = 0;

	for (let item in imageless.Collection) {
		if (imageless.Collection.hasOwnProperty(item)) {
			let currentItem = imageless.Collection[item];

			let currentImage = currentItem.querySelector('img');
			if (currentImage.getAttribute('src').includes('NoImage.gif')) {
				let currentItem = imageless.Collection[item];
				let currentImage = currentItem.querySelector('img');
				let productCode = getCodeFromItem(currentItem);
				let productName = currentImage.getAttribute('title');
				result.NoImage += productCode + '\t' + productName + '\n';
				count++;
				continue;
			}
			if (currentImage.naturalWidth < imageless.CompareSize || currentImage.naturalHeight < imageless.CompareSize) {
				let currentItem = imageless.Collection[item];
				let currentImage = currentItem.querySelector('img');
				let productCode = getCodeFromItem(currentItem);
				let productName = currentImage.getAttribute('title');
				result.OddSize += productCode + '\t' + productName + '\n';
				count++;
				continue;
			}
		}
	}
	return { 'Output': result, 'Count': count };
}

function formatChildless(collection) {
	let result = '';
	let count = 0;
	for (let item in collection) {
		if (collection.hasOwnProperty(item)) {
			let currentItem = collection[item];
			let currentImage = currentItem.querySelector('img');
			let productCode = getCodeFromItem(currentItem);
			let productName = currentImage.getAttribute('title');
			if (currentItem.querySelector('div.galleryPrice')) {
				result += productCode + '\t' + productName + '\n';
			}
		}
	}
	return { 'Output': result, 'Count': count };
}

/***********************************************
 * Hover Preview iFrame
 ***********************************************/
async function btnAction_addHoverPreview() {
	if (inIframe()) return;
	let cssText = `
	#hoverPreview {
		height: 25%;
		width: 25%;
		position: absolute;
		display: block;
		visibility: hidden;
		top: 0px;
		left: 0px;
		z-index: 999;
	}

	#hoverPreview:hover {
		visibility: visible;
	}
	`;
	MyStyles.addStyle('Hover iFrame', cssText);

	var iFramePreview = document.createElement('iframe');
	iFramePreview.id = iFramePreview.name = 'hoverPreview';
	iFramePreview.onmouseout = function (event) {
		if (event.relatedTarget === iFramePreview.caller
			|| iFramePreview.caller.getAllChildren().includes(event.relatedTarget)) return;
		hidePreview(iFramePreview);
	};
	document.body.appendChild(iFramePreview);

	let coll = await getCollection();
	coll.forEach((currentValue) => {
		let target = currentValue;
		currentValue.onmouseover = function (event) {
			if (event.shiftKey) {
				if (event.relatedTarget === iFramePreview) return;
				showPreview(iFramePreview, target);
			}
		};
		currentValue.onmouseout = function (event) {
			if (event.relatedTarget === iFramePreview) return;
			hidePreview(iFramePreview);
		};
	});
}

function showPreview(iFrame, hoverElement) {
	let itemCoords = hoverElement.getCoords();
	let x = (itemCoords.top + (iFrame.clientHeight / 2));
	let y = (itemCoords.left - (hoverElement.clientWidth / 2));
	iFrame.caller = hoverElement;
	iFrame.style.top = x + 'px';
	iFrame.style.left = y + 'px';
	iFrame.src = hoverElement.querySelector('a').getAttribute('href');
	iFrame.style.visibility = 'visible';
}

function hidePreview(iFrame) {
	iFrame.caller = undefined;
	iFrame.src = 'about:blank';
	iFrame.style.visibility = 'hidden';
}

/***********************************************
 * Scraping iFrame
 ***********************************************/
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

async function btnAction_scrapeFirstImage() {
	let imageHtml = '<html>\n<body>\n';
	let collection = getImagelessCollection().Collection;
	let count = 0;
	for (let item in collection) {
		if (collection.hasOwnProperty(item)) {
			let currentItem = collection[item];
			let productCode = getCodeFromItem(currentItem);
			if (productCode === "Collection") {
				count++;
				if (count <= parseInt(SCRAPER_CALL_FIELD.value, 10)) continue;
				let lastCall = Math.min((parseInt(SCRAPER_CALL_FIELD.value, 10) + SCRAPER_MAX_CALLS), collection.length) - 1; // Last in increment or last in collection
				if (count > lastCall) break;

				let link = getAbsolutePath(await scrapeFirstImage(currentItem, count == lastCall));
				link = link.replaceAll('thumbnails/swatches/', '');
				link = link.replaceAll('thumbnails/', '');
				imageHtml = imageHtml + '<img src="' + link + '">\n';
			}
		}
	}
	imageHtml = imageHtml + '</body>\n</html>';

	let msg = 'None found!';
	if (count > 0) {
		GM_setClipboard(imageHtml);
		msg = count + ' found and copied!';
	}
	if (Toast.CONFIG_TOAST_POPUPS) await Toast.enqueue(msg);
}
async function scrapeFirstImage(item, lastCall) {
	let ScraperIFrame = document.querySelector('#scraperFrame');
	if (!ScraperIFrame) {
		addScraperIFrame();
		ScraperIFrame = document.querySelector('#scraperFrame')
	}

	let returnedLink;
	const scraperLoadPromise = new Promise(resolve => {
		ScraperIFrame.style.visibility = 'visible';
		ScraperIFrame.src = item.querySelector('a').getAttribute('href');
		ScraperIFrame.addEventListener("load", function () {
			if (ScraperIFrame.src != 'about:blank') {
				let img = ScraperIFrame.contentDocument.querySelectorAll('div.col-md-4.col-sm-4 img')[0];
				if (img) {
					let link = img.getAttribute('src');
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

function addScrapeImagelessInputs() {
	let imgButton = document.createElement('button');
	imgButton.innerText = 'Scrape Imageless';
	imgButton.classList.add('tg-dropdown-option');
	imgButton.onclick = btnAction_scrapeImageless;

	SCRAPER_CALL_FIELD = document.createElement('INPUT');
	SCRAPER_CALL_FIELD.type = 'number';
	SCRAPER_CALL_FIELD.value = 0;
	SCRAPER_CALL_FIELD.step = SCRAPER_MAX_CALLS;
	SCRAPER_CALL_FIELD.style.marginLeft = '2px';
	SCRAPER_CALL_FIELD.style.padding = '6px 2px';
	SCRAPER_CALL_FIELD.style.width = '60px';
	SCRAPER_CALL_FIELD.style.height = '100%';

	addElementToDropdownContainer(getTitleElement(), [imgButton, SCRAPER_CALL_FIELD], 'beforeEnd');
}

async function btnAction_scrapeImageless() {
	// Grab all the imageless on current page first
	let imglessResult = getImagelessCollection();
	let collection = await getCollection();
	let count = 0;
	for (let item in collection) {
		if (collection.hasOwnProperty(item)) {
			let currentItem = collection[item];
			let productCode = getCodeFromItem(currentItem);
			if (productCode === "Collection") {
				count++;
				if (count <= parseInt(SCRAPER_CALL_FIELD.value, 10)) continue;
				let lastCall = Math.min((parseInt(SCRAPER_CALL_FIELD.value, 10) + SCRAPER_MAX_CALLS), collection.length);// -1; // Last in increment or last in collection
				if (count > lastCall) break;

				let localResult = await scrapeImageless(currentItem, count == lastCall);
				Array.prototype.push.apply(imglessResult.Collection, localResult);

				// SLEEP - THIS IS BAD, I KNOW.
				var start = new Date().getTime();
				for (var i = 0; i < 1e7; i++) {
					if ((new Date().getTime() - start) > 1000) {
						break;
					}
				}
			}
		}
	}

	formatImageless(imglessResult);
}
async function scrapeImageless(item, lastCall) {
	let ScraperIFrame = document.querySelector('#scraperFrame');
	if (!ScraperIFrame) {
		addScraperIFrame();
		ScraperIFrame = document.querySelector('#scraperFrame')
	}

	let returnedImgless;
	const scraperLoadPromise = new Promise(resolve => {
		ScraperIFrame.style.visibility = 'visible';
		ScraperIFrame.src = item.querySelector('a').getAttribute('href');
		ScraperIFrame.addEventListener("load", function () {
			if (ScraperIFrame.src != 'about:blank') {
				let localCollection = getImagelessCollection(ScraperIFrame.contentDocument);
				if (localCollection) {
					returnedImgless = localCollection.Collection;
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

	return returnedImgless;
}

/***********************************************
 * Collection Sorting & Filtering
 ***********************************************/
function getItemContainer() {
	return document.querySelector('div#Gallery');
}

function testFilterAgainst(item) {
	// TODO: Until Optional chaining support makes it to stable.
	// return item.querySelector('.galleryName')?.innerText;
	let strElement = item.querySelector('.galleryName');
	if (strElement) {
		return strElement.innerText;
	}
}

function addFilterMatchStyle(item) {
	item.querySelector('.galleryName > a').style.color = 'green';
}

function removeFilterMatchStyle(item) {
	item.querySelector('.galleryName > a').style.color = '';
}

/***********************************************
 * Utility Functions
 ***********************************************/
function getTitleElement() {
	let titleElement = document.querySelector('#productListWrapper > h1');
	// For Swatch Pages
	if (!titleElement) titleElement = document.querySelector('#productDetailWrapper > div:nth-child(6) > h4');
	return titleElement;
}

function lazyLoadThumbImages(e) {
	let currentItem = e.currentTarget;
	let imgElement = currentItem.querySelector('img.swatch-product-img');
	if (imgElement.src === getAbsolutePath('-')) {
		//if (DEBUG) console.log('mouseOver Success! Lazy updated: ', imgElement.getAttribute('thumbImage'));
		imgElement.src = imgElement.getAttribute('thumbImage');
		currentItem.removeEventListener('mouseover', lazyLoadThumbImages);
	}
}

function getCodeFromItem(currentItem) {
	let productCode = currentItem.getAttribute('id');
	if (!productCode) {
		let codeRegEx = /https?:\/\/www\.victoriantextiles\.com\.au\/(.*?)\/.*\/pd\.php/g;
		let matches = codeRegEx.exec(currentItem.getAttribute('href'));
		if (matches) {
			productCode = matches[1];
		} else {
			productCode = "Collection";
		}
	}
	productCode = productCode.replace(/prod-id-/g, '');
	productCode = ss_decode(productCode);
	return productCode;
}

function ss_encode(str) {
	str.replaceAll('-', '_dash_');
	str.replaceAll('&', '_and_');
	str.replaceAll(' ', '-');
	str.replaceAll('/', '_or_');
	str.replaceAll('=', '_equals_');
	return str;
}

function ss_decode(str) {
	str = str.replaceAll('-', ' ');
	str = str.replaceAll('_dash_', '-');
	str = str.replaceAll('_and_', '&');
	str = str.replaceAll('_or_', '/');
	str = str.replaceAll('_equals_', '=');
	return str;
}