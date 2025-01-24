// ==UserScript==
// @name         VicText Collection Extractor - Marshall Dry Goods
// @namespace    http://www.tgoff.me/
// @version      2025.01.24.1
// @description  Gets the names and codes from a Marshall Dry Goods Collection
// @author       www.tgoff.me
// @match        *://www.marshalldrygoods.com/shop/fabrics/*
// @match        *://marshalldrygoods.com/shop/fabrics/*
// @match        *://www.marshalldrygoods.com/shop/wholesale/*
// @match        *://marshalldrygoods.com/shop/wholesale/*
// @match        *://www.marshalldrygoods.com/shop/home/search/results/*
// @match        *://marshalldrygoods.com/shop/home/search/results/*
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/tg-lib.js
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/collection-extract-lib.js
// @grant        GM_setClipboard
// @grant        GM_download
// @run-at       document-idle
// ==/UserScript==

var CollectionList =
	['108 BRUSH STROKES', '108 CONFETTI DIGITAL', '108 DANCIN DAHLIAS', '108 DIGITALLY PRINTED BATIK PATTERN', '108 DREAM COTTON SOLIDS', '108 EARTH JEWELS', '108 FAIRY TALE', '108 FLANNEL PRINTS', '108 KALEIDOSCOPE DIGITAL', '108 CLASSICS', '108 PRINTED QUILT BACKING', '108 QUEENS GARDEN', '108 QUILTERS BLENDERS', '108 SCROLLING TONAL', '108 TONE ON TONE', '108 MARBLEICIOUS', '108 DAY DREAM', '108 TILT-A-WHIRL', '108 SCRAMBLE TONAL', '108 SMOOTHIE', '108 MARBLE TONAL', '108 BLENDED NATURAL', '108 GRUNGE PAINT', '108 CIRCLE BACK', '108 BLENDED', '108 PATRIOTIC', '108 PAISLEY', '108 TONAL VINEYARD', '108 BRANCHES', '108 FADED FLORAL',
		'45 BRUSH STROKES', '45 CONFETTI DIGITAL', '45 DANCIN DAHLIAS', '45 DIGITALLY PRINTED BATIK PATTERN', '45 DREAM COTTON', '45 EARTH JEWELS', '45 FAIRY TALE', '45 GEMSTONES', '45 KALEIDOSCOPE', '45 VINTAGE FLORALS', '45 PALETTE PATCH', '45 QUEENS GARDEN', '45 SCROLLING TONAL', '45 VINE DANCE', '45 WATERCOLOR DIGITAL',
		'60 PRIME PLUS POLY COTTON SOLIDS', '60 PRINTS', '90 QUILT TOP', '90 SHEETING',
		'BABY PANELS', 'BABY PANELS PRE QUILTED', 'CHRISTMAS PRINTS', 'CLOSEOUTS', 'COLLEGE PRINTS', 'CRACKED ICE', 'CUDDLE FLEECE', 'DIGITAL NOVELTY', 'DUCK CANVAS', 'FLANNEL PRINTS', 'HOMESPUN CHECKS', 'INDONESIAN HAND STAMPED BATIKS', 'KNITS', 'LICENSED', 'MARSHALL DRY GOODS CLASSICS', 'BASICS', 'CAMOUFLAGE', 'DIGITAL NOVELTY', 'DIGITAL PRINTS', 'JELLY ROLLS', 'PRE PACKAGED FABRIC', 'MLB BASEBALL', 'MUSLIN', 'NBA', 'NFL PRINTS', 'PLUSH FABRICS', 'PREMIUM HAND STAMPED BATIKS', 'PROMOTIONAL SOLIDS', 'QUILTERS BATIKS', 'QUILTERS BLENDERS', 'QUILTERS CALICOS', 'QUILTERS TIE DYES', 'ROCKY POLY COTTON POPLIN', 'SLINKY MINKY', 'SLINKY MINKY DOTS', 'SLINKY MINKY SOLIDS', 'SNUGGLE FLANNEL', 'SPLATTER TONAL', 'SPORTS TEAMS', 'THE RED THE BLACK', 'TONAL BRANCHES', 'TONE ON TONE', 'VINTAGE 1800S', 'WIDE POLY COTTON SHEETING'];

