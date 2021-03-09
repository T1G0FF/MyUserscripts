// ==UserScript==
// @name         VicText Collection Extractor - Dear Stella - OLD WEBSITE < SEP 2020
// @namespace    http://www.tgoff.me/
// @version      2021.03.09_v1.0.0
// @description  Gets the names and codes from a Dear Stella Collection
// @author       www.tgoff.me
// @match        OUTDATED - *://dearstelladesign.com/store/index.php?route=product/category&path=*
// @match        OUTDATED - *://dearstelladesign.com/store/index.php?route=product/search&filter_name=*
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/tg-lib.js
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/collection-extract-lib.js
// @grant        GM_setClipboard
// @grant        GM_download
// @runat        document-idle
// ==/UserScript==

(function () {
	'use strict';
	createButtons();
})();

function getCompany() {
	let company = 'Dear Stella';
	return company;
}

function getTitleElement() {
	let titleElement = document.querySelector('.entry-title');
	return titleElement;
}

let monthYearRegEx = /(?:(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|(?:Nov|Dec)(?:ember)?)\D?((?:19\d{2}|20\d{2})|\d{2}))/;
let dateRegexEnum = {
	'Month': 1,
	'Year': 2,
};
function getAvailabilityDate() {
	let info = document.querySelector('.category-info');
	if (info) {
		let matches = monthYearRegEx.exec(info.innerText);
		if (!matches || matches.length <= 1) {
			Notify.log('No Date found for Collection!', getFormattedTitle());
		} else {
			return matches[dateRegexEnum.Month] + ' ' + matches[dateRegexEnum.Year];
		}
	}
	return undefined;
}

function getCollection() {
	let collection = document.querySelectorAll('.product-list > li');
	return collection;
}

let dearStellaRegEx = /([A-z])?(STELLA-)([A-z]+)?([0-9]+)/i;
let RegexEnum = {
	'PreStella': 1,
	'Stella': 2,
	'Prefix': 3,
	'ColourCode': 4,
};

function formatInformation(item) {
	let title = getFormattedTitle();
	let company = getCompany();
	let givenName = item.querySelector('hgroup > h4').innerText.toTitleCase();
	let givenColour = fixColourName(item.querySelector('hgroup > h5').innerText);
	let givenCode = item.querySelector('hgroup > h6').innerText.replaceAll('SSTELLA-', 'STELLA-', true);
	let givenCodeColour = (givenCode + ' ' + givenColour).toUpperCase();

	let itemCode = '';
	let barCode = '';
	let purchaseCode = '';
	let material = 'C100%';
	let width = 'W45in';

	let matches = dearStellaRegEx.exec(givenCode);
	if (!matches || matches.length <= 1) {
		Notify.log('No matches found for Item!', item);
		return;
	}

	let colourCode = matches[RegexEnum.ColourCode];

	if (matches[RegexEnum.PreStella]) {
		switch (matches[RegexEnum.PreStella].toUpperCase()) {
			case 'W':
				itemCode = truncateLength(givenCodeColour.replace('WSTELLA-', 'DSW '), 20);
				width = 'W60in';
				break;
		}
	} else {
		itemCode = truncateLength(givenCodeColour.replace('STELLA-', 'DS '), 20);
	}

	if (givenName.toUpperCase().includes('MOONSCAPE')) {
		title = 'Moonscape Basics';
		givenName = 'Moonscape Basics';
	}

	if (givenName.toUpperCase().includes('HEARTS')) {
		title = 'Hearts';
		givenName = 'Hearts';
	}

	if (matches[RegexEnum.Prefix]) {
		switch (matches[RegexEnum.Prefix].toUpperCase()) {
			case 'K':
				if (!givenName.toUpperCase().includes('KNIT')) {
					givenName = givenName + ' Knit';
				}
				material = 'C95% S5%';
				break;
			case 'F':
				if (givenName.toUpperCase().includes('MOONSCAPE')) {
					givenName = givenName.replaceAll('Basics', '').trim();
				}
				if (!givenName.toUpperCase().includes('FLANNEL')) {
					givenName = givenName + ' Flannel';
				}
				break;
			default:
				log('Unknown Prefix found: ' + matches[RegexEnum.Prefix].toUpperCase());
				break;
		}
	}

	barCode = formatBarCode(itemCode);
	purchaseCode = formatPurchaseCode(givenCodeColour.replace('STELLA-', 'S-'));

	let nameString = givenName + ' - ' + title;

	let webName = givenColour.toTitleCase(false) + ' - ' + givenName;
	let webDesc = title + ' - ' + material + ' - ' + width;
	let description = webName + ' - ' + webDesc;

	if (givenName.toUpperCase().includes(title.toUpperCase())) {
		description = givenColour.toTitleCase(false) + ' - ' + givenName + ' - ' + material + ' - ' + width;
	}

	let dates = getReleaseDates(availDate, delDelay);
	let delDate = toDeliveryString(dates);

	let result = { 'itemCode': itemCode, 'barCode': barCode, 'description': description, 'webName': webName, 'webDesc': webDesc, 'delDate': delDate, 'purchaseCode': purchaseCode };
	return result;
}

// http://dearstelladesign.com/store/image/cache/data/Stella-1150-Allure-570x318.jpg
function formatImage(item) {
	let result = item.querySelector('a > div').getAttribute('data-img');
	return result;
}