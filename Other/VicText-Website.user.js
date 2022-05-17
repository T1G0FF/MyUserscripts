// ==UserScript==
// @name         VicText Website Additions
// @namespace    http://www.tgoff.me/
// @version      2022.05.17.2
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
	'STOCK_ICONS': true,
	'CODES_ON_SWATCHES': true,
	'MORE_PAGER_OPTIONS': true,
	'COPY_CODES': true,
	'COPY_IMAGES': true,
	'FIND_IMAGELESS': true,
	'FIND_CHILDLESS': true,
	'SCRAPE_TEMP_PARENTS': true,
	'SCRAPE_IMAGELESS': true,
	'SORT_CODES': true,
	'HOVER_PREVIEW': true,
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
	if (WEBADD_CONFIG.STOCK_ICONS) replaceStockIndicatorsWithIcons();
	if (WEBADD_CONFIG.CODES_ON_SWATCHES) addItemCodesToSwatches();
	if (WEBADD_CONFIG.MORE_PAGER_OPTIONS) morePagerOptions();
	if (WEBADD_CONFIG.COPY_CODES) createButton('Copy Codes', getCodesOnPage, getTitleElement(), 'beforeEnd');
	if (WEBADD_CONFIG.COPY_IMAGES) createButton('Copy Images', getImagesOnPage, getTitleElement(), 'beforeEnd');
	if (WEBADD_CONFIG.FIND_IMAGELESS) createButton('Copy Imageless', getImagelessOnPage, getTitleElement(), 'beforeEnd', (await getImagelessCollection())?.Collection?.length > 0);
	if (WEBADD_CONFIG.FIND_CHILDLESS) createButton('Copy Childless', getChildlessOnPage, getTitleElement(), 'beforeEnd', (await getChildlessCollection())?.length > 0);
	if (WEBADD_CONFIG.SCRAPE_TEMP_PARENTS) createButton('Temp Parents', btnAction_scrapeFirstImage, getTitleElement(), 'beforeEnd');
	if (WEBADD_CONFIG.SCRAPE_IMAGELESS) addScrapeImagelessInputs();
	if (WEBADD_CONFIG.SORT_CODES) addSortFilterInputs();
	if (WEBADD_CONFIG.HOVER_PREVIEW) addHoverPreview();
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
	z-index: 100;
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
	MyStyles._addStyle(cssText); // 'CategoryMargins'

	cssText = `/* Remove Register */
.login-widget > a:nth-child(6) {
	display:none;
}`;
	MyStyles._addStyle(cssText); // 'RemoveRegister'

	cssText = `/* Special Star */
div.onSpecial, div.onSpecial > span {
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
    z-index: 101;
    color: black;
    transform: rotate(-35deg) translateX(-58%) translateY(-25%);
}`;
	MyStyles.addStyle('SpecialStar', cssText, true); // Disabled by Default

	cssText = `/* Small Stock Indicators */
.stockIndicator {
	bottom: 5px;
	padding: 5px;
	font-size: 12px;
}`;
	MyStyles.addStyle('StockIndicatorsSmall', cssText);
}

