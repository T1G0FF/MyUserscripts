// ==UserScript==
// @name         OpenFreight - Consignment Link
// @namespace    http://www.tgoff.me/
// @version      2022.12.19.1
// @description  Adds a links to the Consignment page from the tracking window and visa versa
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
				if (!(element instanceof Element)) return;
				
				// Tracking modal
				let modalParent = element.closest('div#trackTraceMainResultsModal');
				tryAddFunctionLinkToModalHeader(
					modalParent, 'connLink', 'Find Consignment',
					function () {
						let localHeader = document.querySelector('div#trackTraceMainResultsModal h3.panel-title');
						let connNumber = localHeader?.innerText.replace(localHeader.querySelector('span')?.innerText, '');
						$(".modal").modal("hide");
						searchConsignments(false, connNumber);
						return false;
					});


				// Enquiry modal
				modalParent = element.closest('div#trackTraceEnquiryModal');
				let connNumElem = document.querySelector('div#trackTraceEnquiryModal span.trackTraceEnquiryModalEnquiryDetailsConsignment');
				let postCodeElem = document.querySelector('div#trackTraceEnquiryModal span.trackTraceEnquiryModalReceiverDetailsPostcode');
				tryAddFunctionLinkToModalHeader(
					modalParent, 'enquiryTrackLink', 'Tracking',
					function () {
						let connNumber = connNumElem?.innerText;
						$(".modal").modal("hide");
						trackTraceBuildTrackingResultsModal([connNumber], undefined, undefined, false);
						return false;
					});
				tryAddFunctionLinkToModalHeader(
					modalParent, 'enquiryConnLink', 'Find Consignment',
					function () {
						let connNumber = connNumElem?.innerText;
						$(".modal").modal("hide");
						searchConsignments(false, connNumber);
						return false;
					});
				if (connNumElem.innerText.startsWith('VICNAT')) {
					tryAddLinkToModalHeader(
						modalParent, 'enquiryTFMTrackLink', 'TFM Tracking',
						'https://www.ezyfms.com/tfm/Tracker.asp?CN=' + connNumElem.innerText + '&PC=' + postCodeElem.innerText);
				}


				// Consignment modal
				let selector = 'span#existingConsignmentNotificationConsignmentNumber';
				let alertParent = (element.matches(selector) ? element : null)?.closest('.alert');
				if (alertParent) {
					if (document.querySelector('ul.nav.navbar-nav #trackLink')) return;

					let href = window.location.href;
					href = href.replace('/consign/', '/track/');
					createNewNavBarItem('trackLink', 'Go to Tracking', href, 'Open Tracking for current Consignment');
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

function tryAddFunctionLinkToModalHeader(modalParent, linkId, linkText = 'Search', onClick) {
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

function tryAddLinkToModalHeader(modalParent, linkId, linkText = 'Search', href) {
	if (!modalParent) return;
	let header = modalParent.querySelector('h3.panel-title');
	if (!header || header?.querySelector('#' + linkId)) return;

	let span = document.createElement('span');
	span.innerText = ' | ';
	let link = document.createElement('a');
	link.id = linkId;
	link.innerText = linkText;
	link.href = href;
	link.target = '_blank';
	link.rel = 'noopener noreferrer';
	span.appendChild(link);

	header.insertAdjacentElement('beforeEnd', span);
}