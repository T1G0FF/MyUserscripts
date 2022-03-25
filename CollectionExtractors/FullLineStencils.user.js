// ==UserScript==
// @name         VicText Collection Extractor - Full Line Stencils
// @namespace    http://www.tgoff.me/
// @version      2021.03.09.1
// @description  Gets the names and codes from a Full Line Stencils Collection
// @author       www.tgoff.me
// @match        *://*.fulllinestencil.com/*
// @match        *://fulllinestencil.com/*
// @noframes
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/tg-lib.js
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/collection-extract-lib.js
// @grant        GM_setClipboard
// @grant        GM_download
// @runat        document-idle
// ==/UserScript==

let StencilNameRegex = /^#?([0-9]+) (.+)/;
let RegexEnum = {
	'Code': 1,
	'Description': 2,
};

(function () {
	'use strict';
	createButtons();
})();

function getCompany() {
	let company = 'Hancy Creations';
	return company;
}

function getTitleElement() {
	let titleElement = document.querySelector('div#TGTitleElement');//'div.category-view-move');
	if (!titleElement) {
		let titleContainerElement = document.createElement('div');
		titleContainerElement.id = 'TGTitleElement';
		let titleHeadingElement = document.createElement('h2');

		let getTextElement = document.querySelector('ul.items li.item.category12');
		if (!getTextElement) getTextElement = document.querySelector('ul.items li.item.search');
		let titleText = getTextElement.innerText.replace(/(?:Search results for: ')(.*)'/, '$1');
		titleHeadingElement.innerText = titleText;
		titleContainerElement.insertAdjacentElement('beforeEnd', titleHeadingElement);

		let toolbar = document.querySelector('div.toolbar');
		toolbar.insertAdjacentElement('beforeBegin', titleContainerElement);
		titleElement = titleContainerElement;
	}
	return titleElement;
}

function getCollection() {
	let collection = document.querySelectorAll('ol.product-grid div.product-info.product-item-info');
	return collection;
}

function formatInformation(item) {
	let title = getFormattedTitle();
	let company = getCompany();

	let descElement = item.querySelector('h3.product-name');
	if (!descElement) {
		Notify.log('One or More Elements Not Found!', item);
		return;
	}

	let givenDesc = descElement.innerText.trim();

	let matches = StencilNameRegex.exec(givenDesc);
	if (!matches || matches.length <= 1) {
		Notify.log('No matches found for Item!', item);
		return;
	}

	let itemCode = item.querySelector('span.newlabel') ? 'NEW' : '';
	let barCode = '-';
	let description = matches[RegexEnum.Code] + 'W - ' + matches[RegexEnum.Description] + ' Stencil';
	let webName = matches[RegexEnum.Description] + ' Stencil';
	let webDesc = company + ' ' + matches[RegexEnum.Code];
	let purchaseCode = matches[RegexEnum.Code] + 'W';

	let result = { 'itemCode': itemCode, 'barCode': barCode, 'description': description, 'webName': webName, 'webDesc': webDesc, 'purchaseCode': purchaseCode, 'webCategory': 'Pounce Pads / Stencils' };
	return result;
}

// https://fulllinestencil.com/pub/media/catalog/product/cache/431fc9b000ca6d4905003fb846eec415/6/0/60039w.jpg
// https://fulllinestencil.com/pub/media/catalog/product/cache/dcf97e37e6c1dcd0d1ac696a56ee6fa2/6/0/60039w.jpg

// https://fulllinestencil.com/pub/media/catalog/product/cache/431fc9b000ca6d4905003fb846eec415/6/0/60040w.jpg
// https://fulllinestencil.com/pub/media/catalog/product/cache/dcf97e37e6c1dcd0d1ac696a56ee6fa2/6/0/60040w.jpg
// https://fulllinestencil.com/pub/media/wysiwyg/60032r.jpg

// https://fulllinestencil.com/pub/media/catalog/product/cache/431fc9b000ca6d4905003fb846eec415/5/0/50037w.jpg
// https://fulllinestencil.com/pub/media/catalog/product/cache/dcf97e37e6c1dcd0d1ac696a56ee6fa2/5/0/50037w.jpg
// https://fulllinestencil.com/pub/media/wysiwyg/50037r.jpg
async function formatImage(item) {
	let imgElement = item.querySelector('img.product-image-photo');

	if (!imgElement) {
		Notify.log('One or More Elements Not Found!', item);
		return;
	}

	let links = [];
	let link = imgElement.getAttribute('src');
	link = link.replace('431fc9b000ca6d4905003fb846eec415', 'dcf97e37e6c1dcd0d1ac696a56ee6fa2');
	links.push(link);

	let fileName = getFilename(link);
	link = 'https://fulllinestencil.com/pub/media/wysiwyg/' + fileName.replace('.jpg', '').replace(/[^\d]/, '') + 'r.jpg';
	let valid = await testLinkResolves(link);
	if (valid) {
		links.push(link);
	}

	return links;
}

/*
async function formatImage(item) {
	let result = await scrapeFullSizeImage(item);
	result = result.replace("watermark/", "");
	//result = result.replace("image/", "image/addImg-102/");
	result = result.replace(/(?:\/w-\d+)?(?:\/h-\d+)?/g, "");
	return result;
}

function addScraperIFrame() {
	if(inIframe()) return;
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
		ScraperIFrame.addEventListener("load", function() {
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
*/