function replaceStockIndicatorsWithIcons() {
	let COLOURFUL = true;
	let COLOURFUL_TEXT = true;
	let SWAP_FG_BG = true;

	let colWhite = '#FFFFFF';
	let colOffWhite = '#FAF8EB';
	let colBlack = '#000000';
	let colLtGreen = '#80CA9E';
	let colDkGreen = '#075D2A';
	let colLtOrange = '#FF9200';
	let colDkOrange = '#9B5900';
	let colLtBlue = '#659AD4';
	let colDkBlue = '#083A71';
	let colLtPurple = '#CEAAE2';
	let colDkPurple = '#6F348F';

	let defFGColour = colBlack;
	let defBGColour = colOffWhite;

	let GreenFG = SWAP_FG_BG ? colDkGreen : colLtGreen;
	let GreenBG = SWAP_FG_BG ? colLtGreen : colDkGreen;
	let OrangeFG = SWAP_FG_BG ? colDkOrange : colLtOrange;
	let OrangeBG = SWAP_FG_BG ? colLtOrange : colDkOrange;
	let BlueFG = SWAP_FG_BG ? colDkBlue : colLtBlue;
	let BlueBG = SWAP_FG_BG ? colLtBlue : colDkBlue;
	let PurpleFG = SWAP_FG_BG ? colDkPurple : colLtPurple;
	let PurpleBG = SWAP_FG_BG ? colLtPurple : colDkPurple;

	let cssText = `/* Hide Stock Indicator Icons by Default */
.stockIndicator > span.stockIndicatorIcon,
.stockIndicator > span.stockIndicatorCount {
	display: none;
}`;
	MyStyles._addStyle(cssText);

	cssText = `/* Icon Stock Indicators */
.stockIndicator > span.stockIndicatorText {
	display: none;
}
.stockIndicator:hover > span.stockIndicatorText {
	display: inline-block;
}
.stockIndicator:hover > span.stockIndicatorCount {
	display: none;
}

.stockIndicator > span.stockIndicatorIcon,
.stockIndicator > span.stockIndicatorCount {
	display: inline-block;
}

.stockColor-instock {
	background-color: ${COLOURFUL ? GreenBG : defBGColour};
	color: ${COLOURFUL_TEXT ? GreenFG : defFGColour};
}

.stockColor-backorder {
	background-color: ${COLOURFUL ? OrangeBG : defBGColour};
	color: ${COLOURFUL_TEXT ? OrangeFG : defFGColour};
}

.stockColor-indent {
	background-color: ${COLOURFUL ? PurpleBG : defBGColour};
	color: ${COLOURFUL_TEXT ? PurpleFG : defFGColour};
}

.stockColor-coming {
	background-color: ${COLOURFUL ? BlueBG : defBGColour};
	color: ${COLOURFUL_TEXT ? BlueFG : defFGColour};
}`;
	MyStyles.addStyle('StockIndicatorsIcon', cssText);

	let collection = document.querySelectorAll('.stockIndicator');
	for (const stockElement of collection) {
		let spanTextSpan = stockElement.querySelector('span');
		spanTextSpan.classList.add('stockIndicatorText');
		let stockText = spanTextSpan.innerText;
		let stockIconText;
		if (stockText.indexOf('In Stock') >= 0) {
			let tempStr = stockText.substring(0, stockText.indexOf(' '));
			let tempNum = parseInt(tempStr);

			stockElement.classList.add('stockColor-instock');
			stockIconText = '✓';
			if (!isNaN(tempNum)) { // Is a number, append it.
				let stockCountElement = document.createElement('span');
				stockCountElement.classList.add('stockIndicatorCount');
				stockCountElement.innerText = `\u00A0${tempNum}`;
				stockElement.insertAdjacentElement('afterbegin', stockCountElement);
			}
		}
		else if (stockText.indexOf('On Backorder') >= 0) {
			stockElement.classList.add('stockColor-backorder');
			stockIconText = 'X';
		}
		else if (stockText.indexOf('Indent Only') >= 0) {
			stockElement.classList.add('stockColor-indent');
			stockIconText = '<';
		}
		else if (stockText.indexOf('On Order With Supplier') >= 0) {
			stockElement.classList.add('stockColor-coming');
			stockIconText = '>';
		}

		let stockIconElement = document.createElement('span');
		stockIconElement.classList.add('stockIndicatorIcon');
		stockIconElement.innerText = stockIconText;
		stockElement.insertAdjacentElement('afterbegin', stockIconElement);
	}
}

