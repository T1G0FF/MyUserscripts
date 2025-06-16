// ==UserScript==
// @name         # Stof - File Download Name Extractor
// @namespace    http://www.tgoff.me/
// @version      2020.09.18.1
// @description  Gets the codes from a Stof File Download.
// @author       www.tgoff.me
// @match        *://ipadphoto.stof.dk:5000/*
// @grant        GM_setClipboard
// @run-at       document-idle
// ==/UserScript==

(function () {
	'use strict';
	createMutationObserver();
})();

function createMutationObserver() {
	var observer = new MutationObserver(function (mutations, observer) {
		// 'mutations' is an array of mutations that occurred
		// 'observer' is the MutationObserver instance
		//console.log(mutations);
		mutations.forEach((record) => {
			if (record.addedNodes && record.addedNodes.length > 0) {
				record.addedNodes.forEach((node) => {
					if (node.matches && node.matches('div.syno-ux-gridpanel-empty-hint')) {
						addCopyCodesOnPageButton();
						// Stop observing
						observer.disconnect();
						console.log('Observer disconnected!');
					}
				});
			}
		});
	});

	// Start observing
	observer.observe(document, {
		childList: true,
		subtree: true
	});
}

function addCopyCodesOnPageButton() {
	let elements = document.querySelectorAll("td.x-toolbar-left tr.x-toolbar-left-row");
	let buttonLocationElement = elements[1];
	if (buttonLocationElement) {
		let imgButton = document.createElement('button');
		imgButton.innerText = 'Copy Codes';
		imgButton.style.marginLeft = '12px';
		imgButton.classList.add('x-btn-text');
		imgButton.onclick = getCodesOnPage;

		buttonLocationElement.insertAdjacentElement('beforeEnd', imgButton);
	}
}

async function getCodesOnPage() {
	let result = '';
	let count = 0;
	let collection = document.querySelectorAll('div[class*="col-filename"]');
	if (collection && collection.length > 0) result += document.querySelector('ul.ux-pathbuttons-strip').innerText.trim() + '\n';
	for (let item in collection) {
		if (collection.hasOwnProperty(item)) {
			let currentItem = collection[item];
			let fileName = currentItem.innerText.trim();
			if (fileName === 'Thumbs.db') continue;
			let productCode = fileName.replace('.jpg', '').replace('-', ' ');
			result += productCode + '\n';
			count++;
		}
	}
	let msg = 'None found!';
	if (count > 0) {
		GM_setClipboard(result);
		msg = count + ' found and copied!';
	}
	console.log(msg);
}