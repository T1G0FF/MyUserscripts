// ==UserScript==
// @name         Constant Contact Fontsize Adder
// @namespace    http://www.tgoff.me/
// @version      2021.08.16.1
// @description  Adds some intermediate font sizes.
// @author       www.tgoff.me
// @match        *://em-ui.constantcontact.com/em-ui/em/page/em-ui/email
// @icon         https://www.google.com/s2/favicons?domain=constantcontact.com
// @run-at       document-idle
// @grant        none
// ==/UserScript==

function waitForElement(elementId, callBack) {
	window.setTimeout(function () {
		var element = document.getElementById(elementId);
		if (element) {
			callBack(elementId, element);
		} else {
			waitForElement(elementId, callBack);
		}
	}, 500)
}

function waitForQuery(query, callBack) {
	window.setTimeout(function () {
		var elements = document.querySelectorAll(query);
		if (elements.length > 0) {
			callBack(query, elements);
		} else {
			waitForQuery(query, callBack);
		}
	}, 500)
}

function waitForNotQuery(query, callBack) {
	window.setTimeout(function () {
		var elements = document.querySelectorAll(query);
		if (elements.length == 0) {
			callBack(query, elements);
		} else {
			waitForNotQuery(query, callBack);
		}
	}, 500)
}

const DEBUG = true;

(function () {
	'use strict';
	waitForQuery('body.galileo-loading', function () {
		waitForNotQuery('body.galileo-loading', function () {
			addFontSizes();
			console.info('Added some intermediate font sizes');
		});
	});
})();

function addFontSizes() {
	let sizesToAdd = [13, 15, 17, 19, 21, 23, 25, 27, 29, 30, 32, 38, 40, 50, 55, 60, 65, 70, 75];

	let fontSizesMenu = document.querySelector('div.galileo-text-toolbar div#fontsize-dropdown-btn-group ul.dropdown-menu');
	let fontSizes = fontSizesMenu.querySelectorAll('li');
	for (let itemIndex in fontSizes) {
		if (fontSizes.hasOwnProperty(itemIndex)) {
			let item = fontSizes[itemIndex];
			if (DEBUG) console.log('Item : ' + itemIndex);
			let lastIndex = sizesToAdd.length - 1;
			for (let sizeIndex = 0; sizeIndex < lastIndex; sizeIndex++) {
				if (sizesToAdd.hasOwnProperty(sizeIndex)) {
					let testAgainst = Number(item.querySelector('a').innerText);
					let size = sizesToAdd[sizeIndex];
					if (DEBUG) console.log('[' + size + ' : ' + testAgainst + ']' + (testAgainst > size ? ' Added!' : ''));
					if (testAgainst > size) {
						let listItem = createFontSizeElement(size);
						item.insertAdjacentElement('beforeBegin', listItem);
						// Remove added size
						sizesToAdd.splice(sizeIndex, 1);
						// Start from the beginning again, the for loop will increment this to 0
						sizeIndex = -1;
					} else {
						break;
					}
				}
			}
		}
	}

	if (sizesToAdd.length > 0) {
		let lastIndex = sizesToAdd.length - 1;
		for (let sizeIndex = 0; sizeIndex < lastIndex; sizeIndex++) {
			let size = sizesToAdd[sizeIndex];
			let listItem = createFontSizeElement(size);
			fontSizesMenu.insertAdjacentElement('beforeEnd', listItem);
			if (DEBUG) console.log('[' + size + ' : End] Added!');
		}
	}
}

function createFontSizeElement(size) {
	let listItem = document.createElement('li');
	let link = document.createElement('a');
	link.setAttribute('href', '#');
	link.setAttribute('data-val', size + 'px');
	link.innerText = size.toString();
	listItem.insertAdjacentElement('beforeEnd', link);
	return listItem;
}