(function () {
	'use strict';

	createButtons();
	//addSortFilterInputs();
})();

function getCompany() {
	return 'Marshall Dry Goods';
}

function getTitleElement() {
	return document.querySelector('#cartHeader > div.text-center > h1');
}

function getCollection() {
	return document.querySelectorAll('#cartHome div.products > div.item');
}

function getItemObject(item) {
	let codeElement = item.querySelector('a.mt-3 strong');
	if (!codeElement) {
		Notify.log('Code elements not found!', item);
		return;
	}

	let givenCode = codeElement.innerText.trim().toUpperCase();
	let tempCode = givenCode;
	if (tempCode.indexOf('3 YARD PIECE') > 0) {
		tempCode = tempCode.split('3 YARD PIECE')[0].trim();
	}
	if (tempCode.indexOf('15 YDS') > 0) {
		tempCode = tempCode.split('15 YDS')[0].trim();
	}
	tempCode = tempCode.replace(/^BOLT/, '');
	tempCode = tempCode.replace(/\$[0-9]+(?:\.[0-9]+)\s*YD/, '');
	tempCode = tempCode.replace(/[0-9]+\s*(?:YARDS?|YD)/, '');
	tempCode = tempCode.replace('MDG', '');
	tempCode = tempCode.replace('QUILT BACK', '');
	tempCode = tempCode.replace('"', '');
	tempCode = tempCode.replace("'", '');
	tempCode = tempCode.replace(/[ ]{2,}/, ' ');
	tempCode = tempCode.trim();

	let prefix = 'QB'; // Quiltbacks
	let title = getFormattedTitle();
	title = title.replace(/(?: - )?Marshall Dry Goods/, '');
	let dates = getReleaseDates();

	let tempName = shortenColourName(tempCode);

	let collectionName = title;
	let collectionCode = '';
	let patternName = '';
	let colourCode = '';
	let colourName = '';
	let special = '';

	for (const coll of CollectionList) {
		if (tempCode.indexOf(coll) >= 0) {
			let tempColl = coll;
			let tempColour = tempCode.replace(coll, '').trim();

			if (coll.indexOf('DIGITAL') >= 0) {
				tempColl = tempColl.replace(/DIGITALLY PRINTED/, 'DIGITAL').trim();
				tempColl = tempColl.replace(/DIGITAL$/, '').trim();
				special = 'Digital';
			}

			collectionName = tempColl.toTitleCase();
			let longth = 1;
			do {
				let regex = new RegExp(`\\b([A-Za-z]\{${longth}\}|[0-9]+)`, 'g');
				collectionCode = tempColl.match(regex).join('').toUpperCase();
				longth++;
			} while (collectionCode.replace(/[0-9]/g, '').length < 4);

			if (tempColour.indexOf('#') >= 0) {
				let split = tempColour.split('#');
				split = split.map(s => s.trim());
				split[0] = split[0].replace(/PATTERN$/, '').trim();

				colourCode = split[1];
			}
			else {
				colourName = tempColour.toTitleCase();
				//colourCode = tempColour;
			}

			break;
		}
	}

	if (tempName.indexOf('#') >= 0) {
		let split = tempName.split('#');
		split = split.map(s => s.trim());
		split[0] = split[0].replace(/PATTERN$/, '').trim();

		colourCode = split[1];
	}
	else if ((tempCode.indexOf('WHITE ON') >= 0 || tempCode.indexOf('GRAY ON') >= 0) && tempCode.indexOf('PRINT') >= 0) {
		collectionCode = '108TOT';
		collectionName = 'Tone on Tone Print';

		colourName = tempCode.replace(/^[0-9]+/g, '');
		colourName = colourName.replace(/PRINT$/g, '');
		colourName = colourName.trim().toTitleCase();
		let longth = 1;
		do {
			let regex = new RegExp(`\\b([A-Za-z]\{1,${longth}\})`, 'g');
			colourCode = colourName.match(regex).join('').toUpperCase();
			longth++;
		} while (colourCode.replace(/[0-9]/g, '').length < 4);
	}
	else if (tempCode.indexOf('WHITE ON WHITE') >= 0 && !tempCode.indexOf('PRINT') >= 0) {
		let temp = tempCode.replace('WHITE ON WHITE', '').trim();

		collectionCode = '108WOW';
		collectionName = 'White on White';
		colourName = temp.replace(/^[0-9]+/g, '').toTitleCase();
		let longth = 1;
		do {
			let regex = new RegExp(`\\b([A-Za-z]\{1,${longth}\})`, 'g');
			colourCode = temp.match(regex).join('').toUpperCase();
			longth++;
		} while (colourCode.replace(/[0-9]/g, '').length < 4);
	}

	colourName = fixColourName(colourName);

	let purchaseCode = tempCode;
	purchaseCode = formatPurchaseCode(purchaseCode.trim());

	let material = 'C100%';
	let width = title.includes('108') ? { 'Measurement': '108', 'Unit': 'in' } : { 'Measurement': '45', 'Unit': 'in' };
	let repeat = '';

	return {
		'Prefix': prefix,
		'CollectionCode': collectionCode,
		'ColourCode': colourCode,
		'ColourName': colourName,
		'PurchaseCode': purchaseCode,
		'PatternName': patternName,
		'CollectionName': collectionName,
		'SpecialNotes': special,
		'Material': material,
		'Width': width,
		'Repeat': repeat,
		'ReleaseDates': dates,
	};
}

