// ==UserScript==
// @name         # Metal Archives - Band Table Sorter
// @namespace    http://www.tgoff.me/
// @version      2025.09.12.1
// @description  Allows sorting of the Band table in search results.
// @author       www.tgoff.me
// @match        https://www.metal-archives.com/search/advanced/searching/bands*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=metal-archives.com
// @grant        none
// @run-at       document-idle
// ==/UserScript==

function comp(a, b) { return a > b ? +1 : b > a ? -1 : 0; }
function defaultFor(arg, val) { return typeof arg !== 'undefined' ? arg : val; }

let rowContainer;
let rowList = [];
let direction = +1;
let prevIndex = 1;

(function () {
	'use strict';
	var timer = setInterval(function () {
		addMiscCSS();
		addTableSorting();
	}, 3000);
})();

function addStyle(css) {
	let node = document.createElement('style');
	node.type = 'text/css';
	node.appendChild(document.createTextNode(css));
	let heads = document.getElementsByTagName('head');
	if (heads.length > 0) {
		heads[0].appendChild(node);
	} else {
		document.documentElement.appendChild(node);
	}
}

function addMiscCSS() {
	let cssText = '';
	cssText = ``;
	addStyle(cssText);
}

function addTableSorting() {
	let tables = document.querySelectorAll('table#searchResultsBand');
	if (!tables || tables.length == 0) return;

	for (const table of tables) {
		let headerRow = table.querySelectorAll('th[role="columnheader"]');
		let index = 0;
		for (var column of headerRow) {
			index++;
			if (column.querySelector('a')) continue;

			let text;
			let span = column.querySelector('span');
			if (!span) {
				text = column?.innerText ?? '-';
			}
			else {
				text = span?.innerText ?? '-';
			}
			text = text.length > 0 ? text : '-';
			let colName = text.replace(/\s/, '');

			let link = document.createElement('a');
			link.href = '#';
			link.id = 'SortLink' + colName;
			link.style.textDecoration = 'none';

			if (span) {
				link.insertAdjacentElement("afterbegin", span);
			}
			else {
				link.innerText = text;
			}

			column.insertAdjacentElement("afterbegin", link);
			column.replaceChildren(link);

			let _index = index;
			link.onclick = function () {
				rowContainer = table.querySelector('tbody');

				getAllRows(rowContainer);
				rowContainer.replaceChildren();

				direction = _index == prevIndex ? direction *= -1 : +1;
				rowList.sort(function (a, b) {
					let result = sortRowsByColumn(a, b, _index);
					result = result == 0 ? sortRowsByColumn(a, b, prevIndex) : result;
					return direction * result;
				});
				prevIndex = prevIndex != _index ? _index : prevIndex;

				addAllRows(rowContainer);
				rowList = [];
			}
		}
	}
}

function getAllRows(rc) {
	let rows = rc.querySelectorAll('tr');
	for (let row of rows) {
		rowList.push(row);
	}
}

function addAllRows(rc) {
	for (let row of rowList) {
		rc.appendChild(row);
	}
}

function sortRowsByColumn(a, b, index) {
	let selector = 'td:nth-of-type(' + index + ')';
	let aVal = getSortableValue(a, selector);
	let bVal = getSortableValue(b, selector);
	let result = comp(aVal, bVal);
	return result;
}

function getSortableValue(row, selector) {
	let cell = row.querySelector(selector);
	if (!cell) return undefined;
	let value = cell.innerText;
	if (!value) value = cell.querySelector('input')?.value;
	value = value.replaceAll(/(\d+)/g, m => zeroPad(parseInt(m), 10));
	return value;
}

function zeroPad(num, totalLength) {
	if (num === 0) return '0'.repeat(totalLength);
	var an = Math.abs(num);
	var digitCount = 1 + Math.floor(Math.log(an) / Math.LN10);
	if (digitCount >= totalLength) {
		return num;
	}
	var zeroString = Math.pow(10, totalLength - digitCount).toString().substring(1);
	return num < 0 ? '-' + zeroString + an : zeroString + an;
}