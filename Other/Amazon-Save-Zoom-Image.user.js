// ==UserScript==
// @name         Save Amazon Zoom Image
// @namespace    http://www.tgoff.me/
// @version      2020.10.20.1
// @description  Adds buttons to Amazon product pages allowing for copying/opening of the high res zoom image.
// @author       www.tgoff.me
// @include      *://*.amazon.*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=amazon.com
// @grant        GM_setClipboard
// @runat        document-idle
// ==/UserScript==

(function () {
	'use strict';
	let newButton = document.createElement('button');
	newButton.innerText = 'Copy Zoom';
	newButton.classList.add('tgButton');
	newButton.onclick = function () {
		let url = document.querySelector('li.image.item.selected img').getAttribute('data-old-hires');
		GM_setClipboard(url);
	};
	document.querySelector('div#main-image-container').insertAdjacentElement('afterBegin', newButton);

	newButton = document.createElement('button');
	newButton.innerText = 'Open Zoom';
	newButton.classList.add('tgButton');
	newButton.onclick = function () {
		let url = document.querySelector('li.image.item.selected img').getAttribute('data-old-hires');
		window.open(url, '_blank');
	};
	document.querySelector('div#main-image-container').insertAdjacentElement('afterBegin', newButton);
})();