// ==UserScript==
// @name         # Graphic Impressions - OnClick Handler Remover
// @namespace    http://www.tgoff.me/
// @version      2023.09.26.1
// @description  Removes the onclick handler on Graphic Impressions products
// @author       www.tgoff.me
// @match        *://uquilt.com/*
// @match        *://*.uquilt.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=uquilt.com
// @grant        none
// @run-at       document-idle
// ==/UserScript==

let linkRegex = /(?:handleCItemClick\()['"]?(.*)['"]?(?:\);)/g;
(function () {
	'use strict';
	setTimeout(function () {
		removeOnClickHandlers();
		console.log('Click handlers removed!');
	}, 1000);
})();

function removeOnClickHandlers() {
	let items = document.querySelectorAll('div.productDiv');
	for (const item of items) {
		item.removeAttribute('onclick');
		item.onclick = undefined;
		item.style.cursor = 'unset';
	}
}