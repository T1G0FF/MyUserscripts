// ==UserScript==
// @name         StraightSell CMS Enhancements
// @namespace    http://www.tgoff.me/
// @version      2023.03.23.1
// @description  Allows you to toggle the visibility of all the far too easy to click Delete/Remove/Revoke links.
// @author       www.tgoff.me
// @match        *://cp.straightsell.com.au/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=straightsell.com.au
// @run-at        document-idle
// ==/UserScript==

const DEBUG = false;

function callbackDelay(callback, delay = 150) {
	setTimeout(function () {
		callback();
	}, delay);
}

var hideDeleteOptions;
var showButton;
var selectorsList = ['.ListtableRow1 a.action[href^="javascript:confirmDelete"]',
	'.ListtableRow2 a.action[href^="javascript:confirmDelete"]',
	'.ListtableRow1 a.action[onclick*="ACTION=DELETE"]',
	'.ListtableRow2 a.action[onclick*="ACTION=DELETE"]',
	'.ListtableRow1 a.action[href*="ACTION=REMOVE"]',
	'.ListtableRow2 a.action[href*="ACTION=REMOVE"]',
	'.ListtableRow1 a.action[href*="ACTION=REVOKE"]',
	'.ListtableRow2 a.action[href*="ACTION=REVOKE"]',
	'#LISTPAGES td a[href*="ACTION=DELETE"]'
];

(() => {
	'use strict';
	hideDeleteOptions = sessionStorage.getItem('hideDeleteOptions');
	if (hideDeleteOptions === null || hideDeleteOptions === undefined) hideDeleteOptions = true;
	createButton();
	callbackDelay(updateElements, 250);
	enableItemEditing();
	enableCheckboxCellClick();
})();

function createButton() {
	showButton = document.createElement('button');
	showButton.innerText = hideDeleteOptions ? 'Show Delete' : 'Hide Delete';
	showButton.classList.add('removeButton');

	showButton.style.position = 'Absolute';
	showButton.style.top = '75px';
	showButton.style.right = '10px';

	showButton.style.paddingTop = '2px';
	showButton.style.paddingBottom = '2px';
	showButton.style.width = '95px';
	showButton.style.zIndex = '1';
	showButton.onclick = toggleShowDeleteButton;
	document.querySelector('nav#top-nav').insertAdjacentElement('afterEnd', showButton);
}

function toggleShowDeleteButton() {
	hideDeleteOptions = !hideDeleteOptions;
	sessionStorage.setItem('hideDeleteOptions', hideDeleteOptions);
	updateElements();
}

function clickUpdateElements() {
	var checkExist = setInterval(function () {
		if (document.querySelectorAll('tr').length > 0) {
			if (DEBUG) console.log('Table Rows exist');
			clearInterval(checkExist);
			callbackDelay(updateElements, 250);
		}
	}, 100);
}

function updateElements() {
	var display = hideDeleteOptions ? 'none' : 'inline-block';
	var text = hideDeleteOptions ? 'Show Delete' : 'Hide Delete';
	showButton.innerText = text;
	for (var selector of selectorsList) {
		var elementList = document.querySelectorAll(selector);
		elementList.forEach(function (currentValue, currentIndex) {
			if (currentValue != undefined) currentValue.style.display = display;
		});
	}
	if (DEBUG) console.log('Selectors Run: Options ' + (hideDeleteOptions ? 'Hidden' : 'Showing'));
	addUpdateEvents();
}

function addUpdateEvents() {
	var buttonList = document.querySelectorAll('input.removeButton');
	if (buttonList.length > 0) {
		for (var button of buttonList) {
			button.addEventListener('click', clickUpdateElements, false);
		}
		if (DEBUG) console.log('Buttons updated!');
	}
	var tabsList = document.querySelectorAll('#tabsJ > ul > li > a');
	if (tabsList.length > 0) {
		for (var tab of tabsList) {
			tab.addEventListener('click', clickUpdateElements, false);
		}
		if (DEBUG) console.log('Tabs updated!');
	}
	var pagesList = document.querySelectorAll('.paginationCP a');
	if (pagesList.length > 0) {
		for (var pageNumber of pagesList) {
			pageNumber.addEventListener('click', clickUpdateElements, false);
		}
		if (DEBUG) console.log('Pagination updated!');
	}
}

function enableItemEditing() {
	var enableEditing = setInterval(function () {
		var disabledElements = document.querySelectorAll('form[name="user"] *[disabled]');
		if (DEBUG) console.log('Enabling Item Editing Form');

		for (const key in disabledElements) {
			if (Object.hasOwnProperty.call(disabledElements, key)) {
				const element = disabledElements[key];
				element.removeAttribute('disabled')
			}
		}
	}, 100);
}

function enableCheckboxCellClick() {
	var enableClicking = setInterval(function () {
		var checkboxElements = document.querySelectorAll('table#fileResults input[type="checkbox"][name^="file"]');
		if (DEBUG) console.log('Enabling Checkbox Cell Clicking');

		for (const cb of checkboxElements) {
			if (!cb.cellClick) {
				let that = cb;
				cb.parentElement.addEventListener('click', (event) => {
					// Only handle the click if the target is the cell itself
					if (event.target.nodeName === 'TD') {
						that.click();
					}
				}, false);
				cb.cellClick = true;
			}
		}
	}, 100);
}