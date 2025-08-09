// ==UserScript==
// @name         # General - Accessibility Menu (Colour Blind Filter, ADHD Friendly Reading Mask)
// @namespace    http://www.tgoff.me/
// @version      2025.08.09.1
// @description  Simulates the website as a color vision impaired person would see. Based on leocardz.com's Chrome Extension Colorblinding. Which is based on SVG data at https://github.com/Altreus/colourblind and Data matrices at http://web.archive.org/web/20081014161121/http://www.colorjack.com/labs/colormatrix/
// @author       www.tgoff.me
// @match        *://*/*
// @noframes
// @grant        GM_addElement
// @run-at       document-body
// ==/UserScript==

let colorBlindFilter = {
	enabled: window.localStorage.getItem('colorBlindFilterEnabled') ?? 'init',
	initialBackup: {},
	simulations: {
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
	},
	svgElement:
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
		'</svg>',

}

let readingMask = {
	enabled: window.localStorage.getItem('readingMaskEnabled') ?? false,
	topElement: {},
	bottomElement: {},
	create: function () {
		if (document.querySelectorAll('.ReadingMaskTop').length) return;

		document.body.classList.add('ReadingMask');
		readingMask.topElement = document.createElement('div');
		readingMask.topElement.classList.add('ReadingMaskTop');
		document.body.appendChild(readingMask.topElement);
		readingMask.bottomElement = document.createElement('div');
		readingMask.bottomElement.classList.add('ReadingMaskBottom');
		document.body.appendChild(readingMask.bottomElement);
		document.addEventListener('mousemove', readingMask.move);
		document.addEventListener('click', readingMask.move);
	},
	move: function (event) {
		let mouseY = event.clientY;
		let readingMaskHeight = (window.outerHeight + window.innerHeight) * 0.075;
		let halfHeight = Math.round(readingMaskHeight / 2);
		readingMask.topElement.style.height = mouseY - halfHeight + 'px';
		readingMask.bottomElement.style.top = mouseY + halfHeight + 'px';
	},
	remove: function () {
		document.body.classList.remove('ReadingMask');
		readingMask.topElement.remove();
		readingMask.bottomElement.remove();
		document.removeEventListener('mousemove', readingMask.move);
		document.removeEventListener('click', readingMask.move);
	}
}

let readingGuide = {
	enabled: window.localStorage.getItem('readingGuideEnabled') ?? false,
	guideElement: {},
	create: function () {
		if (document.querySelectorAll('.ReadingGuide').length) return;

		document.body.classList.add('ReadingGuide');
		readingGuide.guideElement = document.createElement('div');
		readingGuide.guideElement.classList.add('ReadingGuideRuler');
		document.body.appendChild(readingGuide.guideElement);
		document.addEventListener('mousemove', readingGuide.move);
		document.addEventListener('click', readingGuide.move);
	},
	move: function (event) {
		let mouseX = event.clientX;
		let mouseY = event.clientY;
		let readingGuideWidth = window.innerWidth * 0.4;
		let halfWidth = Math.round(readingGuideWidth / 2);
		let readingGuideHeight = 12;//(window.outerHeight + window.innerHeight) * 0.015;
		let halfHeight = Math.round(readingGuideHeight / 2);
		let left = Math.min(Math.max(mouseX - halfWidth, 0), window.innerWidth - readingGuideWidth);
		readingGuide.guideElement.style.left = left + 'px';
		readingGuide.guideElement.style.top = mouseY - halfHeight + 'px';
		readingGuide.guideElement.style.pointerEvents = 'none';
	},
	remove: function () {
		document.body.classList.remove('ReadingGuide');
		readingGuide.guideElement.remove();
		document.removeEventListener('mousemove', readingGuide.move);
		document.removeEventListener('click', readingGuide.move);
	}
}

let darkMode = {
	enabled: window.localStorage.getItem('darkModeEnabled') ?? 0
}

