// ==UserScript==
// @name         Issuu - OnClick Handler Remover
// @namespace    http://www.tgoff.me/
// @version      2023.07.14.1
// @description  Replaces the onclick handler with a regular link on Issuu Publications
// @author       www.tgoff.me
// @match        *://issuu.com/*
// @match        *://*.issuu.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=issuu.com
// @grant        none
// @run-at       document-idle
// ==/UserScript==

let titleRegex = /(?:Cover of \")([-_a-zA-Z0-9]+)(?:\")/g;
(function () {
	'use strict';
	setTimeout(function () {
		removeOnClickHandlers();
		console.log('Click handlers removed!');
	}, 1000);
})();

function removeOnClickHandlers() {
	let items = document.querySelectorAll('div.beige-publication');
	for (const item of items) {
		titleRegex.lastIndex = 0;
		let children = item.children;
		let company = item.querySelector('div.publication-metadata a.ixu-link').getAttribute('href');
		company = company[0] === "/" ? company : "/" + company;
		let coverImageAlt = item.querySelector('div.cover-group > img').getAttribute('alt');
		let matches = titleRegex.exec(coverImageAlt.toString());
		if (matches && matches.length > 1) {
			let title = matches[1];
			let linkElem = document.createElement('a');
			linkElem.href = 'https://issuu.com' + company + '/docs/' + title;
			linkElem.replaceChildren(...children);

			// Should blast any click handlers on any children that have them
			// It doesn't work though...
			Array.from(item.getElementsByTagName("*")).forEach(c => {
				//if(c.onclick) {
				c.onclick = undefined;
				c.addEventListener("click", function (event) {
					event.preventDefault();
					event.stopPropagation();
				});
				c.addEventListener("click", function (event) {
					event.preventDefault();
					event.stopPropagation();
				});
				//}
			});

			item.insertAdjacentElement('afterBegin', linkElem);
		} else {
			//console.log('No children found: ' + item.onclick.toString());
		}
	}
}