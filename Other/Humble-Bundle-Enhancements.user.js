// ==UserScript==
// @name         # Humble Bundle - Enhancements
// @namespace    http://www.tgoff.me/
// @version      2019.11.14.1
// @description  Adds an item count to the Bulk Download button.
// @author       www.tgoff.me
// @match        *://humblebundle.com/downloads?key=*
// @match        *://*.humblebundle.com/downloads?key=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=humblebundle.com
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
	'use strict';
	setTimeout(function () {
		addItemCount();
	}, 2500);
})();

function addItemCount() {
	let platform = document.querySelector('button.js-bulk-download');
	let items = document.querySelectorAll('div.gameinfo');
	platform.innerText += ' [' + items.length + ']';
}