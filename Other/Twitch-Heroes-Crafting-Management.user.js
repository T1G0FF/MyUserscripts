// ==UserScript==
// @name         # Twitch Heroes - Crafting Management
// @namespace    http://www.tgoff.me/
// @version      2019.02.06.1
// @description  Adds some helpful buttons for Resource management and Crafting.
// @author       www.tgoff.me
// @match        *://twitch-heroes.com/crafting
// @match        *://*.twitch-heroes.com/crafting
// @icon         https://www.google.com/s2/favicons?sz=64&domain=twitch-heroes.com
// @grant        none
// @run-at       document-idle
// ==/UserScript==

var resourceStone;
var resourceWood;
var convertInput;
var convertSelect;
var convertButton;
var craftingRows;

(function () {
	'use strict';
	var nodes = document.querySelectorAll('#search > h4');
	convertInput = document.querySelectorAll('input[name="amount"]')[0];
	convertSelect = document.querySelectorAll('select[name="resource"]')[0];
	convertButton = document.querySelectorAll('button[name="convert"]')[0];
	resourceStone = parseInt(nodes[4].innerText);
	resourceWood = parseInt(nodes[5].innerText);
	craftingRows = Array.prototype.slice.call(document.querySelectorAll('table#search tr'), 6);
	createController()
})();

function createController() {
	var button
	button = document.createElement('button')
	button.innerText = 'Convert';
	button.style.margin = '3px';
	button.style.width = '70px';
	button.onclick = convertButtonClick;
	convertButton.insertAdjacentElement('beforebegin', button);
	convertButton.insertAdjacentElement('beforebegin', document.createElement('br'));
	button = document.createElement('button')
	button.innerText = 'Equalise';
	button.style.margin = '3px';
	button.style.width = '70px';
	button.onclick = equalise;
	convertButton.insertAdjacentElement('beforebegin', button);
	convertButton.style.display = 'none';
	for (var key in craftingRows) {
		var craftButton = craftingRows[key].querySelectorAll('button[name="craft"]')[0];
		var costCell = craftingRows[key].querySelectorAll('td#search > h4')[1];
		var resourceCost = parseInt(costCell.firstChild.wholeText);
		craftButton.style.margin = '3px';
		craftButton.style.width = '150px';
		craftButton.style.display = 'inline-block';
		craftButton.parentElement.style.minWidth = '160px';
		craftButton.parentElement.style.textAlign = 'left';
		button = document.createElement('button')
		button.innerText = 'Max';
		button.style.width = '72px';
		button.style.margin = '3px';
		button.style.display = 'inline-block';
		button.setAttribute('name', 'Max');
		button.setAttribute('id', 'craft');
		button.setAttribute('value', craftButton.value);
		button.setAttribute('data-resourceCost', resourceCost);
		button.setAttribute('data-craftingRowKey', key);
		button.onclick = buttonPressCraftMax;
		craftButton.insertAdjacentElement('afterend', button);
		button = document.createElement('button')
		button.innerText = '+10';
		button.style.minWidth = '72px';
		button.style.margin = '3px';
		button.style.display = 'inline-block';
		button.setAttribute('name', 'Ten');
		button.setAttribute('id', 'craft');
		button.setAttribute('value', craftButton.value);
		button.setAttribute('data-resourceCost', resourceCost);
		button.setAttribute('data-craftingRowKey', key);
		button.onclick = buttonPressCraft10;
		craftButton.insertAdjacentElement('afterend', button);
		craftButton.insertAdjacentElement('afterend', document.createElement('br'));
	}
}

function buttonPressCraft10() {
	var cost = this.getAttribute('data-resourceCost');
	var key = this.getAttribute('data-craftingRowKey');
	var craftInput = craftingRows[key].querySelectorAll('input[name="amount"]')[0];
	var craftButton = craftingRows[key].querySelectorAll('button[name="craft"]')[0];
	var num = getCraftMax(cost)
	craftInput.value = num > 10 ? 10 : num;
	craftButton.click();
}
function buttonPressCraftMax() {
	var cost = this.getAttribute('data-resourceCost');
	var key = this.getAttribute('data-craftingRowKey');
	var craftInput = craftingRows[key].querySelectorAll('input[name="amount"]')[0];
	var craftButton = craftingRows[key].querySelectorAll('button[name="craft"]')[0];
	craftInput.value = getCraftMax(cost);
	craftButton.click();
}

function getCraftMax(cost) {
	var min = resourceStone < resourceWood ? resourceStone : resourceWood;
	return Math.floor(min / cost);
}

function equalise() {
	var difference = resourceStone - resourceWood;
	var change = Math.abs(difference / 3) * 2;
	console.log('(' + difference + ' / 3) x 2 = ' + change);
	convertInput.value = Math.floor(change);
	if (Math.abs(difference) > 2) {
		if (difference > 0) {
			convertSelect.selectedIndex = 0;
		} else {
			convertSelect.selectedIndex = 1;
		}
	}
	convertButton.click();
}

function convertButtonClick() {
	convertButton.click();
}