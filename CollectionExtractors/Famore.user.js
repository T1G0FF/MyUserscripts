// ==UserScript==
// @name         VicText Collection Extractor - Famore
// @icon         https://www.google.com/s2/favicons?sz=64&domain=famorecutlery.com
// @namespace    http://tgoff.me/
// @version      2022.11.14.1
// @description  Gets the names and codes from a Famore Collection
// @author       www.tgoff.me
// @match        *://famorecutlery.com/famore/*
// @match        *://*.famorecutlery.com/famore/*
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
	return 'Famore';
}

function getTitleElement() {
	let titleElement = document.querySelector('div.main h1.container-header');
	return titleElement;
}

function getCollection() {
	let collection = document.querySelectorAll('ul.productGrid li.product');
	return collection;
}

function formatInformation(itemElement) {
	let nameElement = itemElement.querySelector('h4.card-title');
	if (!nameElement) {
		Notify.log('Name element not found!', itemElement);
		return;
	}
	let givenDesc = nameElement.innerText;

	let codeElement = itemElement.querySelector('h4.sku span.sku-value');
	if (!codeElement) {
		let dashIndex = givenDesc.indexOf(' - ');
		if (dashIndex < 0) {
			Notify.log('Code element not found!', itemElement);
			return;
		}

		codeElement = {
			'innerText': givenDesc.substring(0, dashIndex)
		}
		givenDesc = givenDesc.substring(dashIndex + 3);
	}
	let givenCode = codeElement.innerText.trim();

	if (givenDesc.indexOf(givenCode) === 0) givenDesc = givenDesc.substring(givenCode.length);
	if (givenDesc.indexOf(' - ') === 0) givenDesc = givenDesc.substring(3);
	givenDesc = givenDesc.replace(' - PREORDER', '').trim();

	let itemCode = formatItemCode('FC', givenCode.replace('-', ' '));
	let barCode = formatBarCode(itemCode);

	let description = givenDesc.trim();

	let result = { 'itemCode': itemCode, 'barCode': barCode, 'description': description, 'webName': '', 'webDesc': '', 'delDate': '', 'purchaseCode': givenCode, 'webCategory': '' };
	return result;
}

// https://cdn11.bigcommerce.com/s-sdq9gkoc6f/images/stencil/500x659/products/568/585/812-Famore-Curved-Forcep-website__27514.1607015027.jpg?c=2
// https://cdn11.bigcommerce.com/s-sdq9gkoc6f/images/stencil/1280x1280/products/568/585/812-Famore-Curved-Forcep-website__27514.1607015027.jpg?c=2

function formatImage(itemElement) {
	let imgElements = itemElement.querySelectorAll('a.image-link.desktop img.card-image');
	if (!imgElements) {
		Notify.log('One or More Elements Not Found!', itemElement);
		return;
	}

	let links = [];
	imgElements.forEach(imgElement => {
		let link = imgElement.getAttribute('data-src');
		link = link.replace('/500x659/', '/1280x1280/');
		if (!links.includes(link)) links.push(link);
	});

	return links;
}