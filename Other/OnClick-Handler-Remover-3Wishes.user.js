// ==UserScript==
// @name         # 3 Wishes - OnClick Handler Remover
// @namespace    http://www.tgoff.me/
// @version      2023.03.21.2
// @description  Replaces the onclick handler with a regular link on 3 Wishes Collections
// @author       www.tgoff.me
// @match        *://fabriceditions.com/shop/*
// @match        *://*.fabriceditions.com/shop/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=fabriceditions.com
// @grant        none
// @run-at       document-idle
// ==/UserScript==

/*
The devs, in all their wisdom use this as a click handler on the items:
	function handleCItemClick(url) {
		window.location = url;
	}
Which means you can't open them in a new tab or window with middle click or ctrl+click.
I encase the item in a link element using the url specified in said handler, then remove the handler.
*/

let linkRegex = /(?:handleCItemClick\()['"]?(.*)['"]?(?:\);)/g;
(function() {
	'use strict';
	console.log('Begin click handlers removal');
	setTimeout(function() {
		removeOnClickHandlers();
		console.log('Click handlers removed!');
	}, 1000);
})();

function removeOnClickHandlers() {
	let items = document.querySelectorAll('div[onclick*="handleCItemClick"]');
	for (const item of items) {
		linkRegex.lastIndex = 0;
		let children = item.children;
		let matches = linkRegex.exec(item.onclick.toString());
		if (matches && matches.length > 1) {
			let linkElem = document.createElement('a');
			linkElem.href = matches[1];
			linkElem.replaceChildren(...children);
			item.insertAdjacentElement('afterBegin', linkElem);
			item.onclick = undefined;
		} else {
			//console.log('No children found: ' + item.onclick.toString());
		}
	}
}