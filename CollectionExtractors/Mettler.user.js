// ==UserScript==
// @name         VicText Collection Extractor - Mettler
// @namespace    http://www.tgoff.me/
// @version      2021.03.09.1
// @description  Gets the names and codes from a Mettler Range
// @author       www.tgoff.me
// @match        *://www.amann-mettler.com/en/products/details/*
// @match        *://amann-mettler.com/en/products/details/*
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
	let company = 'Mettler';
	return company;
}

function getTitleElement() {
	let titleElement = document.querySelector('h1.product-title');
	return titleElement;
}

function getCollection() {
	let collection = document.querySelectorAll('a.product-colorchanger');
	return collection;
}

let optionElement = undefined;
function getOptionElement() {
	if (!optionElement) {
		let options = document.querySelectorAll('div.product-options-list li');
		for (let option in options) {
			if (options.hasOwnProperty(option)) {
				let currentElement = options[option];
				if (currentElement.querySelector('span.active')) {
					optionElement = currentElement;
					break;
				}
			}
		}
	}
	return optionElement;
}

function getArticle() {
	let article = '';
	let localOptionElement = getOptionElement();
	if (localOptionElement) {
		let option = localOptionElement.querySelector('span.option-select');
		if (option) {
			article = 'A' + option.getAttribute('data-itemnumber');
		}
	}
	return article;
}

function getLength() {
	let length = '';
	let localOptionElement = getOptionElement();
	if (localOptionElement) {
		let option = localOptionElement.querySelector('span.option-text');
		if (option) {
			length = option.innerText;
		}
	}
	return length;
}

function formatInformation(item) {
	let title = getFormattedTitle();
	let company = getCompany();
	let givenName = getArticle();
	let givenColour = item.getAttribute('data-colorname').toTitleCase();
	let givenCode = padWithZeros(item.getAttribute('data-colorcode'), 4);
	let givenCodeColour = (givenCode + ' ' + givenColour).toUpperCase();

	let itemCode = givenName + ' ' + givenCode;
	let barCode = formatBarCode(itemCode);
	let purchaseCode = itemCode;
	let material = document.querySelector('div.product-essentials-wrapper p:first-of-type').innerText.trim();;
	let length = getLength();

	let webName = givenColour.toTitleCase(false) + ' - ' + title;
	let webDesc = material + ' - ' + length;
	let description = webName + ' - ' + webDesc;

	let delDate = '';//toDeliveryString(getReleaseDates());
	let result = { 'itemCode': itemCode, 'barCode': barCode, 'description': description, 'webName': webName, 'webDesc': webDesc, 'delDate': delDate, 'purchaseCode': purchaseCode };
	return result;
}

let imgRegex = /(?:\/fileadmin\/templates\/www\.amann-mettler\.com\/img\/products\/images\/)(.*?)\/.*[-_](.*)-\1(?:\.png)/;
let RegexEnum = {
	'ProductID': 1,
	'ColorID': 2,
};

let imageUrl = undefined;
let imageUrlMatches = undefined;
function getbaseImageUrl() {
	if (!imageUrl) {
		let imageElement = document.querySelector('img.product-image');
		imageUrl = 'https://www.amann-mettler.com' + imageElement.getAttribute('src');

		imageUrlMatches = imgRegex.exec(imageUrl);
	}
	return imageUrl;
}

function formatImage(item) {
	let thumbUrl = item.getAttribute('data-image');
	let urlParams = new Params(thumbUrl);
	let productId = urlParams.getValue('pid');
	let colorId = urlParams.getValue('cid');
	if (colorId.length < 4) {
		colorId = '0000' + colorId;
		colorId = colorId.substring(colorId.length - 4);
	}
	let localUrl = getbaseImageUrl().replace(imageUrlMatches[RegexEnum.ProductID], productId).replace(imageUrlMatches[RegexEnum.ColorID], colorId);
	return localUrl;
}