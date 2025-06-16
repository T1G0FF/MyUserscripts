// ==UserScript==
// @name         # Dropbox - OnClick Handler Remover
// @namespace    http://www.tgoff.me/
// @version      2022.09.13.1
// @description  Removes the 'Add to Dropbox' click handler on shared items.
// @author       www.tgoff.me
// @match        *://dropbox.com/share/*
// @match        *://*.dropbox.com/share/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=dropbox.com
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
	'use strict';
	console.log('Begin click handlers removal');
	setTimeout(function () {
		removeOnClickHandlers();
		console.log('Click handlers removed!');
	}, 1000);
})();

function removeOnClickHandlers() {
	let items = document.querySelectorAll('td.filename-col');
	for (const item of items) {
		let linkElem = item.querySelector('a.u-l-b');
		if (linkElem) {
			let children = linkElem.children;
			linkElem.parentElement.replaceChildren(...children);

			let clonedElem = item.cloneNode(true);
			item.parentNode.replaceChild(clonedElem, item);
		}
	}
}