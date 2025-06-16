// ==UserScript==
// @name         # Toonily - Enhancements
// @namespace    http://www.tgoff.me/
// @version      2024.07.17.1
// @description  Allows custom sorting of Toonily pages & Prevents the Toonily from automatically redirecting.
// @author       www.tgoff.me
// @match        *://toonily.me/*
// @match        *://*.toonily.me/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=toonily.me
// @grant        none
// @run-at       document-idle
// ==/UserScript==

var controllerContainer;
var sortHeader;
var filterHeader;
var itemContainer;
var itemList;
var lastSortBy = null;
var lastSortButton = null;
var onlyButton = null;
var onlyFilter = false;
var hideFilters = true;

var sortTypes = ['Rating', 'Votes', 'Views', 'Alphabetical', 'Chapter', 'Default'];
var sortFuncLookup = {
	'Rating': (item) => item.rating,
	'Votes': (item) => item.votes,
	'Views': (item) => item.views,
	'Alphabetical': (item) => item.name,
	'Chapter': (item) => item.chapter,
	'Default': (item) => item.intialOrder,
}
var filterTypes = {
	'action': { 'enabled': true, 'button': undefined },
	'adult': { 'enabled': true, 'button': undefined },
	'adventure': { 'enabled': true, 'button': undefined },
	'comedy': { 'enabled': true, 'button': undefined },
	'drama': { 'enabled': true, 'button': undefined },
	'fantasy': { 'enabled': true, 'button': undefined },
	'harem': { 'enabled': true, 'button': undefined },
	'mature': { 'enabled': true, 'button': undefined },
	'romance': { 'enabled': true, 'button': undefined },
	'supernatural': { 'enabled': true, 'button': undefined }
};

///////////////////////////////////////////////////////////////////////////////////////////////
// Library
var SORT_DIR = 0;
const SORT_DIR_LOOKUP = [
	//{
	//	'direction': 0,
	//	'string': ''
	//},
	{
		'direction': 1,
		'string': ' ▼'
	},
	{
		'direction': -1,
		'string': ' ▲'
	},
]

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
	return node;
};

function comp(a, b) { return a > b ? +1 : b > a ? -1 : 0; }

///////////////////////////////////////////////////////////////////////////////////////////////
// Core
(function () {
	'use strict';
	window.addEventListener("beforeunload", function (event) {
		if (!navigator.userActivation.hasBeenActive) {
			event.stopPropagation();
			event.stopImmediatePropagation();
			event.preventDefault();
			return false;
		}
		//debugger;

		let e = event || window.event;

		// For IE and Firefox prior to version 4
		if (e) {
			e.returnValue = 'Are you sure you want to leave the site?';
		}

		// For Safari
		return 'Are you sure you want to leave the site?';
	});

	const controllerParentSelector = 'div.main-container div.container__left div.section-header div.title';
	const containerSelector = 'div.main-container div.list';
	const itemSelector = 'div.book-item';

	let controllerParentContainer = document.querySelector(controllerParentSelector);
	if (!controllerParentContainer) return;
	let buttonWidth = Math.ceil(controllerParentContainer.parentElement.clientWidth / 12) + 'px';
	let paddingWidth = '10px';
	let marginWidth = '3px';

	let cssText = `
.tgSortContainer {
    margin-top: ${marginWidth};
    margin-bottom: ${marginWidth};
}

.tgSortHeader {
    margin-top: ${marginWidth};
    margin-bottom: ${marginWidth};
}

.tgSortButton {
    min-width: calc(${buttonWidth} + (${paddingWidth} * 2) + (${marginWidth} * 2));
    padding: 7px ${paddingWidth};
    margin: ${marginWidth};
    color: #FFFFFF;
    background-color: #0F2133;
    text-decoration: none;
}

.tgSortButton:focus {
    border: 2px solid rgba(0, 0, 0, 0) !important;
}

.tgFilterHide {
    display: none;
}

.tgFilteredObject {
    filter: grayscale(100%) opacity(.5);
}

.tgSortEnable {
    color: limegreen;
	text-decoration: underline limegreen solid;
}

.tgSortDisable {
    color: red;
    text-decoration: line-through red solid;
}
`;
	addStyle(cssText);

	// Use genre list to generate filters
	let genreMenu = Array.from(document.querySelectorAll('ul.header__links-list li.header__links-item.has-menu')).find(i => i.innerText === 'GENRES');
	if (genreMenu) {
		let topGenres = Object.keys(filterTypes);
		filterTypes = {};
		filterTypes['none'] = { 'enabled': true, 'button': undefined, 'hideByDefault': false };
		let genres = genreMenu.querySelectorAll('ul.genres__wrapper > li > a')
		genres.forEach(genreElem => {
			let genre = genreElem.href.replace('https://toonily.me/genres/', '');
			filterTypes[genre] = { 'enabled': true, 'button': undefined, 'hideByDefault': !topGenres.includes(genre) };
		});
	}
	console.log(filterTypes);

	controllerParentContainer.parentElement.style.display = 'flow-root';
	controllerContainer = createController(controllerParentContainer);
	itemContainer = document.querySelector(containerSelector);
	let items = itemContainer.querySelectorAll(itemSelector);
	lastSortBy = 'Default';
	itemList = getItems(items);
	sortList(itemList, lastSortBy);
})();

