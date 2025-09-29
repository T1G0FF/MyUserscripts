// ==UserScript==
// @name         # Constant Contact - Enhancements
// @namespace    http://www.tgoff.me/
// @version      2025.07.03.1
// @description  Adds larger per page count to select menu and allows copying of campaign data to clipboard & Adds an automatically updating label underneath the datepicker with the date in a locale accurate format.
// @author       www.tgoff.me
// @match        https://app.constantcontact.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=constantcontact.com
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/tg-lib.js
// @grant        GM_setClipboard
// @run-at       document-end
// ==/UserScript==

const DEBUG = false;
const MAX_PER_PAGE = 200; // Hardcoded limit by CC website

function createMutationObserver(addedCallback, removedCallback) {
	if (!addedCallback && !removedCallback) return;

	var observer = new MutationObserver(function (mutations, _observer) {
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

function createCallbackTimer(callback, selector, timeout = 500) {
	let thisTimer = setInterval(function () {
		let selectedElem = document.querySelector(selector);
		if (selectedElem) {
			callback(selectedElem);

			clearInterval(thisTimer);
			thisTimer = null;
		}
	}, timeout);
}

(function () {
	'use strict';
	if (window.location.href.includes('campaigns/email-hub')) {
		createCallbackTimer(addMorePerPage, 'select[data-qe-id*="selectPageSize"');
		createCallbackTimer(addCopyPageToJsonButton, 'div.header-bar div.header-bar-section');
	}
	else if (window.location.href.includes('campaigns/view/list')) {
		createCallbackTimer(addMorePerPage, 'select[data-qe-id*="campaign-pagination-bar-select-page-size"');
		createCallbackTimer(addCopyPageToJsonButton, 'div.header-bar div.header-bar-section');
	}
	else if (window.location.href.includes('campaigns/email')) {
		createMutationObserver(mutationSwitch, mutationSwitch);
	}
})();

function mutationSwitch(element) {
	if (!(element instanceof Element)) {
		let type = Object.prototype.toString.call(element);
		console.log(type);
		return;
	}

	if (element.querySelector('input.date-picker-input')) {
		if (document.body.contains(element)) {
			if (DEBUG) console.log('MSG: Date TextBox was inserted!');
			addLocaleDateElem();
		}
		else {
			if (DEBUG) console.log('MSG: Date TextBox was removed!');
			updateDate();
		}
	}
	else if (element.querySelector('div.react-datepicker.date-picker')) {
		if (document.body.contains(element)) {
			if (DEBUG) console.log('MSG: Date Picker was inserted!');
		}
		else {
			if (DEBUG) console.log('MSG: Date Picker was removed!');
			updateDate();
		}
	}
}

function addMorePerPage(perPageElem) {
	if (DEBUG) console.log('MSG: Attempt add MorePerPage');
	if (perPageElem) {
		let optElem = perPageElem.querySelector('option');

		for (const count of [100, MAX_PER_PAGE]) {
			let newOptElem = optElem.cloneNode(true);
			newOptElem.value = count;
			newOptElem.innerText = newOptElem.innerText.replace('10', count);
			perPageElem.insertAdjacentElement('beforeEnd', newOptElem);
		}
		if (DEBUG) console.log('MSG: Add MorePerPage successful!');
	}
}

function addCopyPageToJsonButton(btnLocationElem) {
	if (DEBUG) console.log('MSG: Attempt add CopyToJson');
	if (btnLocationElem) {
		let newButton = document.createElement('button');
		newButton.innerText = 'Copy JSON';
		newButton.type = 'button';
		newButton.classList.add('btn');
		newButton.classList.add('btn-pill');
		newButton.classList.add('btn-tertiary');
		let btnFunc = (event) => { copyToJson(event); };
		newButton.onclick = btnFunc;

		btnLocationElem.insertAdjacentElement('beforeEnd', newButton);
		if (DEBUG) console.log('MSG: Add CopyToJson successful!');
	}
}

async function copyToJson() {
	let fullResult = [];

	let campaigns = document.querySelectorAll('div.campaign-unit-table div.campaign-unit');
	let count = campaigns.length;

	campaigns.forEach(elem => {
		if (elem.querySelector('span.tag-success')) {
			var result = {};
			var campaignName = elem.querySelector('h5.artifact-nameplate-heading span[data-qe-id="campaignName"]').getAttribute('aria-label');
			result['campaignName'] = campaignName;

			var campaignDate = elem.querySelector('div.artifact-nameplate-details span[data-qe-id="campaign-unit-date"]').innerText;
			result['campaignDate'] = campaignDate;

			var metrics = elem.querySelectorAll('ul.metric-list > li.metric-list-item')
			for (const metric of metrics) {
				let metricName = metric.getAttribute('data-qe-id');
				metricName = metricName.replace('reportstat-metric_', '');
				let figure = metric.querySelector('span.metric-list-item-figure').innerText;
				result[metricName] = figure;
			}
			fullResult.push(result);
		}
	});

	let msg = 'None found!';
	if (count > 0) {
		GM_setClipboard(JSON.stringify(fullResult));
		msg = count + ' found and copied!';
	}
	if (Toast.CONFIG_TOAST_POPUPS) await Toast.enqueue(msg);
}

function addLocaleDateElem() {
	let dateElem = document.querySelector('input.date-picker-input');
	let timeElems = document.querySelectorAll('select[data-qe-id^="schedule-time"]');
	let localeDate = dateElem?.parentElement.querySelector('span.localeDate');

	if (dateElem) {
		if (!localeDate) {
			if (DEBUG) console.log('MSG: Date Fixer initialised!');
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