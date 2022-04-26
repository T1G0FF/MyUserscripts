// ==UserScript==
// @name         OpenFright - Consignment Link
// @namespace    http://www.tgoff.me/
// @version      2022.04.22.1
// @description  Adds a link to the Consignment page from the tracking window and visa versa
// @author       www.tgoff.me
// @match        *://app.openfreight.com.au/track/*
// @match        *://app.openfreight.com.au/consign/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=openfreight.com.au
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
	'use strict';
	var observer = new MutationObserver(function (mutations, observer) {
		// 'mutations' is an array of mutations that occurred
		// 'observer' is the MutationObserver instance
		mutations.forEach((record) => {
			record.addedNodes.forEach((element) => {
				if (!(element instanceof Element)) {
					//let type = Object.prototype.toString.call(element);
					//console.log(type);
					return;
				} else {
					let modalParent = element.closest('div#trackTraceMainResultsModal');
					if (modalParent) {
						let header = modalParent.querySelector('h3.panel-title');
						if (!header || header?.querySelector('#connLink')) return;

						let href = window.location.href;
						href = href.replace('/track/', '/consign/');

						let span = document.createElement('span');
						span.innerText = ' | ';
						let link = document.createElement('a');
						link.id = 'connLink';
						link.innerText = 'Consignment';
						link.href = href;
						span.appendChild(link);

						header.insertAdjacentElement('beforeEnd', span);
						observer.disconnect();
					}

					let selector = 'span#existingConsignmentNotificationConsignmentNumber';
					let alertParent = (element.matches(selector) ? element : null)?.closest('.alert');
					if (alertParent) {
						if (document.querySelector('ul.nav.navbar-nav #trackLink')) return;

						let href = window.location.href;
						href = href.replace('/consign/', '/track/');
						createNewNavBarItem('trackLink', 'Tracking', href, 'Open Tracking for current Consignment');
						observer.disconnect();
					}
				}
			});
		});
	});

	// Start observing
	observer.observe(document, {
		childList: true,
		subtree: true
	});
})();

function createNewNavBarItem(id, text, href, description) {
	let navBar = document.querySelector('ul.nav.navbar-nav:not(.navbar-right)');
	let existingNavBarItem = navBar?.querySelector('li:not(.active)');
	if (existingNavBarItem) {
		let newNavBarItem = existingNavBarItem.cloneNode(true);
		newNavBarItem.id = id;

		let newNavBarItemLink = newNavBarItem.querySelector('a');
		newNavBarItemLink.className = 'openfreightQuote';
		newNavBarItemLink.title = description;
		newNavBarItemLink.dataset.originalTitle = description;
		newNavBarItemLink.href = href;

		let newNavBarItemSpan = newNavBarItemLink.querySelector('span');
		newNavBarItemSpan.innerText = text;

		navBar.appendChild(newNavBarItem);
	}
}