// ==UserScript==
// @name         # Twitch Heroes - Inventory Management
// @namespace    http://www.tgoff.me/
// @version      2023.07.14.1
// @description  Adds some helpful buttons for Sorting and Filtering your inventory.
// @author       www.tgoff.me
// @match        *://twitch-heroes.com/equipped
// @match        *://*.twitch-heroes.com/equipped
// @require      http://tgoff.me/tamper-monkey/tg-lib.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=twitch-heroes.com
// @grant        none
// @run-at       document-idle
// ==/UserScript==

var equippedContainer;
var inventoryContainer;
var onlyButton;
var lastSortButton = null;
var inventoryList;
var groupQuality = true;
var groupType = false;
var groupMaterial = false;
var lastSortBy = null;
var filterNone = true;
var filterOnly = false;
var attributeTypes = ['Damage', 'Intelligence', 'Strength', 'Dexterity', 'Crit', 'Health', 'Armor', 'Lifesteal', 'Quality'];
var armorTypes = {
	'Helmet': { 'enabled': true, 'button': undefined },
	'Armor': { 'enabled': true, 'button': undefined },
	'Gloves': { 'enabled': true, 'button': undefined },
	'Leggings': { 'enabled': true, 'button': undefined },
	'Boots': { 'enabled': true, 'button': undefined },
	'Weapon': { 'enabled': true, 'button': undefined },
	'Belt': { 'enabled': true, 'button': undefined },
	'Necklace': { 'enabled': true, 'button': undefined },
	'Ring': { 'enabled': true, 'button': undefined }
};
var materialTypes = {
	'Sapphire': 8,
	'Ruby': 7,
	'Emerald': 6,
	'Diamond': 5,
	'Gold': 4,
	'Steel': 3,
	'Iron': 2,
	'Leather': 1,
	'Wooden': 1
};

(function () {
	'use strict';
	document.querySelectorAll('#nav')[0].nextSibling.remove();
	equippedContainer = document.querySelectorAll('.equipment > .items')[0];
	createController();
	var equipped = equippedContainer.getElementsByClassName('item');
	inventoryContainer = document.querySelectorAll('.inventory > .items')[0];
	var inventory = inventoryContainer.getElementsByClassName('item');
	lastSortBy = 'Quality';
	inventoryList = sortListByAttribute(getItems(inventory), lastSortBy);
	refreshInventory();
})();

function buttonPressSort() {
	var attrib = this.getAttribute('data-attribName');
	if (lastSortBy != attrib) {
		lastSortBy = attrib;
		updateSortButtonStyles(this);
		sortSelector();
		refreshInventory();
	}
}
function updateSortButtonStyles(button) {
	button.style.color = 'limegreen';
	button.style.textDecoration = 'underline limegreen solid';
	if (lastSortButton != null) {
		lastSortButton.style.color = 'white';
		lastSortButton.style.textDecoration = 'none';
	}
	lastSortButton = button;
}

function buttonPressToggleGroupQuality() {
	groupQuality = !groupQuality;
	if (lastSortBy != null) sortSelector();
	updateStyleGreenForOn(groupQuality, this);
	refreshInventory();
}
function buttonPressToggleGroupType() {
	groupType = !groupType;
	if (lastSortBy != null) sortSelector();
	updateStyleGreenForOn(groupType, this);
	refreshInventory();
}
function buttonPressToggleGroupMaterial() {
	groupMaterial = !groupMaterial;
	if (lastSortBy != null) sortSelector();
	updateStyleGreenForOn(groupMaterial, this);
	refreshInventory();
}

function updateStyleGreenForOn(bool, button) {
	if (bool) {
		button.style.color = 'limegreen';
		button.style.textDecoration = 'underline limegreen solid';
	} else {
		button.style.color = 'white';
		button.style.textDecoration = 'none';
	}
}
function updateStyleRedForOff(bool, button) {
	if (bool) {
		button.style.color = 'white';
		button.style.textDecoration = 'none';
	} else {
		button.style.color = 'red';
		button.style.textDecoration = 'line-through red solid';
	}
}

function sortSelector() {
	console.log('Sort by: ' + lastSortBy + ' | Group by: ' + (groupQuality ? 'Quality ' : '') + (groupType ? 'Type ' : '') + (groupMaterial ? 'Material' : ''));
	var funcList = [];
	if (groupType || groupQuality || groupMaterial) {
		if (groupType) funcList.push(compareByType);
		if (groupQuality) funcList.push(compareByQuality);
		if (groupMaterial) funcList.push(compareByMaterial);
		funcList.push(compareByAttributeList);
		inventoryList = sortListByFuncListThenAttribute(inventoryList, funcList, lastSortBy);
	} else {
		inventoryList = sortListByAttribute(inventoryList, lastSortBy);
	}
}

