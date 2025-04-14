// ==UserScript==
// @name         Straightsell CMS Image Upload Presets
// @namespace    http://www.tgoff.me/
// @version      2025.04.14.1
// @description  Provides single click presets for image uploads.
// @author       www.tgoff.me
// @match        *://cp.straightsell.com.au/index.php?app=cm&section=docsManage*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=straightsell.com.au
// @grant        none
// ==/UserScript==

var width = '750px';

(function () {
	'use strict';
	addPresetButtons();
	fixInputWidths();
})();

function addPresetButtons() {
	let dest = document.querySelector('input#fileUpload');

	if (dest) {
		let cssText = `
div.presetContainer {
	justify-content: end;
}
/* Smaller than width */
@media (max-width:${width}) {
	div.presetContainer {
		flex-direction: column;
	}
}
/* Larger than width */
@media (min-width:${width}) {

}`;
		addStyle(cssText);

		let locParent = dest.parentElement;
		let presetHeaderElement = locParent.cloneNode();
		presetHeaderElement.replaceChildren();
		presetHeaderElement.innerText = "Presets"
		presetHeaderElement.classList.add('presetHeader');
		presetHeaderElement.classList.add('widthFix');
		locParent.insertAdjacentElement('AfterEnd', presetHeaderElement);

		let presetContainerElement = locParent.cloneNode();
		presetContainerElement.replaceChildren();
		presetContainerElement.classList.add('presetContainer');
		presetContainerElement.classList.add('widthFix');
		presetHeaderElement.insertAdjacentElement('AfterEnd', presetContainerElement);

		let unzip = document.querySelector('input#unzip');
		let pub = document.querySelector('input[name*="publishUP"]');
		let optim = document.querySelector('input[name*="optimiseJpegs"]');
		let thumbCreate = document.querySelector('input#uploadCreateThumbnails');
		let thumbFolder = document.querySelector('select#uploadThumbFolder');
		let thumbSize = document.querySelector('input#thumbnailSizeUpload');

		let buttonElement = getNewPresetButton('Fullsize');
		buttonElement.onclick = function () {
			dest.value = '/productimages';
			unzip.checked = true;
			pub.checked = true;
			optim.checked = false;
			thumbCreate.checked = false;
			fieldUpdate();
		};
		presetContainerElement.insertAdjacentElement('BeforeEnd', buttonElement);

		buttonElement = getNewPresetButton('Thumbs');
		buttonElement.onclick = function () {
			dest.value = '/productimages/thumbnails';
			unzip.checked = true;
			pub.checked = true;
			optim.checked = false;
			thumbCreate.checked = true;
			thumbFolder.value = '/productimages/thumbnails/swatches';
			thumbSize.value = '50';
			fieldUpdate();
		};
		presetContainerElement.insertAdjacentElement('BeforeEnd', buttonElement);

		buttonElement = getNewPresetButton('Category');
		buttonElement.onclick = function () {
			dest.value = '/documents/categories';
			unzip.checked = true;
			pub.checked = true;
			optim.checked = false;
			thumbCreate.checked = false;
			fieldUpdate();
		};
		presetContainerElement.insertAdjacentElement('BeforeEnd', buttonElement);

		buttonElement = getNewPresetButton('Documents');
		buttonElement.onclick = function () {
			dest.value = '/documents/productpdf';
			unzip.checked = true;
			pub.checked = true;
			optim.checked = false;
			thumbCreate.checked = false;
			fieldUpdate();
		};
		presetContainerElement.insertAdjacentElement('BeforeEnd', buttonElement);

		buttonElement = getNewPresetButton('Slideshow');
		buttonElement.onclick = function () {
			dest.value = '/documents/slideshow';
			unzip.checked = true;
			pub.checked = true;
			optim.checked = false;
			thumbCreate.checked = false;
			fieldUpdate();
		};
		presetContainerElement.insertAdjacentElement('BeforeEnd', buttonElement);
	}
}

function getNewPresetButton(text) {
	let buttonElement = document.createElement('button');
	buttonElement.classList.add('btn');
	buttonElement.classList.add('btn-secondary');
	buttonElement.type = 'button';
	buttonElement.innerText = text;
	buttonElement.style.marginLeft = '12px';
	buttonElement.style.padding = '2px 10px';
	return buttonElement;
}

function fieldUpdate() {
	if (document.getElementById('uploadCreateThumbnails').checked) {
		document.getElementById('uploadThumbFolder').disabled = false;
		document.getElementById('thumbnailSizeUpload').disabled = false;
	} else {
		document.getElementById('uploadThumbFolder').disabled = true;
		document.getElementById('thumbnailSizeUpload').disabled = true;
	}
}

function fixInputWidths() {
	let cssText = `
div.widthFix {
	width: 50%;
}

/* Smaller than width */
@media (max-width:${width}) {
	div.widthFix {
		min-width: 100%;
	}
}
/* Larger than width */
@media (min-width:${width}) {
	div.widthFix {
		min-width: ${width};
	}
}`;
	addStyle(cssText);

	var inputList = document.querySelectorAll('div.input-group[style*="width:50%"], div.input-group[style*="width: 50%"]');
	for (const element of inputList) {
		element.style.width = '';
		element.classList.add('widthFix');
	}
}

function addStyle(css, disabled = false) {
	let node = document.createElement('style');
	node.type = 'text/css';
	node.appendChild(document.createTextNode(css));
	let heads = document.getElementsByTagName('head');
	if (heads.length > 0) {
		heads[0].appendChild(node);
	} else {
		document.documentElement.appendChild(node);
	}
	node.disabled = disabled;
	return node;
};