let cssText = `
#AccessibilityToggleContainer {
	position: fixed;
	background: none;
	bottom: 1px;
	right: ${(document.querySelector('#CSSToggleContainer') ? 'calc(1px + 14px + 1px)' : '1px')};
	height: 14px;
	width: 14px;
	z-index: 2147483647;
}

.AccessibilityToggleLabel {
	display: block;
	text-align: right;
	color: #F2F2F2;
	font-family: system-ui;
	font-size: medium;
	font-weight: 500;
	line-height: normal;
	text-shadow: 1px 1px black, -1px -1px black, -1px 1px black, 1px -1px black;
}

#AccessibilityToggleContainer input {
	float: none;
	margin-left: 10px;
}

#AccessibilityToggleContainer .AccessibilityToggleLabel {
	display: none;
	visibility: hidden;
}

#AccessibilityToggleContainer:hover {
	height: unset;
	width: unset;
}

#AccessibilityToggleContainer:hover .AccessibilityToggleLabel {
	display: block;
	visibility: visible;
}

body.ReadingMask .ReadingMaskTop,
body.ReadingMask .ReadingMaskBottom {
	display: block;
	position: fixed;
	left: 0;
	right: 0;
	width: 100%;
	background-color: rgba(0, 0, 0, 0.7);
	z-index: 999999;
}

body.ReadingMask .ReadingMaskTop {
	top: 0;
	bottom: auto;
}

body.ReadingMask .ReadingMaskBottom {
	bottom: 0;
	top: auto;
}

body.ReadingGuide .ReadingGuideRuler {
	background: #000000;
	border: 2px solid #FFFF00;
	display: block;
	position: fixed;
	left: 0;
	right: 0;
	width: 40vw;
	min-width: 200px;
	height: 12px;
	z-index: 999999;
}

html.genericDarkmode,
html.genericDarkmodeExImages {
    background-color: #FFFFFF !important;
	filter: hue-rotate(180deg) invert(1);
}

html.genericDarkmodeExImages img {
    filter: hue-rotate(180deg) invert(1);
}
`;

(function () {
	'use strict';
	setTimeout(function () {
		let container = document.createElement('div');
		container.id = 'AccessibilityToggleContainer';
		document.body.appendChild(container);

		_addStyle(cssText);
		_addReadingMaskToggle(container);
		_addReadingGuideToggle(container);
		_addGenericDarkmodeToggle(container);
		_addColorBlindToggles(container);

		setTimeout(function () {
			let container = document.querySelector('#AccessibilityToggleContainer');
			container.style.right = document.querySelector('#CSSToggleContainer') ? 'calc(1px + 14px + 1px)' : '1px';
		}, 500);
	}, 500);
})();

function _addStyle(css) {
	let node = {};
	let heads = document.getElementsByTagName('head');
	if (heads.length > 0) {
		node = GM_addElement(heads[0], 'style', {
			textContent: css
		});
	} else {
		node = GM_addElement(document.documentElement, 'style', {
			textContent: css
		});
	}
	return node;
};

function _addColorBlindToggles(container) {
	let filterDiv = document.createElement('div');
	filterDiv.id = 'ColorBlindFilterSvgObjects';
	filterDiv.style.width = '0px';
	filterDiv.style.height = '0px';
	filterDiv.style.display = 'none';
	filterDiv.innerHTML = colorBlindFilter.svgElement;
	container.appendChild(filterDiv);

	let filterWrapper = document.createElement('div');
	filterWrapper.style.display = 'none';
	filterWrapper.id = 'ColorBlindFilterToggleWrapper';

	// Backup initial filter style.
	colorBlindFilter.initialBackup = document.documentElement.style.filter;
	for (const name in colorBlindFilter.simulations) {
		let id = colorBlindFilter.simulations[name];
		let radio = _addColorBlindToggle(filterWrapper, name, id);
	}
	container.appendChild(filterWrapper);

	let check = document.createElement('input');
	check.type = 'checkbox';
	check.name = 'ColorBlindFilterToggle';
	let thisId = 'ColorBlindFilterToggleCheckBox';
	check.id = thisId;

	if (colorBlindFilter.enabled === 'init') {
		check.setAttribute('checked', 'unchecked');
		check.checked = false;
	}
	else {
		check.setAttribute('checked', 'checked');
		check.checked = true;
	}

	check.onclick = function () {
		if (check.checked) {
			filterWrapper.style.display = 'initial';
		}
		else {
			filterWrapper.style.display = 'none';
			document.querySelector('#ColorBlindToggleRadioButton_INIT').click();
		}
	}
	if (check.checked) check.onclick();

	let label = document.createElement('label');
	label.setAttribute('for', thisId);
	label.innerText = 'ColorBlind Filter';
	label.classList.add('AccessibilityToggleLabel');
	label.appendChild(check);
	container.appendChild(label);
}