function buttonPressToggleFilterArmor() {
	filterNone = false;
	var armor = this.getAttribute('data-armorName');
	if (filterOnly || window.event.ctrlKey) {
		filterSingleType(armor);
	} else {
		setArmorEnabledAndUpdate(!armorTypes[armor].enabled, armor);
	}
	refreshInventory();
}

function buttonPressToggleFilterOnly() {
	filterOnly = !filterOnly;
	if (filterOnly) {
		updateStyleGreenForOn(filterOnly, this);
	} else {
		updateStyleRedForOff(filterOnly, this);
	}
	refreshInventory();
}

function filterSingleType(armor) {
	for (var armorKey in armorTypes) {
		setArmorEnabledAndUpdate((armorKey == armor), armorKey);
	}
}

function setArmorEnabledAndUpdate(bool, armor) {
	armorTypes[armor].enabled = bool;
	updateStyleRedForOff(armorTypes[armor].enabled, armorTypes[armor].button);
}

function resetFilters() {
	filterNone = true;
	filterOnly = false;
	for (var armor in armorTypes) {
		setArmorEnabledAndUpdate(true, armor)
	}
	updateStyleRedForOff(filterOnly, onlyButton);
	refreshInventory();
}

function createController() {
	equippedContainer.style.maxWidth = '600px';
	equippedContainer.style.marginLeft = 'auto';
	equippedContainer.style.marginRight = 'auto';
	var controller = document.createElement('div');
	controller.style.textAlign = 'center';
	var header = document.createElement('p');
	header.innerText = 'Sort By';
	header.style.marginTop = '3px';
	header.style.marginBottom = '3px';
	controller.appendChild(header);
	var button;
	var split = Math.ceil(attributeTypes.length / 2);
	var splitCounter = 0;
	for (var key in attributeTypes) {
		button = document.createElement('button')
		var attribute = attributeTypes[key].toString();
		if (splitCounter++ == split) { controller.appendChild(document.createElement('br')); }
		button.innerText = attribute;
		button.style.margin = '3px';
		button.setAttribute('data-attribName', attribute);
		button.onclick = buttonPressSort;
		if (attribute == 'Quality') {
			updateSortButtonStyles(button);
			lastSortButton = button;
		}
		controller.appendChild(button);
	}
	controller.appendChild(document.createElement('br'));
	header = document.createElement('p');
	header.innerText = 'Group By';
	header.style.marginTop = '3px';
	header.style.marginBottom = '3px';
	controller.appendChild(header);
	button = document.createElement('button')
	button.innerText = 'Quality';
	button.style.margin = '3px';
	button.onclick = buttonPressToggleGroupQuality;
	updateStyleGreenForOn(groupQuality, button);
	controller.appendChild(button);
	button = document.createElement('button')
	button.innerText = 'Armor Type';
	button.style.margin = '3px';
	button.onclick = buttonPressToggleGroupType;
	updateStyleGreenForOn(groupType, button);
	controller.appendChild(button);
	button = document.createElement('button')
	button.innerText = 'Material';
	button.style.margin = '3px';
	button.onclick = buttonPressToggleGroupMaterial;
	updateStyleGreenForOn(groupMaterial, button);
	controller.appendChild(button);
	controller.appendChild(document.createElement('br'));
	header = document.createElement('p');
	header.innerText = 'Filter By';
	header.style.marginTop = '3px';
	header.style.marginBottom = '3px';
	controller.appendChild(header);
	split = Math.ceil(Object.keys(armorTypes).length / 2);
	splitCounter = 0;
	console.log(armorTypes);
	for (var armor in armorTypes) {
		button = document.createElement('button');
		armorTypes[armor].button = button;
		console.log(split);
		console.log(splitCounter);
		if (splitCounter++ == split) { controller.appendChild(document.createElement('br')); }
		button.innerText = armor;
		button.style.margin = '3px';
		button.setAttribute('data-armorName', armor);
		button.onclick = buttonPressToggleFilterArmor;
		updateStyleRedForOff(true, button);
		controller.appendChild(button);
	}
	controller.appendChild(document.createElement('br'));
	button = document.createElement('button')
	button.innerText = 'Only';
	button.style.margin = '3px';
	button.onclick = buttonPressToggleFilterOnly;
	updateStyleRedForOff(false, button);
	onlyButton = button;
	controller.appendChild(button);
	button = document.createElement('button')
	button.innerText = 'Reset';
	button.style.margin = '3px';
	button.onclick = resetFilters;
	controller.appendChild(button);
	equippedContainer.insertAdjacentElement('afterend', controller);
}

