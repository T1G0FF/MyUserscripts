// ==UserScript==
// @name         Metricon - Price Getter
// @namespace    http://www.tgoff.me/
// @version      2021.03.23.1
// @description  Gets the prices for the Metricon Home Designs
// @author       www.tgoff.me
// @match        *://metricon.com.au/home-designs/*
// @match        *://*.metricon.com.au/home-designs/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=metricon.com.au
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
	'use strict';
	createMutationObserver();
})();

function createMutationObserver() {
	var observer = new MutationObserver(function (mutations, observer) {
		// 'mutations' is an array of mutations that occurred
		// 'observer' is the MutationObserver instance
		mutations.forEach((record) => {
			console.log(record);
			if (record.target.matches('span.card-grid__inner')) {
				record.addedNodes.forEach((node) => {
					if (Object.prototype.toString.call(node) !== '[object Text]' && node.matches('div.home-design-card')) {
						displayPrice(node);
					}
				});
				// Check if the Load More button got removed
				if (record.removedNodes.length > 0 && record.removedNodes[0].matches('div.load-button')) {
					// Stop observing
					observer.disconnect();
					console.log('Observer disconnected!');
				}
			}
		});
	});

	// Start observing
	observer.observe(document, {
		childList: true,
		subtree: true
	});
}

function displayPrices() {
	let collection = document.querySelectorAll('section#home-designs div.home-design-card');
	for (let index of collection) {
		let design = collection[index]
		displayPrice(design);
	}
}

function displayPrice(design) {
	let titleElement = design.querySelector('div.header h3');
	// Check if we've already added a price;
	if (!titleElement.querySelector('div.prices')) {
		let newDiv = document.createElement('div');
		newDiv.classList.add('prices');
		let value = parseInt(design.getAttribute('filterPrice'));
		newDiv.innerText = '~ $' + value.toLocaleString();
		titleElement.insertAdjacentElement('afterEnd', document.createElement('br'));
		titleElement.insertAdjacentElement('afterEnd', newDiv);
	}
}