function _addColorBlindToggle(container, name, id) {
	let nameKey = id.toUpperCase();

	let radio = document.createElement('input');
	radio.type = 'radio';
	radio.name = 'ColorBlindFilters';
	let thisId = 'ColorBlindToggleRadioButton_' + nameKey;
	radio.id = thisId;

	if (id === colorBlindFilter.enabled) {
		radio.setAttribute('checked', 'checked');
		radio.checked = true;
	}
	else {
		radio.setAttribute('checked', 'unchecked');
		radio.checked = false;
	}

	radio.onclick = function () {
		window.localStorage.setItem('colorBlindFilterEnabled', id);
		if (id === 'init') {
			document.documentElement.style.filter = colorBlindFilter.initialBackup;
		}
		else {
			document.documentElement.style.filter = 'url(#' + id + ')';
		}
	};
	if (id === colorBlindFilter.enabled) radio.onclick();

	let label = document.createElement('label');
	label.setAttribute('for', thisId);
	label.innerText = name;
	label.classList.add('AccessibilityToggleLabel');

	label.appendChild(radio);
	container.appendChild(label);
	return radio;
};

function _addReadingMaskToggle(container) {
	let check = document.createElement('input');
	check.type = 'checkbox';
	check.name = 'ReadingMask';
	let thisId = 'ReadingMaskToggleCheckBox';
	check.id = thisId;

	if (readingMask.enabled) {
		check.setAttribute('checked', 'checked');
		check.checked = true;
	}
	else {
		check.setAttribute('checked', 'unchecked');
		check.checked = false;
	}

	check.onclick = function () {
		window.localStorage.setItem('readingMaskEnabled', check.checked);
		check.checked ? readingMask.create() : readingMask.remove();
	}
	if (check.checked) check.onclick();

	let label = document.createElement('label');
	label.setAttribute('for', thisId);
	label.innerText = 'Reading Mask';
	label.classList.add('AccessibilityToggleLabel');

	label.appendChild(check);
	container.appendChild(label);
	return check;
};

function _addReadingGuideToggle(container) {
	let check = document.createElement('input');
	check.type = 'checkbox';
	check.name = 'ReadingGuide';
	let thisId = 'ReadingGuideToggleCheckBox';
	check.id = thisId;

	if (readingGuide.enabled) {
		check.setAttribute('checked', 'checked');
		check.checked = true;
	}
	else {
		check.setAttribute('checked', 'unchecked');
		check.checked = false;
	}

	check.onclick = function () {
		window.localStorage.setItem('readingGuideEnabled', check.checked);
		check.checked ? readingGuide.create() : readingGuide.remove();
	}
	if (check.checked) check.onclick();

	let label = document.createElement('label');
	label.setAttribute('for', thisId);
	label.innerText = 'Reading Guide';
	label.classList.add('AccessibilityToggleLabel');

	label.appendChild(check);
	container.appendChild(label);
	return check;
};

function _addGenericDarkmodeToggle(container) {
	let check = document.createElement('input');
	check.type = 'checkbox';
	check.name = 'GenericDarkmode';
	let thisId = 'GenericDarkmodeToggleCheckBox';
	check.id = thisId;

	check.setAttribute('checked', 'unchecked');
	check.checked = false;

	check.triple = parseInt(darkMode.enabled);
	check.onclick = function () {
		check.triple = (check.triple + 1) % 3;
		_setDarkModeStyle(check);
	}
	_setDarkModeStyle(check);

	let label = document.createElement('label');
	label.setAttribute('for', thisId);
	label.innerText = 'Generic Darkmode';
	label.classList.add('AccessibilityToggleLabel');

	label.appendChild(check);
	container.appendChild(label);
	return check;
};

function _setDarkModeStyle(check) {
	window.localStorage.setItem('darkModeEnabled', check.triple);
	switch (check.triple) {
		case 0:
			check.setAttribute('checked', 'unchecked');
			check.checked = false;
			check.style.filter = '';
			document.documentElement.classList.remove('genericDarkmode');
			document.documentElement.classList.remove('genericDarkmodeExImages');
			break;
		case 1:
			check.setAttribute('checked', 'checked');
			check.checked = true;
			check.style.filter = 'invert(0)';
			document.documentElement.classList.remove('genericDarkmodeExImages');
			document.documentElement.classList.add('genericDarkmode');
			break;
		case 2:
			check.setAttribute('checked', 'checked');
			check.checked = true;
			check.style.filter = 'invert(1)';
			document.documentElement.classList.remove('genericDarkmode');
			document.documentElement.classList.add('genericDarkmodeExImages');
			break;
	}
}