function sortListByAttribute(itemList, attribute) {
	var attributeList = getAttributeList(attribute);
	return sortListByAttributeList(itemList, attributeList);
}
function sortListByAttributeList(itemList, attributeList) {
	itemList.sort(function (a, b) {
		var result = compareByAttributeList(a, b, attributeList);
		return result;
	});
	return itemList;
}

function sortListByFuncThenAttribute(itemList, funcA, attribute) {
	var attributeList = getAttributeList(attribute);
	var funcList = [funcA];
	return sortListByFuncListThenAttributeList(itemList, funcList, attributeList);
}
function sortListByFuncThenAttributeList(itemList, funcA, attributeList) {
	var funcList = [funcA];
	return sortListByFuncListThenAttributeList(itemList, funcList, attributeList);
}
function sortListByFuncListThenAttribute(itemList, funcList, attribute) {
	var attributeList = getAttributeList(attribute);
	return sortListByFuncListThenAttributeList(itemList, funcList, attributeList);
}
function sortListByFuncListThenAttributeList(itemList, funcList, attributeList) {
	funcList.push(compareByAttributeList);
	itemList.sort(function (a, b) {
		var result = 0;
		for (var key in funcList) {
			var func = funcList[key];
			if (result != 0) break;
			result = func(a, b, attributeList);
		}
		return result;
	});
	return itemList;
}

function compareByQuality(a, b) {
	return comp(a.attributes['Quality'], b.attributes['Quality']);
}
function compareByType(a, b) {
	return comp(a.type, b.type);
}
function compareByMaterial(a, b) {
	return comp(materialTypes[a.material], materialTypes[b.material]);
}
function compareByAttribute(a, b, attribute) {
	var attributeList = getAttributeList(attribute);
	return compareByAttributeList(a, b, attributeList);
}
function compareByAttributeList(a, b, attributeList) {
	var result = 0;
	for (var key in attributeList) {
		var attribute = attributeList[key];
		if (result == 0) {
			result = comp(defaultFor(a.attributes[attribute], 0), defaultFor(b.attributes[attribute], 0));
		} else {
			break;
		}
	}
	return result;
}

function refreshInventory() {
	inventoryContainer.innerHTML = '';
	var filteredList = [];
	var itemOut;
	for (var i = inventoryList.length - 1; i >= 0; i--) {
		itemOut = inventoryList[i];
		var added = false;
		for (var armor in armorTypes) {
			if (armorTypes[armor].enabled && itemOut.type == armor) {
				inventoryContainer.appendChild(itemToHTML(itemOut));
				added = true;
			}
		}
		if (!added) { filteredList.push(itemOut); }
	}
	if (filteredList.length > 0) {
		inventoryContainer.parentElement.firstElementChild.innerText = 'Inventory (' + (inventoryList.length - filteredList.length) + '/' + inventoryList.length + '/100)';
		for (var j = 0; j < filteredList.length; j++) {
			itemOut = filteredList[j];
			inventoryContainer.appendChild(itemToHTML(itemOut, true));
		}
	} else {
		inventoryContainer.parentElement.firstElementChild.innerText = 'Inventory (' + inventoryList.length + '/100)';
	}
}

function getPrice(item) {
	var price = 0;
	for (var key in item.attributes) {
		if (item.attributes.hasOwnProperty(key)) {
			var value = item.attributes[key];

			if (value > 0) {
			}
		}
	}
}

function getAttributeList(attribute) {
	var attributeList = [];
	if (attribute == 'Damage') {
		attributeList.push('DamageHi');
		attributeList.push('DamageLo');
		attributeList.push('Damage');
		// Tie Breakers
		attributeList.push('Lifesteal');
	} else {
		attributeList.push(attribute);
		// Tie Breakers
		attributeList.push('Armor');
		attributeList.push('Health');
	}

	return attributeList;
}

function getItems(container) {
	var itemList = [];
	if (container.length > 0) {
		for (var i = container.length - 1; i >= 0; i--) {
			var itemIn = itemToObject(container[i]);
			itemList.push(itemIn);
		}
	}
	return itemList;
}

