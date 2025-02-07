// ==UserScript==
// @name         Constant Contact Date Fix
// @namespace    http://www.tgoff.me/
// @version      2025.02.07.2
// @description  Adds an automatically updating label underneath the datepicker with the date in a locale accurate format.
// @author       www.tgoff.me
// @match        https://app.constantcontact.com/pages/campaigns/email
// @icon         https://www.google.com/s2/favicons?sz=64&domain=constantcontact.com
// @grant        none
// @run-at       document-end
// ==/UserScript==

let DEBUG = false;
(function () {
	'use strict';
	createMutationObserver(fixDates, fixDates);
})();

function createMutationObserver(addedCallback, removedCallback) {
	if (!addedCallback && !removedCallback) return;

	var observer = new MutationObserver(function (mutations, observer) {
		// 'mutations' is an array of mutations that occurred
		// 'observer' is the MutationObserver instance
		mutations.forEach((record) => {
			record.addedNodes.forEach((element) => {
				if (!(element instanceof Element)) return;

				if (addedCallback) setTimeout(function () { addedCallback(element); }, 250);
			});
			record.removedNodes.forEach((element) => {
				if (!(element instanceof Element)) return;

				if (removedCallback) setTimeout(function () { removedCallback(element); }, 250);
			});
		});
	});

	// Start observing
	observer.observe(document, {
		childList: true,
		subtree: true
	});
}

function initFieldFinder() {
	let dateElem = document.querySelector('input.date-picker-input');
	let localeDate = dateElem?.parentElement.querySelector('span.localeDate');

	if (dateElem) {
		if (!localeDate) {
			if (DEBUG) console.log('Date Fixer initialised!');
			let elem = document.createElement('span');
			elem.classList.add('localeDate');
			dateElem.insertAdjacentElement('afterend', elem);

			dateElem.onblur += (event) => {
				updateDate();
			};
			dateElem.onchange += (event) => {
				updateDate();
			};
		}
		updateDate();
	}
}

function fixDates(element) {
	if (!(element instanceof Element)) {
		let type = Object.prototype.toString.call(element);
		console.log(type);
		return;
	}

	if (element.querySelector('input.date-picker-input')) {
		if (document.body.contains(element)) {
			if (DEBUG) console.log('Date TextBox was inserted!');
			initFieldFinder();
		}
		else {
			if (DEBUG) console.log('Date TextBox was removed!');
			updateDate();
		}
	}
	else if (element.querySelector('div.react-datepicker.date-picker')) {
		if (document.body.contains(element)) {
			if (DEBUG) console.log('Date Picker was inserted!');
		}
		else {
			if (DEBUG) console.log('Date Picker was removed!');
			updateDate();
		}
	}
}

function updateDate() {
	let dateElem = document.querySelector('input.date-picker-input');
	let localeDate = dateElem?.parentElement.querySelector('span.localeDate');

	if (dateElem && localeDate) {
		let date = new Date(dateElem.value);
		let locale = (navigator.languages?.[0] ?? navigator.language) || 'en';
		let weekday = date.toLocaleString(locale, {
			weekday: 'short'
		});
		localeDate.innerText = locale + ' Date: ' + weekday + ' ' + date.toLocaleDateString(locale);
	}
}