function addItemCodesToSwatches() {
	let swatchSpace = '13px';
	let cssText = `
.swatcher-swatch {
	position: relative;
}

/* Hide Swatch Labels by Default */
.swatch-product-code {
	position: absolute;
	display: none;
	font-size: 9px;
	font-weight: 900;
	color: #7E8075;
	text-shadow: -1px 0 white, 0 1px white, 1px 0 white, 0 -1px white;
}

/* Hide Swatch Previews by Default */
.swatch-product-img {
	position: absolute;
	display: none;
	z-index: 100;
}`;
	MyStyles._addStyle(cssText);

	cssText = `/* Add Labels to Swatches */
.swatcher-swatch {
	margin-bottom: calc(2px + ${swatchSpace});
}

.swatch-product-code {
	display: inline-block;
	height: 1em;
	width: 100%;
	bottom: calc(-1 * ${swatchSpace});
	left: 0;
	z-index: 100;
}`;
	MyStyles.addStyle('SwatchLabels', cssText);

	cssText = `/* Enlarge Label on Hover */
.swatcher-swatch:hover .swatch-product-code {
	font-size: 18px;
	width: 100%;
	height: calc(100% + 1em);
	display: inline-block;
	z-index: 101;
	left: 0px;
	bottom: auto;
	top: 0px;
	color: black;
	overflow-x: visible;
	white-space: nowrap;
    text-indent: -50%;
}

/* Display Thumbnail Image on  Hover */
.swatcher-swatch:hover .swatch-product-img {
	width: 250px;
	height: 250px;
	max-width: 250px;
	max-height: 250px;
	display: block;
	z-index: 101;
	/* - Height of Thumbnail */
	top: -250px;
	/* Half Width of Swatch - Half Width of Thumbnail */
	left: calc((50px / 2) - (250px / 2));
}`;
	MyStyles.addStyle('SwatchHover', cssText);

	let collection = document.querySelectorAll('.swatcher-swatch');
	for (const currentItem of collection) {
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

function morePagerOptions() {
	let select = document.getElementsByName('perPageSelect');
	if (select.length > 0) {
		let option = document.createElement('option');
		// StraightSell limit the number of items per page to 100 maximum.
		// let option = new Option('All', '500');
		option.text = '100';
		option.value = '100';
		select[0].add(option);
	}

	let pagerForm = document.getElementsByName('itemsPerPage');
	if (pagerForm && pagerForm.length > 0) {
		let prevButtonElement = document.querySelector('ul.pagination li:first-of-type');
		let prevButton = changePagerButtonText(prevButtonElement, -1, '⟨');

		let nextButtonElement = document.querySelector('ul.pagination li:last-of-type');
		let nextButton = changePagerButtonText(nextButtonElement, -1, '⟩');

		let pageCount = pagerForm[0].lastElementChild?.innerText;
		if (pageCount) {
			pageCount = parseInt(pageCount);
			if (pageCount > 1) {
				addPagerButtonsFirstLast(prevButtonElement, nextButtonElement, pageCount);
			}
		}
	}

	let pagerWrappers = document.querySelectorAll('div.pagerWrapper');
	if (pagerWrappers && pagerWrappers.length > 0) {
		addPagerOptionsAtTop(pagerWrappers);
	}
}

function addPagerButtonsFirstLast(prevButtonElement, nextButtonElement, pageCount) {
	let firstButtonElement = prevButtonElement.cloneNode(true);
	let firstButton = changePagerButtonText(firstButtonElement, 1, '⟪');
	prevButtonElement.parentElement.prepend(firstButtonElement);

	let lastButtonElement = nextButtonElement.cloneNode(true);
	let lastButton = changePagerButtonText(lastButtonElement, pageCount, '⟫');
	nextButtonElement.parentElement.append(lastButtonElement);
}

function changePagerButtonText(element, page, text) {
	let button = element.querySelector('a');
	if (button) {
		if (page > 0) button.href = button.href.replace(/pager=[0-9]+/i, 'pager=' + page);
	}
	else {
		button = element.querySelector('span');
	}
	button.innerText = text;
	return button;
}

function addPagerOptionsAtTop(pagerWrappers) {
	let heading = document.getElementById('productListWrapper').querySelector('h1');
	let divider = document.querySelector('div.productDetailDivider');
	let clearFloat = document.querySelector('br.clearfloat');

	let pagerContainer = document.createElement('div');
	pagerContainer.append(divider.cloneNode(true));
	for (const pagerWrapper of pagerWrappers) {
		pagerContainer.append(pagerWrapper.cloneNode(true));
	}
	pagerContainer.append(clearFloat.cloneNode(true));
	pagerContainer.append(divider.cloneNode(true));

	heading.after(pagerContainer);
}

/***********************************************
 * Collection Functions
 ***********************************************/
async function getCollection(doc) {
	doc = doc || document;
	let now = Date.now();
	if (!cachedCollection || !cachedCollection[doc] || now - cachedCollection[doc]['timestamp'] > 5000) {
		cachedCollection = cachedCollection || {};
		cachedCollection[doc] = cachedCollection[doc] || {};
		cachedCollection[doc]['timestamp'] = now;
		cachedCollection[doc]['collection'] = doc.querySelectorAll('div.col-md-4.col-sm-4'); // .item
	}
	return cachedCollection[doc]['collection'];
}

async function getImagelessCollection(doc) {
	doc = doc || document;
	let now = Date.now();
	if (!cachedImagelessCollection || !cachedImagelessCollection[doc] || now - cachedImagelessCollection[doc]['timestamp'] > 5000) {
		cachedImagelessCollection = cachedImagelessCollection || {};
		cachedImagelessCollection[doc] = cachedImagelessCollection[doc] || {};
		cachedImagelessCollection[doc]['timestamp'] = now;

		let collection = await getCollection(doc);
		let compareSize = 250;

		// For Swatch Pages
		if (collection.length < 1) {
			collection = doc.querySelectorAll('.swatcher-swatch');
			compareSize = 50;
		}

		let result = [];
		for (const currentItem of collection) {
			let currentImage = currentItem.querySelector('img');
			if (currentImage.getAttribute('src').includes('NoImage.gif')
				|| (currentImage.naturalWidth > 0 && currentImage.naturalWidth < compareSize)
				|| (currentImage.naturalHeight > 0 && currentImage.naturalHeight < compareSize)) {
				result.push(currentItem);
			}
		}
		cachedImagelessCollection[doc]['collection'] = { 'Collection': result, 'CompareSize': compareSize };
	}

	return cachedImagelessCollection[doc]['collection'];
}

async function getChildlessCollection(doc) {
	doc = doc || document;
	let now = Date.now();
	if (!cachedChildlessCollection || !cachedChildlessCollection[doc] || now - cachedChildlessCollection[doc]['timestamp'] > 5000) {
		cachedChildlessCollection = cachedChildlessCollection || {};
		cachedChildlessCollection[doc] = cachedChildlessCollection[doc] || {};
		cachedChildlessCollection[doc]['timestamp'] = now;

		let collection = await getCollection();
		let result = [];
		for (const currentItem of collection) {
			let productCode = getCodeFromItem(currentItem);
			if (productCode.indexOf('WEB-') == 0) {
				result.push(currentItem);
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
			result += ss_decode(matches[1]) + '\t' + ss_decode(matches[2]) + '\n';
			count++;
		}
	}

	let collection = await getCollection();
	// For Swatch Pages
	if (collection.length < 1) collection = document.querySelectorAll('.swatcher-swatch');
	for (const currentItem of collection) {
		let productCode = getCodeFromItem(currentItem);
		let productName = currentItem.querySelector('img').getAttribute('title');
		result += productCode + '\t' + productName + '\n';
		count++;
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
	for (const currentItem of collection) {
		console.log(compareSize + ': ' + currentItem.naturalWidth + 'x' + currentItem.naturalHeight);
		let givenURL = currentItem.getAttribute('src');
		let currentURL = getAbsolutePath(givenURL).replaceAll('thumbnails/swatches/', '');
		imageHtml = imageHtml + '<img src="' + currentURL + '">\n';
		count++;
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
	let imageless = await getImagelessCollection();
	let result = formatImageless(imageless);

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
	let collection = await getChildlessCollection();
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

	for (const currentItem of imageless.Collection) {
		let currentImage = currentItem.querySelector('img');
		let productCode = getCodeFromItem(currentItem);
		let productName = currentImage.getAttribute('title');
		if (currentImage.getAttribute('src').includes('NoImage.gif')) {
			result.NoImage += productCode + '\t' + productName + '\n';
			count++;
			continue;
		}
		if (currentImage.naturalWidth < imageless.CompareSize || currentImage.naturalHeight < imageless.CompareSize) {
			result.OddSize += productCode + '\t' + productName + '\n';
			count++;
			continue;
		}
	}
	return { 'Output': result, 'Count': count };
}

function formatChildless(collection) {
	let result = '';
	let count = 0;
	for (const currentItem of collection) {
		let currentImage = currentItem.querySelector('img');
		let productCode = getCodeFromItem(currentItem);
		let productName = currentImage.getAttribute('title');
		if (currentItem.querySelector('div.galleryPrice')) {
			result += productCode + '\t' + productName + '\n';
		}
	}
	return { 'Output': result, 'Count': count };
}

/***********************************************
 * Default iFrame Setup
 ***********************************************/
let MyiFrame = new function() {
	this.added = false;
	this.init = function() {
		let cssText = `
.tg-iframe {
	height: 25%;
	width: 25%;
	position: absolute;
	display: none;
	visibility: hidden;
	top: 0px;
	left: 0px;
	z-index: 999;
}`;
		MyStyles._addStyle(cssText);
	}

	this.create = function(name) {
		if (!this.added) this.init();

		let iFrame = document.querySelector('#' + name);
		if (!iFrame) {
			if (inIframe()) return;

			iFrame = document.createElement('iframe');
			iFrame.id = iFrame.name = name;
			iFrame.classList.add('tg-iframe');
			iFrame.sandbox = 'allow-same-origin allow-scripts';
			iFrame.domain = document.domain;
			document.body.appendChild(iFrame);
		}
		return iFrame;
	}

	this.show = function(iFrame, src, caller = undefined) {
		iFrame.caller = caller;
		iFrame.src = src;
		iFrame.style.display = 'block';
		iFrame.style.visibility = 'visible';
	}

	this.hide = function(iFrame, src = undefined) {
		iFrame.caller = undefined;
		if (src) iFrame.src = src;
		iFrame.style.display = 'none';
		iFrame.style.visibility = 'hidden';
	}
}

/***********************************************
 * Hover Preview iFrame
 ***********************************************/
async function addHoverPreview() {
	if (inIframe()) return;
	let iFramePreview = MyiFrame.create('hoverPreview');

	let cssText = `/* Keep preview visible while hovered */
	#hoverPreview:hover {
		display: block;
		visibility: visible;
	}`;
	MyStyles._addStyle(cssText); // Hover iFrame

	iFramePreview.onmouseout = function (event) {
		if (event.relatedTarget === iFramePreview.caller
			|| iFramePreview.caller.getAllChildren().includes(event.relatedTarget)) return;
		hidePreview(iFramePreview);
	};

	let coll = await getCollection();
	coll.forEach((currentValue) => {
		let target = currentValue;
		currentValue.onmouseover = function (event) {
			if (event.shiftKey) {
				if (event.relatedTarget === iFramePreview) return;

				let itemCoords = hoverElement.getCoords();
				let x = (itemCoords.top + (iFramePreview.clientHeight / 2));
				let y = (itemCoords.left - (target.clientWidth / 2));
				iFramePreview.style.top = x + 'px';
				iFramePreview.style.left = y + 'px';

				let src = target.querySelector('a').getAttribute('href');
				MyiFrame.show(iFramePreview, src, target);
			}
		};
		currentValue.onmouseout = function (event) {
			if (event.relatedTarget === iFramePreview) return;
			MyiFrame.hide(iFramePreview);
		};
	});
}

/***********************************************
 * Scraping iFrame
 ***********************************************/
async function scrapeItemWithIFrame(item, lastCall, onLoad, onReturn) {
	if (inIframe()) return;
	let iFrameScraper = MyiFrame.create('scraperFrame');

	let scrapedResult;
	const scraperLoadedPromise = new Promise(resolve => {
		iFrameScraper.addEventListener("load", async function () {
			if (iFrameScraper.src != 'about:blank') {
				let localResult = await onLoad(iFrameScraper.contentDocument);
				if (localResult) {
					scrapedResult = await onReturn(localResult);
				}
			}
			resolve();
		});
		
		let src = item.querySelector('a').getAttribute('href');
		MyiFrame.show(iFrameScraper, src);
	});
	await scraperLoadedPromise;
	// Sets the source to 'about:blank' on last call
	// This counts against our navigation count, so we only do it once at the end.
	MyiFrame.hide(iFrameScraper, lastCall ? 'about:blank' : undefined);
	return scrapedResult;
}

async function scrapeCollectionWithIFrame(collection, initResult, onFrameLoad, onFrameReturn, aggregateItem, onEnd) {
	let count = 0;
	let result = await initResult();
	for (const currentItem of collection) {
		let productCode = getCodeFromItem(currentItem);
		if (productCode === "Collection") {
			count++;
			if (count <= parseInt(SCRAPER_CALL_FIELD.value, 10)) continue;
			let lastCall = Math.min((parseInt(SCRAPER_CALL_FIELD.value, 10) + SCRAPER_MAX_CALLS), collection.length); // Last in increment or last in collection
			if (count > lastCall) break;

			let scrapedResult = await scrapeItemWithIFrame(currentItem, count == lastCall, onFrameLoad, onFrameReturn);

			result = await aggregateItem(result, scrapedResult);
		}
	}
	await onEnd(count, result);
	return { 'Output': result, 'Count': count };
}

async function btnAction_scrapeFirstImage() {
	await scrapeCollectionWithIFrame(
		(await getImagelessCollection()).Collection,
		() => { // initResult
			return '<html>\n<body>\n';
		},
		(iFrameDocument) => { // onFrameLoad
			return iFrameDocument.querySelectorAll('div.col-md-4.col-sm-4 img')[0];
		},
		(scrapedResult) => { // onFrameReturn
			let link = scrapedResult.getAttribute('src');
			link = getAbsolutePath(link);
			link = link.replaceAll('thumbnails/swatches/', '');
			link = link.replaceAll('thumbnails/', '');
			return link;
		},
		(result, scrapedResult) => { // aggregateItem
			return result + '<img src="' + scrapedResult + '">\n';
		},
		async (count, result) => { // onEnd
			result = result + '</body>\n</html>';

			let msg = 'None found!';
			if (count > 0) {
				GM_setClipboard(result);
				msg = count + ' found and copied!';
			}
			if (Toast.CONFIG_TOAST_POPUPS) await Toast.enqueue(msg);
		}
	);
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
	await scrapeCollectionWithIFrame(
		await getCollection(),
		async () => { // initResult
			return await getImagelessCollection();
		},
		(iFrameDocument) => { // itemOnLoad
			return getImagelessCollection(iFrameDocument);
		},
		(scrapedResult) => { // itemOnReturn
			return scrapedResult.Collection;
		},
		(result, scrapedResult) => { // aggregateItem
			Array.prototype.push.apply(result, scrapedResult);

			// SLEEP - THIS IS BAD, I KNOW.
			let start = new Date().getTime();
			for (let i = 0; i < 1e7; i++) {
				if ((new Date().getTime() - start) > 1000) {
					break;
				}
			}

			return result;
		},
		async (count, result) => { // onEnd
			let formatResult = formatImageless(result);

			let msg = 'None found!';
			if (formatResult.Count > 0) {
				GM_setClipboard(formatResult.Output);
				msg = formatResult.Count + ' found and copied!';
			}
			if (Toast.CONFIG_TOAST_POPUPS) await Toast.enqueue(msg);
		}
	);
}

/***********************************************
 * Collection Sorting & Filtering
 ***********************************************/
function getItemContainer() {
	return document.querySelector('div#Gallery');
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
	productCode = decodeURI(productCode);
	productCode = productCode.replace(/prod-id-/g, '');
	productCode = ss_decode(productCode);
	return productCode;
}

function testFilterAgainst(item) {
	return item.querySelector('.galleryName')?.innerText;
}

function addFilterMatchStyle(item) {
	let elem = item.querySelector('h2.galleryName');
	if (elem) elem.style.boxShadow = 'green inset 0 25px 5px -20px';
}

function removeFilterMatchStyle(item) {
	let elem = item.querySelector('h2.galleryName');
	if (elem) elem.style.boxShadow = '';
}

addSortBy('Stock', (item) => stockIndicatorToSortable(item.querySelector('div.stockIndicator')?.innerText));

function stockIndicatorToSortable(stock) {
	if (!stock) return 0;
	if (stock.indexOf('In Stock') >= 0) {
		let tempStr = stock.substring(0, stock.indexOf(' '));
		let tempNum = parseInt(tempStr);
		return !isNaN(tempNum) ? tempNum : 1;
	}
	if (stock.indexOf('On Backorder') >= 0)
		return -1;
	if (stock.indexOf('Indent Only') >= 0)
		return -1;
	if (stock.indexOf('On Order With Supplier') >= 0)
		return 0;
	return 0;
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

function lazyLoadThumbImages(event) {
	let currentItem = event.currentTarget;
	let imgElement = currentItem.querySelector('img.swatch-product-img');
	if (imgElement.src === getAbsolutePath('-')) {
		//if (DEBUG) console.log('mouseOver Success! Lazy updated: ', imgElement.getAttribute('thumbImage'));
		imgElement.src = imgElement.getAttribute('thumbImage');
		currentItem.removeEventListener('mouseover', lazyLoadThumbImages);
	}
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