function itemToObject(item) {
	var itemObject = {};
	itemObject.name = item.getElementsByClassName('name')[0].innerText.trim();
	itemObject.material = itemObject.name.split(' ')[0];
	itemObject.type = itemObject.name.split(' ')[1];
	if (itemObject.type == 'Bow' || itemObject.type == 'Dagger' || itemObject.type == 'Staff' || itemObject.type == 'Sword') itemObject.type = 'Weapon';
	itemObject.image = item.querySelectorAll('.name > img')[0].src;
	itemObject.attributes = [];
	itemObject.attributes['Quality'] = parseInt(item.className.substring('item quality'.length));
	itemObject.buttons = item.getElementsByClassName('buttons')[0].innerHTML.replace(/(\s){2,}/g, ' ');;
	var statContainer = item.getElementsByClassName('stats')[0];
	var statHTML = statContainer.innerHTML.replace(/(\s){2,}/g, ' ');
	var statRegExp = /((?:[0-9]+ - )?[0-9]+(?: %)?) ([a-zA-Z]+)(?: <br>)/g, statMatches;
	while (statMatches = statRegExp.exec(statHTML)) {
		var match = statMatches[0];
		var value = statMatches[1];
		var attribute = statMatches[2];
		switch (attribute) {
			case 'Damage':
				var temp = value.split(' - ')
				if (temp.length > 1) {
					itemObject.attributes[attribute + 'Lo'] = parseInt(temp[0]);
					itemObject.attributes[attribute + 'Hi'] = parseInt(temp[1]);
				} else {
					itemObject.attributes[attribute] = parseInt(value);
				}
				break;
			default:
				itemObject.attributes[attribute] = parseInt(value);
				break;
		}
	}
	return itemObject;
}

function itemToHTML(item, grayscale) {
	if (grayscale === undefined) grayscale = false;
	var result = document.createElement('div');
	if (grayscale) { result.style.filter = 'grayscale(100%) opacity(.5)'; }
	result.classList.add('item');
	result.classList.add('quality' + item.attributes['Quality']);
	var nameContainer = document.createElement('div');
	nameContainer.classList.add('name');
	nameContainer.style.marginBottom = '5px';
	var img = document.createElement('img');
	img.classList.add('itemImage');
	img.style.height = '25px';
	img.style.width = '25px';
	img.style.marginRight = '3px';
	img.style.verticalAlign = 'middle';
	img.src = item.image;
	nameContainer.appendChild(img);
	var name = document.createElement('span');
	name.classList.add('itemName');
	name.innerText = item.name;
	name.style.fontFamily = '\'Helvetica Neue\', \'Helvetica\', Helvetica, Arial, sansSerif';
	name.style.fontStyle = 'normal';
	name.style.fontWeight = 'bold';
	name.style.textRendering = 'optimizeLegibility';
	name.style.color = 'inherit';
	name.style.height = '1.5em';
	name.style.display = 'inline-block';
	name.style.fontSize = '1em';
	name.style.textAlign = 'center';
	name.style.backgroundColor = '#2B253F';
	name.style.lineHeight = '1.25em';
	nameContainer.appendChild(name);
	result.appendChild(nameContainer);
	var statsContainer = document.createElement('div');
	statsContainer.classList.add('statsContainer');
	var stats = document.createElement('div');
	stats.classList.add('stats');
	var attrib;
	for (var key in item.attributes) {
		if (item.attributes.hasOwnProperty(key)) {
			var value = item.attributes[key];

			if (value > 0) {
				switch (key) {
					case 'Quality':
					case 'DamageHi':
						continue;
					case 'DamageLo':
						value = item.attributes['DamageLo'] + ' - ' + item.attributes['DamageHi'];
						key = 'Damage';
						break;
					case 'Crit':
					case 'Lifesteal':
						value = value + ' %';
						break;
					default:
						break;
				}

				attrib = document.createElement('span');
				attrib.classList.add(key.toLowerCase());
				attrib.style.fontFamily = '\'Helvetica Neue\', \'Helvetica\', Helvetica, Arial, sansSerif';
				attrib.style.fontStyle = 'normal';
				attrib.style.fontWeight = 'bold';
				attrib.style.textRendering = 'optimizeLegibility';
				attrib.style.color = 'white';
				attrib.style.display = 'inline-block';
				attrib.style.fontSize = '1em';
				attrib.style.textAlign = 'center';
				attrib.style.backgroundColor = '#2B253F';
				attrib.style.lineHeight = '1.25em';
				attrib.innerText = value + ' ' + key;
				stats.appendChild(attrib);
				stats.appendChild(document.createElement('br'));
			}
		}
	}
	statsContainer.appendChild(stats);
	result.appendChild(statsContainer);
	var buttons = document.createElement('div');
	buttons.classList.add('buttons');
	buttons.innerHTML = item.buttons;
	result.appendChild(buttons);
	return result;
}