function formatInformation(itemElement) {
	let item = getItemObject(itemElement);
	if (!item) return;

	let company = getCompany();
	let itemCode = item.PurchaseCode;
	let description = '';
	let webName = '';
	let webDesc = '';

	let relDateString = toReleaseString(item.ReleaseDates);
	let delDateString = toDeliveryString(item.ReleaseDates);

	let tempCodeColour = ((item.ColourCode.length > 0) ? item.ColourCode : shortenColourName(item.ColourName));
	itemCode = formatItemCode(item.Prefix, item.CollectionCode + ' ' + tempCodeColour.toUpperCase());
	let barCode = formatBarCode(itemCode);

	if (item.ColourName.length > 0) {
		itemCode = formatItemCode(item.Prefix, item.CollectionCode + ' ' + shortenColourName(item.ColourName));
	}

	let widthString = item.Width.Measurement + item.Width.Unit;
	description = formatSapDescription({ 'Colour': item.ColourName, 'Pattern': item.PatternName, 'Collection': item.CollectionName, 'Special': item.SpecialNotes, 'Material': item.Material, 'Width': 'W' + widthString, 'Repeat': item.Repeat })

	webName = (((item.ColourName.length > 0) ? item.ColourName + ' - ' : '') + item.CollectionName);

	webDesc = formatWebDescription({ 'Collection': item.CollectionName, 'Notes': item.SpecialNotes, 'Fibre': item.Material, 'Width': widthString, 'Release': relDateString, 'Delivery From': item.ReleaseDates.Delivery });

	let result = { 'itemCode': itemCode, 'barCode': barCode, 'description': description, 'webName': webName, 'webDesc': webDesc, 'delDate': delDateString, 'purchaseCode': item.PurchaseCode, 'webCategory': item.CollectionName };
	return result;
}

// https://static.visionamp.co/rubix/MDGI/orig_27322_Camo-Canopy.jpg
function formatImage(item) {
	let img = item.querySelector('div.zoom');
	let result = img.getAttribute('data-image');
	return result;
}