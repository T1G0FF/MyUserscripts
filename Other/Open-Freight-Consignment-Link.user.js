// ==UserScript==
// @name         OpenFreight - Consignment Link
// @namespace    http://www.tgoff.me/
// @version      2022.04.26.1
// @description  Adds a link to the Consignment page from the tracking window and visa versa
// @author       www.tgoff.me
// @match        *://app.openfreight.com.au/track
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
					// Tracking modal
					tryAddLinkToModalHeader(
						element.closest('div#trackTraceMainResultsModal'), 'connLink', 'Find Consignment',
						function () {
							let localHeader = document.querySelector('div#trackTraceMainResultsModal h3.panel-title');
							let connNumber = localHeader?.innerText.replace(localHeader.querySelector('span')?.innerText, '');
							$(".modal").modal("hide");
							searchConsignments(false, connNumber);
							return false;
						});

					// Enquiry modal
					tryAddLinkToModalHeader(
						element.closest('div#trackTraceEnquiryModal'), 'enquiryLink', 'Tracking',
						function () {
							let connNumber = document.querySelector('div#trackTraceEnquiryModal span.trackTraceEnquiryModalEnquiryDetailsConsignment')?.innerText;
							$(".modal").modal("hide");
							trackTraceBuildTrackingResultsModal([connNumber], undefined, undefined, false);
							return false;
						});


					// Consignment modal
					let selector = 'span#existingConsignmentNotificationConsignmentNumber';
					let alertParent = (element.matches(selector) ? element : null)?.closest('.alert');
					if (alertParent) {
						if (document.querySelector('ul.nav.navbar-nav #trackLink')) return;

						let href = window.location.href;
						href = href.replace('/consign/', '/track/');
						createNewNavBarItem('trackLink', 'Go to Tracking', href, 'Open Tracking for current Consignment');
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

function tryAddLinkToModalHeader(modalParent, linkId, linkText = 'Search', onClick) {
	if (!modalParent) return;
	let header = modalParent.querySelector('h3.panel-title');
	if (!header || header?.querySelector('#' + linkId)) return;

	let span = document.createElement('span');
	span.innerText = ' | ';
	let link = document.createElement('a');
	link.id = linkId;
	link.innerText = linkText;
	link.href = '#';
	link.onclick = onClick;
	span.appendChild(link);

	header.insertAdjacentElement('beforeEnd', span);
}