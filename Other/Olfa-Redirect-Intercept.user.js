// ==UserScript==
// @name         # Olfa - Intercept Redirects
// @namespace    http://www.tgoff.me/
// @version      2020.12.08.1
// @description  Prevents the Olfa website from automatically redirecting you to your regional equivalent site.
// @author       www.tgoff.me
// @match        *://olfa.com/*
// @match        *://*.olfa.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=olfa.com
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
	'use strict';

	window.onbeforeunload = function (passedEvent) {
		let e = passedEvent || window.event;

		// For IE and Firefox prior to version 4
		if (e) {
			e.returnValue = 'Are you sure you want to leave the site?';
		}

		// For Safari
		return 'Are you sure you want to leave the site?';
	};

})();