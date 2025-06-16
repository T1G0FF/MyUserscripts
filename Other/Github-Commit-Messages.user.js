// ==UserScript==
// @name         # Github - Expand commit messages
// @namespace    http://www.tgoff.me/
// @version      2022.08.29.1
// @description  Expands the hidden commit messages by default.
// @author       www.tgoff.me
// @match        *://github.com/*/commits/*
// @match        *://*.github.com/*/commits/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
	'use strict';
	setTimeout(function () {
		document.querySelectorAll('span.hidden-text-expander button.js-details-target').forEach(btn => btn.click())
	}, 250);
})();