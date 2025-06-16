// ==UserScript==
// @name         # Big Watermelon - Full width specials
// @namespace    http://www.tgoff.me/
// @version      2024.04.14.1
// @description  Forces the specials images to use the full width of the pages
// @author       www.tgoff.me
// @match        *://bigwatermelon.com.au/dailyspecials/
// @match        *://*.bigwatermelon.com.au/dailyspecials/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bigwatermelon.com.au
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/tg-lib.js
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
	'use strict';

	var cssText = `
div#content article[id*="post"] img {
    width: 100% !important;
    height: auto !important;
    max-width: unset !important;
    max-height: unset !important;
}`;
	MyStyles.addStyle('FullWidthSpecials', cssText);

	var imgs = document.querySelectorAll('div#content article[id*="post"] img');
	for (const img of imgs) {
		img.sizes = '';
	}

	var blks = document.querySelectorAll('div.wp-block-image');
	var blkL = document.querySelector('div.wp-block-image:last-of-type');
	for (const blk of blks) {
		if (blk != blkL) {
			blk.style.marginBottom = 'unset';
		}
	}

	var seps = document.querySelectorAll('hr.wp-block-separator');
	var sepF = document.querySelector('hr.wp-block-separator:first-of-type');
	var sepL = document.querySelector('hr.wp-block-separator:last-of-type');
	for (const sep of seps) {
		if (sep != sepF && sep != sepL) {
			sep.remove();
		}
	}
})();