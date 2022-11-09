// ==UserScript==
// @name         Save Superior Threads Zoom Images
// @namespace    http://www.tgoff.me/
// @version      2022.11.10.1
// @description  Adds buttons to Superior Threads product pages allowing for copying/opening of the high res zoom image.
// @author       www.tgoff.me
// @include      *://*.superiorthreads.*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=superiorthreads.com
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/tg-lib.js
// @grant        GM_setClipboard
// @runat        document-idle
// ==/UserScript==

(function () {
	'use strict';
	console.log('Begin adding \'Save Image\' buttons!');
	setTimeout(function () {
		addButtons();
		console.log('Finish adding \'Save Image\' buttons!');
	}, 500);
})();

function addButtons() {
	let newButton = document.createElement('button');
	newButton.innerText = 'Open Active';
	newButton.classList.add('tgButton');
	newButton.onclick = function () {
		let imgElement = document.querySelector('div.swiper-wrapper div.swiper-slide-active img');
		let givenURL = imgElement.getAttribute('src');
		window.open(givenURL, '_blank');
	};
	document.querySelector('div.productImageGallerySelectedImage').insertAdjacentElement('beforeBegin', newButton);

	newButton = document.createElement('button');
	newButton.innerText = 'Copy All';
	newButton.classList.add('tgButton');
	newButton.onclick = function () {


		let imgElements = document.querySelectorAll('div.swiper-wrapper div.swiper-slide img');
		let skuElement = document.querySelector('div.product-sku');
		let sku = skuElement.innerText.split('SKU:')[1].trim();
		let count = 0;
		let imageHtml = '<html>\n<body>\n<hr><h1>' + sku + '</h1>\n';
		imgElements.forEach(elem => {
			let givenURL = elem.getAttribute('src');
			imageHtml = imageHtml + '<img src="' + givenURL + '">\n';
			count++;
		});
		imageHtml = imageHtml + '</body>\n</html>';
		imageHtml = imageHtml.trim() + '\n';
		GM_setClipboard(imageHtml);

		let msg = 'None found!';
		if (count > 0) {
			msg = count + ' found and copied!';
		}
		Notify.log(msg);
	};
	document.querySelector('div.productImageGallerySelectedImage').insertAdjacentElement('beforeBegin', newButton);
}