function createController(controllerParentContainer) {
	let controllerContainer = document.createElement('div');
	controllerContainer.classList.add('tgSortContainer');
	controllerParentContainer.insertAdjacentElement('afterend', controllerContainer);

	let controller = document.createElement('div');
	controller.style.textAlign = 'center';
	let header = document.createElement('p');
	header.innerText = 'Sort By' + SORT_DIR_LOOKUP[SORT_DIR].string;
	header.classList.add('tgSortHeader');
	controller.appendChild(header);
	sortHeader = header;

	let button;
	let split = Math.ceil(sortTypes.length / 1);
	let splitCounter = 0;
	for (let key in sortTypes) {
		//console.log('Add break after every ' + split + ' elements | Current element index: ' + splitCounter);
		if (splitCounter++ == split) { controller.appendChild(document.createElement('br')); }

		let buttonText = sortTypes[key].toString();
		button = createButton(buttonText, buttonPressSort);
		button.setAttribute('data-sortByName', buttonText);
		controller.appendChild(button);

		if (buttonText == 'Default') {
			updateSortButtonStyles(button);
			lastSortButton = button;
		}
	}
	controller.appendChild(document.createElement('br'));

	header = document.createElement('p');
	header.innerText = 'Filter By';
	header.classList.add('tgSortHeader');
	let link = document.createElement('a');
	link.href = '#';
	link.onclick = buttonPressToggleShowAllFilters;
	link.appendChild(header);
	controller.appendChild(link);
	filterHeader = header;

	split = Math.ceil(Object.keys(filterTypes).length / 1);
	splitCounter = 0;
	for (let filter in filterTypes) {
		//console.log('Add break after every ' + split + ' elements | Current element index: ' + splitCounter);
		if (splitCounter++ == split) { controller.appendChild(document.createElement('br')); }

		let buttonText = filter.replace('-', ' ').replace(/(^|\s)\S/g, t => t.toUpperCase());
		button = createButton(buttonText, buttonPressToggleFilter);
		if (filterTypes[filter].hideByDefault) button.classList.add('tgFilterHide');
		button.setAttribute('data-filterName', filter);
		controller.appendChild(button);
		filterTypes[filter].button = button;
	}
	controller.appendChild(document.createElement('br'));

	button = createButton('Only', buttonPressToggleFilterOnly);
	button.classList.add('tgSortDisable');
	controller.appendChild(button);
	onlyButton = button;

	button = createButton('Reset', resetFilters);
	controller.appendChild(button);
	controllerContainer.appendChild(controller);

	return controllerContainer;
}

function createButton(text, onclickFunc) {
	let button = document.createElement('button')
	button.innerText = text;
	button.classList.add('tgSortButton');
	button.onclick = onclickFunc;
	return button;
}

function getItems(container) {
	let itemList = [];
	if (container.length > 0) {
		for (let i = container.length - 1; i >= 0; i--) {
			let itemIn = itemToObject(container[i], i);
			itemList.push(itemIn);
		}
	}
	return itemList;
}

function refreshList(itemListIn) {
	itemListIn = itemListIn || itemList;
	itemContainer.innerHTML = '';
	let filteredList = [];
	let itemOut;
	for (let i = itemListIn.length - 1; i >= 0; i--) {
		itemOut = itemListIn[i];
		let added = true;
		for (const filter in filterTypes) {
			if (!filterTypes[filter].enabled && itemOut.genres.includes(filter)) {
				added = false;
				break;
			}
		}
		if (!added) {
			filteredList.push(itemOut);
		}
		else {
			itemContainer.appendChild(itemToHTML(itemOut));
		}
	}
	if (filteredList.length > 0) {
		filterHeader.innerText = 'Filter By | Count (' + (itemListIn.length - filteredList.length) + '/' + itemListIn.length + ')';
		for (let j = 0; j < filteredList.length; j++) {
			itemOut = filteredList[j];
			itemContainer.appendChild(itemToHTML(itemOut, true));
		}
	} else {
		filterHeader.innerText = 'Filter By | Count (' + itemListIn.length + ')';
	}
}

///////////////////////////////////////////////////////////////////////////////////////////////
// Item Conversion
function viewsToNumber(text) {
	let float = parseFloat(text);
	let multiSelect = text.replace('' + float, '');
	let multi = 1;
	switch (multiSelect) {
		case 'M':
			multi = 1000000;
			break;
		case 'k':
			multi = 1000;
			break;
	}
	return float * multi;
}

