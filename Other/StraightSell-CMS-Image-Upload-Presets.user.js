// ==UserScript==
// @name         Straightsell CMS Image Upload Presets
// @namespace    http://www.tgoff.me/
// @version      2020.03.17.1
// @description  Provides single click presets for image uploads.
// @author       www.tgoff.me
// @match        *://cp.straightsell.com.au/index.php?app=cm&section=docsManage*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=straightsell.com.au
// @grant        none
// ==/UserScript==

(function () {
	'use strict';
	addPresetButtons();
})();

function addPresetButtons() {
	let buttonLocationElement = document.querySelector('select#folder');
	if (buttonLocationElement) {
		let dest = document.querySelector('select#folder');
		let unzip = document.querySelector('input#unzip');
		let pub = document.querySelector('input[name*="publishUP"]');
		let optim = document.querySelector('input[name*="optimiseJpegs"]');
		let thumbCreate = document.querySelector('input#uploadCreateThumbnails');
		let thumbFolder = document.querySelector('select#uploadThumbFolder');
		let thumbSize = document.querySelector('input#thumbnailSizeUpload');

		let buttonElement = document.createElement('button');
		buttonElement.innerText = 'Documents Preset';
		buttonElement.type = 'button';
		buttonElement.style.marginLeft = '12px';
		buttonElement.style.padding = '2px 10px';
		buttonElement.onclick = function () {
			dest.value = '/documents/productpdf';
			unzip.checked = true;
			pub.checked = true;
			optim.checked = false;
			thumbCreate.checked = false;
			fieldUpdate();
		};
		buttonLocationElement.insertAdjacentElement('AfterEnd', buttonElement);

		buttonElement = document.createElement('button');
		buttonElement.innerText = 'Category Preset';
		buttonElement.type = 'button';
		buttonElement.style.marginLeft = '12px';
		buttonElement.style.padding = '2px 10px';
		buttonElement.onclick = function () {
			dest.value = '/documents/categories';
			unzip.checked = true;
			pub.checked = true;
			optim.checked = false;
			thumbCreate.checked = false;
			fieldUpdate();
		};
		buttonLocationElement.insertAdjacentElement('AfterEnd', buttonElement);

		buttonElement = document.createElement('button');
		buttonElement.innerText = 'Thumbs Preset';
		buttonElement.type = 'button';
		buttonElement.style.marginLeft = '12px';
		buttonElement.style.padding = '2px 10px';
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
		buttonLocationElement.insertAdjacentElement('AfterEnd', buttonElement);

		buttonElement = document.createElement('button');
		buttonElement.innerText = 'Fullsize Preset';
		buttonElement.type = 'button';
		buttonElement.style.marginLeft = '12px';
		buttonElement.style.padding = '2px 10px';
		buttonElement.onclick = function () {
			dest.value = '/productimages';
			unzip.checked = true;
			pub.checked = true;
			optim.checked = false;
			thumbCreate.checked = false;
			fieldUpdate();
		};
		buttonLocationElement.insertAdjacentElement('AfterEnd', buttonElement);
	}
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