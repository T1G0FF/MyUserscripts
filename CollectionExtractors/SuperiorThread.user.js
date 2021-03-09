// ==UserScript==
// @name         VicText Collection Extractor - Superior Threads
// @namespace    http://tgoff.me/
// @version      2021.03.09.1
// @description  Gets the names and codes from a Superior Threads Collection
// @author       www.tgoff.me
// @match        *://*.superiorthreads.com/thread/*
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/tg-lib.js
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/collection-extract-lib.js
// @grant        GM_setClipboard
// @grant        GM_download
// @runat        document-idle
// ==/UserScript==

let ThreadRegex = /(.+?) ?#([0-9]+) (.*(?: ((?<!Jumbo )Cone|Spool|Jumbo Cone(?:-8,500 yd)?|\(Size #[0-9]+\)|\(M-style, Dozen\)))|.*)/;
let RegexEnum = {
	'Thread': 1,
	'ColourCode': 2,
	'Description': 3,
	'Type': 4,
};

let sizeLookup = {
	'Spool': '01',
	'Cone': '02',
};

let threadLookup = {
	// BLL01-601
	'The Bottom Line': {
		'prefix': 'BLL',
		'weight': '60W/2Ply',
		'fibre': 'Polyester',
		'length': { 'Cone': '2745m (3000yd)', 'Spool': '1300m (1420yd)' }
	},
	// KTT01-1002
	'King Tut': {
		'prefix': 'KTT',
		'weight': '40W/3Ply',
		'fibre': 'Cotton',
		'length': { 'Cone': '1830m (2000yd)', 'Spool': '458m (500yd)' }
	},
	// SF116-01-503
	'So Fine!': {
		'prefix': 'SF116-',
		'weight': '50W/3Ply',
		'fibre': 'Polyester',
		'length': { 'Cone': '3000m (3280yd)', 'Spool': '500m (550yd)' }
	},
	// MQ146-02-7001
	'MicroQuilter': {
		'prefix': 'MQ146-',
		'weight': '100W/2Ply',
		'fibre': 'Polyester',
		'length': { 'Cone': '2745m (3000yd)', 'Spool': '732m (800yd)' }
	},
	// MP124-02-152
	'MasterPiece': {
		'prefix': 'MP124-',
		'weight': '50W/3Ply',
		'fibre': 'Cotton',
		'length': { 'Cone': '2286m (2500yd)', 'Spool': '550m (600yd)' }
	},
};

(function () {
	'use strict';
	createButtons();
})();

function getCompany() {
	let company = 'Superior Threads';
	return company;
}

function getTitleElement() {
	let titleElement = document.querySelector('div.category-description h1');
	return titleElement;
}

function getCollection() {
	let collection = document.querySelectorAll('div#category-items div.category-item:not(.category-item-flex-fix)');
	return collection;
}

function formatInformation(item) {
	let company = getCompany();

	let descElement = item.querySelector('div.category-item-name');
	if (!descElement) {
		Notify.log('One or More Elements Not Found!', item);
		return;
	}

	let givenDesc = descElement.innerText.trim();

	let matches = ThreadRegex.exec(givenDesc);
	if (!matches || matches.length <= 1) {
		Notify.log('No matches found for Item!', item);
		return;
	}

	let thisThread = threadLookup[matches[RegexEnum.Thread]];
	let sizeType = matches[RegexEnum.Type];
	if (thisThread && sizeLookup.hasOwnProperty(sizeType)) {
		let title = matches[RegexEnum.Thread].replace('The ', '').trim().toTitleCase(true);

		let prefix = thisThread.prefix;
		let sizeCode = sizeType ? sizeLookup[sizeType] : '';

		let itemCode = prefix + sizeCode + '-' + matches[RegexEnum.ColourCode];
		let barCode = formatBarCode(itemCode);
		let link = descElement.querySelector('a').getAttribute('href');
		let purchaseCode = link.substring(link.lastIndexOf('/') + 1);

		let length = (sizeType ? thisThread.length[sizeType] : '');
		let weight = thisThread.weight;
		let fibre = thisThread.fibre;

		// Yellow - Bottom Line 1300m (1420yd) 60W Polyester | Minimum 5 Spools
		let colourName = matches[RegexEnum.Type] ? matches[RegexEnum.Description].replace(matches[RegexEnum.Type], '').trim() : matches[RegexEnum.Description];
		let webName = colourName.trim().toTitleCase(true) + ' - ' + title + ' ' + length;
		let webDesc = weight + ' ' + fibre;
		let description = webName + ' - ' + webDesc;

		let result = { 'itemCode': itemCode, 'barCode': barCode, 'description': description, 'webName': webName, 'webDesc': webDesc, 'purchaseCode': purchaseCode };
		return result;
	}
}

// https://d2u373qf4c8xad.cloudfront.net/i/_/catalog/products/121-02-1011/121-02-1011.jpg~w=150,h=150,q=90
// https://d2u373qf4c8xad.cloudfront.net/i/_/catalog/products/121-02-1011/121-02-1011.jpg~w=1000,h=1000

function formatImage(item) {
	let result = '';
	let element = item.querySelector('div.category-item-thumbnail img');
	if (element) {
		let url = element.getAttribute('src');
		result = url.substring(0, url.indexOf('~'));
	}
	return result;
}