// ==UserScript==
// @name         Timeless Treasures / Dear Stella - Search Improvements
// @namespace    http://www.tgoff.me/
// @version      2023.07.04.1
// @description  Allows pasting VicText codes into search bar.
// @author       www.tgoff.me
// @match        *://ttfabrics.com/*
// @match        *://*.ttfabrics.com/*
// @match        *://dearstelladesign.com/*
// @match        *://*.dearstelladesign.com/*
// @match        *://marcusfabrics.com/*
// @match        *://*.marcusfabrics.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
	'use strict';

	let searchForm = document.querySelector('form[name="search-top"]');
	let searchText = searchForm.querySelector('input.prompt-search');
	searchForm.onsubmit = () => {
		let query = searchText.value;
		query = query.trim();

		let before = query;
		if (window.location.hostname.includes('ttfabrics')) {
			if (query.startsWith("JN X")) {
				query = "XTONGA-" + query.substring(4).trim();
			}
			else if (query.startsWith("TTX")) {
				query = query.substring(3);
			}
			else if (query.startsWith("TT") || query.startsWith("JN")) {
				query = query.substring(2);
			}
		}
		else if (window.location.hostname.includes('dearstelladesign')) {
			if (query.startsWith("DS X")) {
				query = "XSTELLA-" + query.substring(4).trim();
			}
			else if (query.startsWith("DS")) {
				query = query.substring(2);
			}
		}
		let prefixRemoved = query != before;
		query = query.trim();

		let colorStart = query.indexOf(" ");
		if (prefixRemoved && colorStart > 0) {
			query = query.substring(0, colorStart);
		}
		searchText.value = query.trim();
		return true;
	}
})();