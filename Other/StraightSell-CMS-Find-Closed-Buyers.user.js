// ==UserScript==
// @name         # StraightSell CMS - Find Closed Buyers
// @namespace    http://www.tgoff.me/
// @version      2020.09.11.1
// @description  Finds accounts on the website that need to be closed.
// @author       www.tgoff.me
// @match        *://cp.straightsell.com.au/index.php?app=ecom&section=buyerList*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=straightsell.com.au
// @grant        none
// @run-at       document-idle
// ==/UserScript==

let buttonLocationElement = document.querySelector('#advancedSearchForm a[href*="javascript:InsertRow()"]');

(function () {
	'use strict';
	addNextButton();
	addPrevButton();
	addResetButton();
	addInitButton();
	selectAllButton();
})();

function addResetButton() {
	if (buttonLocationElement) {
		let buttonElement = document.createElement('button');
		buttonElement.innerText = 'Reset';
		buttonElement.style.marginLeft = '12px';
		buttonElement.style.padding = '2px 10px';
		buttonElement.classList.add('removeButton');
		buttonElement.onclick = function () {
			let addedRows = document.querySelectorAll('div[id*="SearchDiv"]');
			addedRows.forEach((currentValue) => {
				let id = currentValue.getAttribute('id').replace('SearchDiv', '');
				if (id > 0) {
					RemoveRow(id);
				}
			});
		};
		buttonLocationElement.insertAdjacentElement('AfterEnd', buttonElement);
	}
}

var bulkLot = 25;
var TotalRowsRequired = bulkLot;
var offset = 0;
var index = 0;

function addInitButton() {
	if (buttonLocationElement) {
		let buttonElement = document.createElement('button');
		buttonElement.innerText = 'Init';
		buttonElement.style.marginLeft = '12px';
		buttonElement.style.padding = '2px 10px';
		buttonElement.classList.add('removeButton');
		buttonElement.onclick = function () {
			let addedRows = document.querySelectorAll('div[id*="SearchDiv"]').length;
			TotalRowsRequired = bulkLot - addedRows - 1;
			if (TotalRowsRequired > 0) {
				for (let i = TotalRowsRequired; i != 0; i--) {
					InsertRow();
				}
			}
			_get();
		};
		buttonLocationElement.insertAdjacentElement('AfterEnd', buttonElement);
	}
}

function addNextButton() {
	if (buttonLocationElement) {
		let buttonElement = document.createElement('button');
		buttonElement.innerText = 'Next';
		buttonElement.style.marginLeft = '12px';
		buttonElement.style.padding = '2px 10px';
		buttonElement.classList.add('removeButton');
		buttonElement.onclick = function () {
			getNext();
		};
		buttonLocationElement.insertAdjacentElement('AfterEnd', buttonElement);
	}
}

function addPrevButton() {
	if (buttonLocationElement) {
		let buttonElement = document.createElement('button');
		buttonElement.innerText = 'Prev';
		buttonElement.style.marginLeft = '12px';
		buttonElement.style.padding = '2px 10px';
		buttonElement.classList.add('removeButton');
		buttonElement.onclick = function () {
			getPrev();
		};
		buttonLocationElement.insertAdjacentElement('AfterEnd', buttonElement);
	}
}

function _get() {
	let searchInElements = document.querySelectorAll('select[id*="SearchCol"]');
	searchInElements.forEach((currentValue) => {
		currentValue.value = 'SellerReference';
	});
	let operatorElements = document.querySelectorAll('select[id*="Operator"]');
	operatorElements.forEach((currentValue) => {
		currentValue.value = 'Equals';
	});
	let criteriaElements = document.querySelectorAll('input[id*="Criteria"]');
	criteriaElements.forEach((currentValue) => {
		let currentCode = customerCodes[offset + index++];
		currentValue.value = currentCode === undefined ? '' : currentCode;
	});
	let conditionElements = document.querySelectorAll('select[id*="Condition"]');
	conditionElements.forEach((currentValue) => {
		currentValue.value = 'OR';
	});
	index = 0;
}

function getNext() {
	offset += bulkLot;
	offset = offset > customerCodes.length - bulkLot ? customerCodes.length - bulkLot : offset;
	_get();
}

function getPrev() {
	offset -= bulkLot;
	offset = offset < 0 ? 0 : offset;
	_get();
}

function selectAllButton() {
	let adjElement = document.querySelector('input[onclick*="javascript:Search(this,1,\'LISTADVBUYERS\')"]')
	let buttonElement = document.createElement('button');
	buttonElement.innerText = 'Select All';
	buttonElement.style.marginLeft = '24px';
	buttonElement.style.padding = '2px 10px';
	buttonElement.classList.add('removeButton');
	buttonElement.onclick = function () {
		let checkList = document.querySelectorAll('input[name*="mergeID"]')
		checkList.forEach((currentValue) => {
			currentValue.checked = true;
		});
	};
	adjElement.insertAdjacentElement('AfterEnd', buttonElement);
}

var customerCodes = ``.split('\n');