// ==UserScript==
// @name         Constant Contact Campaign Page
// @namespace    http://www.tgoff.me/
// @version      2025.05.29.1
// @description  Adds larger per page count to select menu and allows copying of campaign data to clipboard.
// @author       www.tgoff.me
// @match        https://app.constantcontact.com/pages/campaigns/email-hub
// @match        https://app.constantcontact.com/pages/campaigns/view/list
// @icon         https://www.google.com/s2/favicons?sz=64&domain=constantcontact.com
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/tg-lib.js
// @run-at       document-end
// @grant        GM_setClipboard
// ==/UserScript==

var MAX_PER_PAGE = 200; // Hardcoded limit by CC website
var IS_EMAIL_HUB = false;

(function () {
	'use strict';

	IS_EMAIL_HUB = window.location.href.includes('email-hub');

	let morePerPageTimer = setInterval(function () {
		console.log('MSG: Attempt add MorePerPage');
		let perPageElem = IS_EMAIL_HUB
			? document.querySelector('select[data-qe-id*="selectPageSize"')
			: document.querySelector('select[data-qe-id*="campaign-pagination-bar-select-page-size"');
		if (perPageElem) {
			addMorePerPage();

			clearInterval(morePerPageTimer);
			morePerPageTimer = null;
			console.log('MSG: Add MorePerPage successful!');
		}
	}, 500);

	let copyToJsonTimer = setInterval(function () {
		console.log('MSG: Attempt add CopyToJson');
		let btnLocationElem = document.querySelector('div.header-bar div.header-bar-section');
		if (btnLocationElem) {
			addCopyPageToJsonButton(btnLocationElem);

			clearInterval(copyToJsonTimer);
			copyToJsonTimer = null;
			console.log('MSG: Add CopyToJson successful!');
		}
	}, 500);
})();

function addMorePerPage() {
	let perPageElem = IS_EMAIL_HUB
		? document.querySelector('select[data-qe-id*="selectPageSize"')
		: document.querySelector('select[data-qe-id*="campaign-pagination-bar-select-page-size"');
	if (perPageElem) {
		let optElem = perPageElem.querySelector('option').cloneNode(true);
		optElem.value = MAX_PER_PAGE;
		optElem.innerText = optElem.innerText.replace('10', MAX_PER_PAGE);
		perPageElem.insertAdjacentElement('beforeEnd', optElem);
	}
}

function addCopyPageToJsonButton(btnLocationElem) {
	let newButton = document.createElement('button');
	newButton.innerText = 'Copy JSON';
	newButton.type = 'button';
	newButton.classList.add('btn');
	newButton.classList.add('btn-pill');
	newButton.classList.add('btn-tertiary');
	let btnFunc = (event) => { copyToJson(event); };
	newButton.onclick = btnFunc;

	btnLocationElem.insertAdjacentElement('beforeEnd', newButton);
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