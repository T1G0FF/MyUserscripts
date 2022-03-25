// ==UserScript==
// @name         General - Font Remover (Helvetica Neue)
// @namespace    http://www.tgoff.me/
// @version      2021.07.09.1
// @description  Replaces Helvetica Neue font family from CSS font stack to use next fallback. Provides Arial as fallback only if no other is given. Based on afalchi82's Chrome Extension of the same name.
// @author       www.tgoff.me
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

var fontList = ['helveticaneue-light', 'helvetica neue light', 'helvetica neue', 'helveticaneue'];

(function () {
	'use strict';
	// Removes from any added Elements
	createMutationObserver(elementReplace);

	let bound = {
		checkBody: false,
		checkBodyExist: {},
		checkChart: false,
		checkChartExist: {},
	}

	// Removes from Body once loaded
	bound.checkBodyExist = setInterval(function () {
		if (!this.checkBody && document.body) {
			this.checkBody = true;
			clearInterval(this.checkBodyExist);
			elementReplace(document.body);
		}
	}.bind(bound), 250); // Check every 250ms

	// Removes from default fonts of ChartJS
	bound.checkChartExist = setInterval(function () {
		if (!this.checkChart && typeof Chart !== "undefined") {
			this.checkChart = true;
			clearInterval(this.checkChartExist);
			Chart.defaults.global.defaultFontFamily = stackReplace(Chart.defaults.global.defaultFontFamily);
		}
	}.bind(bound), 250); // Check every 250ms

	setTimeout(function () {
		clearInterval(bound.checkChartExist);
		clearInterval(bound.checkBodyExist);
	}, 10000); // Clear interval timers after 10sec just in case
})();

function createMutationObserver(callback) {
	if (!callback) return;

	var observer = new MutationObserver(function (mutations, observer) {
		// 'mutations' is an array of mutations that occurred
		// 'observer' is the MutationObserver instance
		for (let mutation of mutations) {
			for (let element of mutation.addedNodes) {
				if (!(element instanceof Element)) {
					let type = Object.prototype.toString.call(element);
					//console.log(type);
					return;
				} else if (element.closest('.ProseMirror')) {
					// "Fixes" an infinite loop bug with comment box in atlassian
					return;
				}
				else {
					setTimeout(function () { callback(element); }, 250);
				}
			}
		}
	});

	// Start observing
	observer.observe(document, {
		childList: true,
		subtree: true
	});
}

function getFontStack(element) {
	return getComputedStyle(element)['font-family'];
}

function containsUnwantedFonts(element) {
	let result = getFontStack(element).toLowerCase();
	for (let font of fontList) {
		if (result.indexOf(font) !== -1) {
			return true;
		}
	}
	return false;
}

function elementReplace(element) {
	if (!(element instanceof Element)) {
		let type = Object.prototype.toString.call(element);
		console.log(type);
		return;
	}

	let fontStack = getFontStack(element);
	let result = stackReplace(fontStack);
	if (result.updated) {
		let currStyle = element.getAttribute('style');
		currStyle = currStyle ? currStyle + ';' : '';
		element.setAttribute('style', currStyle + 'font-family:' + result.fontStack + ' !important');
	}
}

function stackReplace(fontStack) {
	let result = fontStack;
	let lower = fontStack.toLowerCase();
	let updated = false;
	for (let font of fontList) {
		if (lower.indexOf(font) !== -1) {
			updated = true;
			let newStack = result.replace(escapedRegex(font, 'ig'), '');
			newStack = removeEmptys(newStack);
			if (newStack === '') newStack = 'arial';
			result = newStack;
		}
	}
	return { 'updated': updated, 'fontStack': result };
}

function escapedRegex(value, flags) {
	let esc = value.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
	return new RegExp(esc, flags ?? 'g');
}

function removeEmptys(fontStack) {
	let result = fontStack;
	result = result.replace(/^(?:,+ *)+|(?:,+ *)+$|(?:,+ *)+(?=, *)|[\"]{2,}(?:,+ *)?|(?:,+ *)?[\"]{2,}|[\']{2,}(?:,+ *)?|(?:,+ *)?[\']{2,}/g, '');
	result = result.trim();
	return result;
}