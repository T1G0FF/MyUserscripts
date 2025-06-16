// ==UserScript==
// @name         # Zuver - Domain Sort
// @namespace    http://www.tgoff.me/
// @version      2020.02.09.1
// @description  Sort Zuver Domains by Price
// @author       www.tgoff.me
// @match        *://zuver.net.au/domain-registration/domain-names/
// @grant        none
// @runat        document-idle
// ==/UserScript==

function comp(a, b) { return a > b ? +1 : b > a ? -1 : 0; }
function defaultFor(arg, val) { return typeof arg !== 'undefined' ? arg : val; }

let rowContainer;
let rowList = [];

(function () {
	'use strict';
	var timer = setInterval(function () {
		let buttonContainer = document.querySelector("div.FullSearchDomain div.header__nav");
		if (!buttonContainer.querySelector('#SortPriceButton')) {
			addButton(buttonContainer);
		}
	}, 3000);
})();

function addButton(container) {
	let button = document.createElement("button");
	button.id = "SortPriceButton";
	button.innerText = "Sort by Price";
	button.style.margin = "3px";
	button.onclick = buttonAction;
	container.insertAdjacentElement("afterbegin", button);
}

function buttonAction() {
	getAllRows();
	rowContainer.innerHTML = "";
	sortZuverDomains();
	addAllRows();
}

function sortZuverDomains() {
	rowList.sort(function (a, b) {
		let aval = Number(getPriceFromRow(a));
		let bval = Number(getPriceFromRow(b));
		let result = comp(aval, bval);
		return result;
	});
}

function getPriceFromRow(row) {
	let result = row.querySelector("div.table__column--price div.price__value").innerText.replace("$", "")
	return result;
}

function getAllRows() {
	rowContainer = document.querySelector("div.FullSearchDomain div.content__table");
	let rows = rowContainer.querySelectorAll("div.table__row");
	for (var key in rows) {
		if (rows.hasOwnProperty(key)) {
			var value = rows[key];
			rowList.push(value);
		}
	}
}

function addAllRows() {
	for (var key2 in rowList) {
		if (rowList.hasOwnProperty(key2)) {
			var value2 = rowList[key2];
			rowContainer.appendChild(value2);
		}
	}
}