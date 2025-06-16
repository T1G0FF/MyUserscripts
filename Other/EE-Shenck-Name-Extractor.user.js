// ==UserScript==
// @name         # EE Schenck - Nani Iro
// @namespace    http://www.tgoff.me/
// @version      2019.03.19.1
// @description  Adds a button to copy Nani Iro codes and names
// @author       www.tgoff.me
// @match        *://eeschenck.com/fabric/nani-iro/vendor/kokka/show/*
// @match        *://*.eeschenck.com/fabric/nani-iro/vendor/kokka/show/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=eeschenck.com
// @grant        GM_setClipboard
// @run-at       document-idle
// ==/UserScript==

(function () {
	'use strict';
	addButton();
})();

function addButton() {
	let titleElement = document.querySelector('.page-title.category-title');
	if (titleElement) {
		let imgButton = document.createElement('button');
		imgButton.innerText = 'Get New';
		imgButton.style.marginLeft = '12px';
		imgButton.classList.add('btn');
		imgButton.classList.add('btn-info');
		imgButton.onclick = getNewItems;

		titleElement.insertAdjacentElement('beforeEnd', imgButton);
	}
}

function getNewItems() {
	let allItems = document.querySelectorAll('.products-grid .item');
	let result = '';
	allItems.forEach((currentValue) => {
		if (currentValue.querySelector('span.new')) {
			let code = currentValue.querySelector('.info-link .product-sku').innerText;
			let name = currentValue.querySelector('.info-link .product-name span').innerText;
			result += code + '\t' + name + '\n';
		}
	});
	GM_setClipboard(result);
}