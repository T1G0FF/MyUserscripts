// ==UserScript==
// @name         LastPass Hide Icons
// @namespace    http://www.tgoff.me/
// @version      2023.03.21.1
// @description  Hides LastPass icons in fields.
// @author       www.tgoff.me
// @match        *://www.victoriantextiles.com.au/*
// @match        *://online.auspost.com.au/eParcel/*
// @match        *://openfreight.com.au/*
// @match        *://cp.straightsell.com.au/*
// @grant        none
// @run-at        document-idle
// ==/UserScript==

var LPBG;
var inputList;
(function () {
	'use strict';
	inputList = [];
	createCheckbox();
})();

function createCheckbox() {
	let cssText = `
.LPHide {
    display: none !important;
    visibility: hidden !important;
}

.LPShow {
    display: initial !important;
    visibility: visible !important;
}

#LPIconDiv {
    position: fixed;
    background: none;
    bottom: 1px;
    right: 1px;
    height: 14px;
    width: 14px;
}

#LPIconDiv #LPIconCheckbox {
    visibility: hidden;
}

#LPIconDiv:hover #LPIconCheckbox {
    visibility: visible;
}
`;
	addStyle(cssText);
	let container = document.createElement('div');
	container.id = "LPIconDiv";
	let checkbox = document.createElement('input');
	checkbox.type = "checkbox";
	checkbox.id = "LPIconCheckbox";
	checkbox.onclick = toggleLPIcons;
	checkbox.checked = true;
	container.appendChild(checkbox);
	document.body.appendChild(container);
}

function toggleLPIcons() {
	let checkBox = document.getElementById('LPIconCheckbox');
	let add = checkBox.checked ? 'LPShow' : 'LPHide';
	let rem = checkBox.checked ? 'LPHide' : 'LPShow';
	document.querySelectorAll('div[id^=__lpform_]').forEach((currentValue) => {
		currentValue.classList.add(add);
		currentValue.classList.remove(rem);
	});
	document.querySelectorAll('input[style*="data:image/png;base64,"]').forEach((currentValue) => {
		if (!inputList.hasOwnProperty(currentValue.id)) {
			inputList[currentValue.id] = {};
			inputList[currentValue.id].bgSave = currentValue.style.backgroundImage;
		}
		let BGLink = checkBox.checked ? inputList[currentValue.id].bgSave : 'url("data:image/png;base64, null")';
		currentValue.style.backgroundImage = BGLink;
	});
}

String.prototype.replaceAll = function (search, replacement = '', caseSensitive = false) {
	let target = this;
	let options = (caseSensitive) ? 'g' : 'gi';
	return target.replace(new RegExp(search, options), replacement);
};

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