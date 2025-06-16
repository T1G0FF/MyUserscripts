// ==UserScript==
// @name         # The Guardian - DarkMode Twitter IFrames
// @namespace    http://www.tgoff.me/
// @version      2021.05.06.1
// @description  Sets the embedded tweets to use dark mode.
// @author       www.tgoff.me
// @match        *://theguardian.com/*
// @match        *://*.theguardian.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=theguardian.com
// @grant        none
// @run-at       document-ready
// ==/UserScript==

(function () {
	'use strict';
	createMutationObserver(sourceReplace);
	window.addEventListener("load", pageFullyLoaded);
})();

function createMutationObserver(callback) {
	if (!callback) return;

	var observer = new MutationObserver(function (mutations, observer) {
		// 'mutations' is an array of mutations that occurred
		// 'observer' is the MutationObserver instance
		mutations.forEach((record) => {
			record.addedNodes.forEach((element) => {
				if (!(element instanceof Element)) {
					let type = Object.prototype.toString.call(element);
					//console.log(type);
					return;
				} else {
					setTimeout(function () { callback(element); }, 250);
				}
			});
		});
	});

	// Start observing
	observer.observe(document, {
		childList: true,
		subtree: true
	});
}

function sourceReplace(element) {
	if (!(element instanceof Element)) {
		let type = Object.prototype.toString.call(element);
		console.log(type);
		return;
	}

	if (element.matches('iframe[src*="twitter.com"]')) {
		let src = element.getAttribute('src');
		element.setAttribute('src', src.replace('theme=light', 'theme=dark'));
	}
}

function pageFullyLoaded() {
	console.log('Page finished loading!');
	let frames = document.querySelectorAll('iframe[src*="twitter.com"]');
	if (frames.length < 1) {
		frames = document.querySelectorAll('[id*=twitter]');
	}

	for (let frame of frames) {
		console.log(frame);
		let src = frame.getAttribute('src');
		frame.setAttribute('src', src.replace('theme=light', 'theme=dark'));
		frame.setAttribute('data-theme', 'dark');
	}
}