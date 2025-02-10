// ==UserScript==
// @name         Constant Contact Date Fix
// @namespace    http://www.tgoff.me/
// @version      2025.02.10.1
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
	let timeElems = document.querySelectorAll('select[data-qe-id^="schedule-time"]');
	let localeDate = dateElem?.parentElement.querySelector('span.localeDate');

	if (dateElem) {
		if (!localeDate) {
			if (DEBUG) console.log('Date Fixer initialised!');
			let elem = document.createElement('span');
			elem.classList.add('localeDate');
			dateElem.insertAdjacentElement('afterend', elem);

			dateElem.addEventListener('blur', (event) => {
				updateDate();
			}, false);
			dateElem.addEventListener('change', (event) => {
				updateDate();
			}, false);

			if (timeElems && timeElems.length > 0) {
				timeElems.forEach((elem) => {
					elem.addEventListener('change', (event) => {
						updateDate();
					}, false);
				});
			}
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
	let timeElems = document.querySelectorAll('select[data-qe-id^="schedule-time"]');
	let localeDate = dateElem?.parentElement.querySelector('span.localeDate');

	if (dateElem && localeDate) {
		let timeValue = 0;
		if (timeElems && timeElems.length > 0) {
			let mrdnElem = document.querySelector('select[data-qe-id^="schedule-time"][name="meridian"]');
			let mrdn = mrdnElem?.options[mrdnElem.selectedIndex].value;
			let hourElem = document.querySelector('select[data-qe-id^="schedule-time"][name="hour"]');
			let hour = hourElem?.options[hourElem.selectedIndex].value;
			hour = '' + ((parseInt(hour) + (mrdn === 'PM' ? 12 : 0)) % 24);
			let minsElem = document.querySelector('select[data-qe-id^="schedule-time"][name="minute"]');
			let mins = minsElem?.options[minsElem.selectedIndex].value;

			let timeString = '1970-01-01T' + hour.padStart(2, '0') + ':' + mins.padStart(2, '0') + ':00Z';
			timeValue = new Date(timeString).valueOf();
		}

		let date = new Date(new Date(dateElem.value).valueOf() + timeValue);
		let locale = (navigator.languages?.[0] ?? navigator.language) || 'en';

		let dateFormatter = new Intl.DateTimeFormat(locale, {
			weekday: 'short',
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		});
		let timeFormatter = new Intl.DateTimeFormat(locale, {
			timeStyle: 'short'
		});
		let timeZone = date.toLocaleDateString(locale, { day: '2-digit', timeZoneName: 'short' }).substring(4);
		let dateString = dateFormatter.format(date) + ' @ ' + timeFormatter.format(date) + ' ' + timeZone;

		localeDate.innerText = locale + ' Date: ' + dateString;
	}
}