// ==UserScript==
// @name         # General - Save Image as Type
// @namespace    http://www.tgoff.me/
// @version      2024.03.07.1
// @description  Based on 'Save image as Type' Chrome extension by 'html5gamer' (https://chrome.google.com/webstore/detail/save-image-as-type/gabfmnliflodkdafenbcpjdlppllnemd)
// @author       www.tgoff.me
// @match        *://*/*
// @grant        none
// @run-at       document-start
// @noframes
// ==/UserScript==

var canvas;
var downloadLink;

(function () {
	'use strict';
	window.addEventListener('mousedown', rightClickAction);
})();

function rightClickAction(event) {
	let target = event.target;
	if (target.nodeName == 'IMG') {
		if (event.ctrlKey && event.button === 2) {
			event.preventDefault();
			// If also holding shift save as jpg
			target.addEventListener('load', event.shiftKey ? _saveAsJPEG : _saveAsPNG);
			target.src = target.src; // Force Onload event to reoccur.
		}
	}
}

async function _saveAsPNG(event) {
	let img = event.target;
	await saveAsType(img, 'png');
	img.removeEventListener('load', _saveAsPNG);
}

async function _saveAsJPEG(event) {
	let img = event.target;
	await saveAsType(img, 'jpeg');
	img.removeEventListener('load', _saveAsJPEG);
}

async function saveAsType(img, type) {
	img.crossOrigin = 'anonymous';
	let mimeType = 'image/' + (type == 'jpg' ? 'jpeg' : type);
	let fileName = getSuggestedFilename(img.src, type);
	let noChange = img.src.startsWith('data:' + mimeType + ';');
	if (noChange) {
		downloadUrl(img.src, fileName);
		return;
	}

	if (!canvas) {
		canvas = document.createElement('canvas');
	}
	canvas.width = img.naturalWidth;
	canvas.height = img.naturalHeight;
	let context = canvas.getContext('2d');
	await context.drawImage(img, 0, 0);
	let dataUrl = canvas.toDataURL(mimeType);

	downloadUrl(dataUrl, fileName);
}

function downloadUrl(url, fileName) {
	if (!downloadLink) {
		downloadLink = document.createElement('a');
		downloadLink.setAttribute('target', '_blank');
		downloadLink.style.display = 'None';
	}
	downloadLink.setAttribute('download', fileName);
	downloadLink.href = url;

	document.body.appendChild(downloadLink);
	downloadLink.click();
	downloadLink.remove();
}

function getSuggestedFilename(src, type) {
	// Special for chrome web store apps
	if (src.match(/googleusercontent\.com\/[0-9a-zA-Z]{30,}/)) {
		return 'screenshot.' + type;
	}
	if (src.startsWith('blob:') || src.startsWith('data:')) {
		return 'Untitled.' + type;
	}
	let fileName = src.replace(/[?#].*/, '').replace(/.*[\/]/, '').replace(/\+/g, ' ');
	fileName = decodeURIComponent(fileName);
	fileName = fileName.replace(/[\x00-\x7f]+/g, function (s) { // Remove Unicode characters?
		return s.replace(/[^\w\-\.\,@ ]+/g, '');
	});
	while (fileName.match(/\.[^0-9a-z]*\./)) {
		fileName = fileName.replace(/\.[^0-9a-z]*\./g, '.'); // Remove words between dots?
	}
	fileName = fileName.replace(/\s\s+/g, ' ').trim(); // Remove multiple whitespace
	fileName = fileName.replace(/\.(jpe?g|png|gif|webp|svg)$/gi, '').trim(); // Remove extension
	if (fileName.length > 32) {
		fileName = fileName.substr(0, 32);
	}
	fileName = fileName.replace(/[^0-9a-z]+$/i, '').trim(); //Trailing non-word code
	if (!fileName) {
		fileName = 'image';
	}
	return fileName + '.' + type;
}