function itemToObject(item, intialOrder) {
	let itemObject = {};
	itemObject.htmlObject = item;
	itemObject.intialOrder = -intialOrder;

	itemObject.name = item.querySelector('div.meta div.title').innerText.trim();
	itemObject.views = viewsToNumber(item.querySelector('div.meta div.views').innerText.trim());
	let ratingText = item.querySelector('div.meta div.rating span.score').innerText.trim();
	itemObject.rating = parseFloat(ratingText);
	let voteText = item.querySelector('div.meta div.rating span.rate-volumes').innerText.trim();
	voteText = voteText.substring(1);
	itemObject.votes = parseFloat(voteText);
	itemObject.genres = [];
	let genreList = item.querySelectorAll('div.meta div.genres > span');
	if (!genreList || genreList < 1) {
		itemObject.genres.push('none')
	}
	else {
		genreList.forEach(i => (i.classList.forEach(c => itemObject.genres.push(c))));
	}
	itemObject.summary = item.querySelector('div.meta div.summary').innerText.trim();

	let chap = item.querySelector('div.thumb span.latest-chapter').innerText.trim();
	let chapNum = chap.replace(/Chapter/ig, '').trim();
	itemObject.chapter = parseFloat(chapNum);
	return itemObject;
}

function itemToHTML(item, grayscale) {
	item.htmlObject.classList.toggle('tgFilteredObject', grayscale || false);
	return item.htmlObject;
}

///////////////////////////////////////////////////////////////////////////////////////////////
// Sorting
function sortList(itemListIn, sortBy) {
	//let itemListIn = itemListIn || itemList;
	let _sortBy = sortBy || lastSortBy;
	let sortDir = SORT_DIR_LOOKUP[SORT_DIR].direction;
	if (_sortBy == 'Alphabetical') sortDir *= -1;
	let sortFunc = sortFuncLookup[_sortBy];

	let itemListOut = itemListIn.map(x => x);
	itemListOut.sort(function (a, b) {
		let _a = sortFunc(a);
		let _b = sortFunc(b);
		return comp(_a, _b) * sortDir;
	});
	refreshList(itemListOut);
}

function changeSortDirection() {
	let next = SORT_DIR + 1;
	SORT_DIR = next % SORT_DIR_LOOKUP.length;
	sortHeader.innerText = 'Sort By' + SORT_DIR_LOOKUP[SORT_DIR].string;
}

///////////////////////////////////////////////////////////////////////////////////////////////
// Button Actions
function buttonPressSort() {
	var attrib = this.getAttribute('data-sortByName');
	if (lastSortBy != attrib) {
		lastSortBy = attrib;
		updateSortButtonStyles(this);
	}
	else {
		changeSortDirection();
	}
	sortList(itemList);
}

function buttonPressToggleFilter() {
	var filter = this.getAttribute('data-filterName');
	if (onlyFilter || window.event.ctrlKey) {
		filterSingleType(filter);
	} else {
		setFilterEnabledAndUpdate(!filterTypes[filter].enabled, filter);
	}
	refreshList();
}

function buttonPressToggleFilterOnly() {
	onlyFilter = !onlyFilter;
	this.classList.toggle('tgSortEnable');
	this.classList.toggle('tgSortDisable');
	refreshList();
}

function buttonPressToggleShowAllFilters() {
	hideFilters = !hideFilters;
	for (let filterKey in filterTypes) {
		if (filterTypes[filterKey].enabled && filterTypes[filterKey].hideByDefault) {
			filterTypes[filterKey].button.classList.toggle('tgFilterHide', hideFilters);
		}
	}
}

///////////////////////////////////////////////////////////////////////////////////////////////
// Filter Update
function filterSingleType(filter) {
	for (let filterKey in filterTypes) {
		setFilterEnabledAndUpdate((filterKey == filter), filterKey);
	}
}

function setFilterEnabledAndUpdate(bool, filter) {
	filterTypes[filter].enabled = bool;
	updateStyleRedForOff(filterTypes[filter].enabled, filterTypes[filter].button);
}

function resetFilters() {
	onlyFilter = false;
	for (let filterKey in filterTypes) {
		setFilterEnabledAndUpdate(true, filterKey)
	}
	updateStyleRedForOff(onlyFilter, onlyButton);
	refreshList();
}

///////////////////////////////////////////////////////////////////////////////////////////////
// Style Updates
function updateSortButtonStyles(button) {
	button.classList.add('tgSortEnable');
	if (lastSortButton != null) {
		lastSortButton.classList.remove('tgSortEnable');
	}
	lastSortButton = button;
}

function updateStyleGreenForOn(bool, button) {
	button.classList.toggle('tgSortEnable', bool);
}

function updateStyleRedForOff(bool, button) {
	button.classList.toggle('tgSortDisable', !bool);
}