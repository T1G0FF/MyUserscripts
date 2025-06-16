// ==UserScript==
// @name         # Dannells - Image Extractor
// @namespace    http://www.tgoff.me/
// @version      2023.03.21.1
// @description  Gets the images from a Dannells Item
// @author       www.tgoff.me
// @match        *://dannells.com/*
// @match        *://*.dannells.com/*
// @icon         https://www.google.com/s2/favicons?domain=dannells.com
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/tg-lib.js
// @grant        GM_setClipboard
// @grant        GM_download
// @run-at       document-idle
// ==/UserScript==

(async function () {
	'use strict';
	createButton('Copy HTML', copyImageLinks, getTitleElement());
})();

function createButton(text, func, element, location = 'beforeEnd') {
	if (!element) return;
	let newButton = document.createElement('button');
	newButton.innerText = text;
	newButton.classList.add('tg-dropdown-option');
	newButton.onclick = function () { func(); };
	element.insertAdjacentElement(location, newButton);
}

function copyImageLinks() {
	let imageElements = document.querySelectorAll('div.product-page__images a[id*="PRODUCTIMAGE"]');
	let result = getImageLinks(imageElements);

	let msg = 'None found!';
	if (result.count > 0) {
		GM_setClipboard(result.info);
		msg = result.count + ' found and copied!';
	}
	Notify.log(msg);
}

function getTitleElement() {
	let element = document.querySelector('h1.product-page__heading');
	return element;
}

function getTitle() {
	let element = getTitleElement();
	let nameElement = element?.querySelector('span[itemprop*="name"]');
	if (!element || !nameElement) {
		Notify.log('No title for Item!');
		return;
	}
	return nameElement.innerText;
}

function getImageLinks(collection) {
	let imageHtml = '<html>\n<body>\n<hr><h1>' + getTitle() + '</h1>\n';
	let count = 0;
	for (let item in collection) {
		let currentItem = collection[item];
		if (collection.hasOwnProperty(item)) {
			let givenURLs = currentItem.getAttribute('href');
			if (Array.isArray(givenURLs)) {
				for (const key in givenURLs) {
					if (givenURLs.hasOwnProperty(key)) {
						const givenURL = givenURLs[key];
						imageHtml = imageHtml + '<img src="' + givenURL + '">\n';
					}
				}
			} else {
				imageHtml = imageHtml + '<img src="' + givenURLs + '">\n';
			}
			count++;
		}
	}
	imageHtml = imageHtml + '</body>\n</html>';
	imageHtml = imageHtml.trim() + '\n'

	return { info: imageHtml, count: count };
}