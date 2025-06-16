// ==UserScript==
// @name         # VicText Collection Extractor - Superior Threads
// @namespace    http://www.tgoff.me/
// @version      2023.03.21.1
// @description  Gets the names and codes from a Superior Threads Collection
// @author       www.tgoff.me
// @match        *://*.superiorthreads.com/thread/*
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/tg-lib.js
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/collection-extract-lib.js
// @grant        GM_setClipboard
// @grant        GM_download
// @run-at        document-idle
// ==/UserScript==

let ThreadRegex = /(.+?)(?: | - )?#([0-9]+) (.*(?: ((?<!Jumbo |Mini )(?:3,000 yd\. |1650 yd )?Cone|(?:500 yd )?Spool|Mini Cone|Jumbo Cone(?:-8,500 yd)?|\(Size #[0-9]+\)|\(M-style, Dozen\)))|.*)/i;
let RegexEnum = {
	'Thread': 1,
	'ColourCode': 2,
	'Description': 3,
	'Type': 4,
};

let threadLookup = {
	// BLL01-601
	'The Bottom Line': {
		'prefix': 'BLL',
		'weight': '60W/2Ply',
		'fibre': 'Polyester',
		'length': { 'Cone': '2745m (3000yd)', 'Spool': '1300m (1420yd)' }
	},
	// F117 02 5004
	'Fantastico': {
		'prefix': 'F117 ',
		'weight': '40W/2Ply',
		'fibre': 'Polyester',
		'length': { 'Cone': '2745m (3000yd)', 'Spool': '458m (500yd)' }
	},
	// GL102-01-101
	'Glitter': {
		'prefix': 'GL102-',
		'weight': '40W',
		'fibre': 'Metallic',
		'length': { 'Null': '366m (400yd)' }
	},
	// KS133-02-301
	'Kimono Silk': {
		'prefix': 'KS133-',
		'weight': '100W/2Ply',
		'fibre': 'Silk',
		'length': { 'Cone': '1000m (1090yd)', 'Spool': '200m (220yd)' }
	},
	// KTT01-1002
	'King Tut': {
		'prefix': 'KTT',
		'weight': '40W/3Ply',
		'fibre': 'Cotton',
		'length': { 'Cone': '1830m (2000yd)', 'Spool': '458m (500yd)' }
	},
	// MF124 02 2002
	'Magnifico': {
		'prefix': 'MF124 ',
		'weight': '40W/2Ply',
		'fibre': 'Polyester',
		'length': { 'Cone': '2745m (3000yd)', 'Spool': '458m (500yd)' }
	},
	// MP124-02-152
	'MasterPiece': {
		'prefix': 'MP124-',
		'weight': '50W/3Ply',
		'fibre': 'Cotton',
		'length': { 'Cone': '2286m (2500yd)', 'Spool': '550m (600yd)' }
	},
	// ME101-03-000
	'Metallics': {
		'prefix': 'ME101-',
		'weight': '40W',
		'fibre': 'Metallic',
		'length': { 'Cone': '3000m (3280yd)', 'Mini Cone': '1000m (1090yd)', 'Spool': '500m (550yd)' }
	},
	// MQ146-02-7001
	'MicroQuilter': {
		'prefix': 'MQ146-',
		'weight': '100W/2Ply',
		'fibre': 'Polyester',
		'length': { 'Cone': '2745m (3000yd)', 'Spool': '732m (800yd)' }
	},
	// OMNI02-3022
	'OMNI': {
		'prefix': 'OMNI', //OM134-
		'weight': '40W',
		'fibre': 'Polyester, Corespun',
		'length': { 'Null': '5490m (6000yd)' }
	},
	// OV145-02-9002
	'OMNI-V': {
		'prefix': 'OV145-',
		'weight': '40W/2Ply',
		'fibre': 'Polyester, Corespun',
		'length': { 'Null': '1830m (2000yd)' }
	},
	// QS141-01-004
	'Quilter\'s Silk': {
		'prefix': 'QS141-',
		'weight': '16W/3Ply',
		'fibre': 'Silk',
		'length': { 'Null': '20m (22yd)' }
	},
	// SS107-01-3301
	'Sew Sassy': {
		'prefix': 'SS107-',
		'weight': '12W/3Ply',
		'fibre': 'Polyester',
		'length': { 'Null': '92m (100yd)' }
	},
	// SF116-01-503
	'So Fine!': {
		'prefix': 'SF116-',
		'weight': '50W/3Ply',
		'fibre': 'Polyester',
		'length': { 'Cone': '3000m (3280yd)', 'Spool': '500m (550yd)' }
	},
	// SP242-02-801
	'Superior Spirit': {
		'prefix': 'SP242-',
		'weight': '40W/3Ply',
		'fibre': 'Polyester',
		'length': { 'Cone': '1500m (1650yd)' }
	},
	// TS137-01-501
	'Tiara Silk': {
		'prefix': 'TS137-',
		'weight': '50W/2Ply',
		'fibre': 'Silk',
		'length': { 'Null': '250m (273yd)' }
	},
	// TR131-01-551
	'Treasure': {
		'prefix': 'TR131-',
		'weight': '30W/3Ply',
		'fibre': 'Cotton',
		'length': { 'Null': '275m (300yd)' }
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
	let sizeType = (matches[RegexEnum.Type] ?? 'Null').toTitleCase();
	if (thisThread && thisThread.length.hasOwnProperty(sizeType)) {
		let title = matches[RegexEnum.Thread].replace('The ', '').trim().toTitleCase(true);

		let link = descElement.querySelector('a').getAttribute('href');
		let purchaseCode = link.substring(link.lastIndexOf('/') + 1);

		let prefix = thisThread.prefix;
		let sizeCode = purchaseCode.split('-')[1];

		let delim = prefix.endsWith('-') ? '-' : ' ';
		let itemCode = prefix + sizeCode + delim + matches[RegexEnum.ColourCode];
		let barCode = formatBarCode(itemCode);

		let length = (sizeType ? thisThread.length[sizeType] : '');
		let weight = thisThread.weight;
		let fibre = thisThread.fibre;

		let colourName = matches[RegexEnum.Type] ? matches[RegexEnum.Description].replace(matches[RegexEnum.Type], '').trim() : matches[RegexEnum.Description];
		colourName = colourName.trim().toTitleCase(true);
		// MicroQuilter 2745m - 7011 Baby Yellow
		let webName = title + ' ' + length.split(' ')[0] + ' - ' + matches[RegexEnum.ColourCode] + ' ' + colourName;
		let webDesc = '\\';
		// Baby Yellow - MicroQuilter - 2745m (3000yd) - P100% - 100W/2P
		let description = colourName + ' - ' + title + ' - ' + length + ' - ' + fibre + ' - ' + weight;

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