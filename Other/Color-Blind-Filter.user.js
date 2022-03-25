// ==UserScript==
// @name         General - Colour Blind Filter
// @namespace    http://www.tgoff.me/
// @version      2021.12.04.1
// @description  Simulates the website as a color vision impaired person would see. Based on leocardz.com's Chrome Extension Colorblinding. Which is based on SVG data at https://github.com/Altreus/colourblind and Data matrices at http://web.archive.org/web/20081014161121/http://www.colorjack.com/labs/colormatrix/
// @author       www.tgoff.me
// @match        *://*/*
// @noframes
// @grant        none
// @run-at       document-idle
// ==/UserScript==

let simulations = {
	'Red-Blind': 'protanopia',
	'Green-Blind': 'deuteranopia',
	'Blue-Blind': 'tritanopia',
	'Red-Weak': 'protanomaly',
	'Green-Weak': 'deuteranomaly',
	'Blue-Weak': 'tritanomaly',
	'Monochromacy': 'achromatopsia',
	'Blue Cone Monochromacy': 'achromatomaly',
	'None': 'none',
	'Initial': 'init',
};

let filterElement =
	'<svg id="colorBlindSVG" version="1.1" xmlns="http://www.w3.org/2000/svg" baseProfile="full">' +
	'<filter id="protanopia">' +
	'<feColorMatrix type="matrix" values="0.567, 0.433, 0, 0, 0, 0.558, 0.442, 0, 0, 0, 0, 0.242, 0.758, 0, 0, 0, 0, 0, 1, 0" in="SourceGraphic"></feColorMatrix>' +
	'</filter>' +
	'<filter id="protanomaly">' +
	'<feColorMatrix type="matrix" values="0.817,0.183,0,0,0 0.333,0.667,0,0,0 0,0.125,0.875,0,0 0,0,0,1,0" in="SourceGraphic"></feColorMatrix>' +
	'</filter>' +
	'<filter id="deuteranopia">' +
	'<feColorMatrix type="matrix" values="0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0" in="SourceGraphic"></feColorMatrix>' +
	'</filter>' +
	'<filter id="deuteranomaly">' +
	'<feColorMatrix type="matrix" values="0.8,0.2,0,0,0 0.258,0.742,0,0,0 0,0.142,0.858,0,0 0,0,0,1,0" in="SourceGraphic"></feColorMatrix>' +
	'</filter>' +
	'<filter id="tritanopia">' +
	'<feColorMatrix type="matrix" values="0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0" in="SourceGraphic"></feColorMatrix>' +
	'</filter>' +
	'<filter id="tritanomaly">' +
	'<feColorMatrix type="matrix" values="0.967,0.033,0,0,0 0,0.733,0.267,0,0 0,0.183,0.817,0,0 0,0,0,1,0" in="SourceGraphic"></feColorMatrix>' +
	'</filter>' +
	'<filter id="achromatopsia">' +
	'<feColorMatrix type="matrix" values="0.299,0.587,0.114,0,0 0.299,0.587,0.114,0,0 0.299,0.587,0.114,0,0 0,0,0,1,0" in="SourceGraphic"></feColorMatrix>' +
	'</filter>' +
	'<filter id="achromatomaly">' +
	'<feColorMatrix type="matrix" values="0.618,0.320,0.062,0,0 0.163,0.775,0.062,0,0 0.163,0.320,0.516,0,0 0,0,0,1,0" in="SourceGraphic"></feColorMatrix>' +
	'</filter>' +
	'<filter id="none">' +
	'</filter>' +
	'</svg>';

let cssText = `
#ColorBlindToggleContainer {
	position: fixed;
	background: none;
	bottom: 1px;
	right: ` + (document.querySelector('#CSSToggleContainer') ? 'calc(1px + 14px + 1px)' : '1px') + `;
	height: 14px;
	width: 14px;
	z-index: 2147483647;
}

.ColorBlindToggleLabel {
	display: block;
	text-align: right;
	color: #F2F2F2;
	font-family: system-ui;
	font-size: medium;
	font-weight: 500;
	line-height: normal;
	text-shadow: 1px 1px black, -1px -1px black, -1px 1px black, 1px -1px black;
}

input[id*="ColorBlindToggleRadioButton"] {
	float: none;
	margin-left: 10px;
}

#ColorBlindToggleContainer .ColorBlindToggleLabel {
	display: none;
	visibility: hidden;
}

#ColorBlindToggleContainer:hover {
	height: unset;
	width: unset;
}

#ColorBlindToggleContainer:hover .ColorBlindToggleLabel {
	display: block;
	visibility: visible;
}
`;

let filterBackup;
(function () {
	'use strict';
	setTimeout(function () {
		let container = document.createElement('div');
		container.id = 'ColorBlindToggleContainer';
		document.body.appendChild(container);

		let filterDiv = document.createElement('div');
		filterDiv.id = 'colorBlindFilters';
		filterDiv.style.width = '0px';
		filterDiv.style.height = '0px';
		filterDiv.style.display = 'none';
		filterDiv.innerHTML = filterElement;
		container.appendChild(filterDiv);

		_addStyle(cssText);
		for (const name in simulations) {
			let id = simulations[name];
			let radio = _addColorBlindToggle(container, name, id);
		}
	}, 500);
})();

function _addStyle(css) {
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

function _addColorBlindToggle(container, name, id) {
	let nameKey = id.toUpperCase();

	let radio = document.createElement('input');
	radio.type = 'radio';
	radio.name = 'ColorBlindFilters';
	let thisId = 'ColorBlindToggleRadioButton_' + nameKey;
	radio.id = thisId;

	if (id === 'init') {
		let htmlElement = document.getElementsByTagName('html')[0];
		filterBackup = htmlElement.style.filter;
		radio.onclick = function () {
			let htmlElement = document.getElementsByTagName('html')[0];
			htmlElement.style.filter = filterBackup;
		};
		radio.setAttribute("checked", "checked");
		radio.checked = true;
	}
	else {
		radio.onclick = function () {
			let htmlElement = document.getElementsByTagName('html')[0];
			htmlElement.style.filter = 'url(#' + id + ')';
		};
	}

	let label = document.createElement('label');
	label.setAttribute('for', thisId);
	label.innerText = name;
	label.classList.add('ColorBlindToggleLabel');

	label.appendChild(radio);
	container.appendChild(label);
	return radio;
};