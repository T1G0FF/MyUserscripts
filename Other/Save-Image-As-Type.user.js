// ==UserScript==
// @name         General - Save Image as Type
// @namespace    http://www.tgoff.me/
// @version      2022.05.16.1
// @description  Based on 'Save image as Type' Chrome extension by 'html5gamer' (https://chrome.google.com/webstore/detail/save-image-as-type/gabfmnliflodkdafenbcpjdlppllnemd)
// @author       www.tgoff.me
// @match        *://*/*
// @grant        GM_registerMenuCommand
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
			target.addEventListener("load", event.shiftKey ? _saveAsJPEG : _saveAsPNG); 
			target.src = target.src; // Force Onload event to reoccur.
		}
	}
}

function _saveAsPNG(event) {
	let img = event.target;
	saveAsType(img, 'png');
}

function _saveAsJPEG(event) {
	let img = event.target;
	saveAsType(img, 'jpeg');
}

function saveAsType(img, type) {
	img.crossOrigin = 'anonymous';
	if (!canvas) {
		canvas = document.createElement('canvas');
	}
	canvas.width = img.naturalWidth;
	canvas.height = img.naturalHeight;
	var context = canvas.getContext('2d');
	var mimeType = 'image/' + (type == 'jpg' ? 'jpeg' : type);
	context.drawImage(img, 0, 0);
	var dataurl = canvas.toDataURL(mimeType);
	var fileName = getSuggestedFilename(img.src, type);
	downloadUrl(dataurl, fileName)
}

function downloadUrl(url, fileName) {
	if (!downloadLink) {
		downloadLink = document.createElement('a');
		downloadLink.style.display = "None";
	}
	downloadLink.href = url;
	downloadLink.setAttribute('download', fileName);
	downloadLink.click();
}

function getSuggestedFilename(src, type) {
	// Special for chrome web store apps
	if (src.match(/googleusercontent\.com\/[0-9A-z]{30,}/)) {
		return 'screenshot.' + type;
	}
	var fileName = src.replace(/[?#].*/, '').replace(/.*[\/]/, '').replace(/\+/g, ' ');
	fileName = decodeURIComponent(fileName);
	fileName = fileName.replace(/[\x00-\x7f]+/g, function (s) { // Remove Unicode characters?
		return s.replace(/[^\w\-\.\,@ ]+/g, '');
	});
	while (fileName.match(/\.[^0-9A-z]*\./)) {
		fileName = fileName.replace(/\.[^0-9A-z]*\./g, '.'); // Remove words between dots?
	}
	fileName = fileName.replace(/\s{2,}/g, ' ').trim(); // Remove multiple whitespace
	fileName = fileName.replace(/\.(jpe?g|png|gif|webp|svg)$/gi, '').trim(); // Remove extension
	if (fileName.length > 32) {
		fileName = fileName.substr(0, 32);
	}
	fileName = fileName.replace(/[^0-9A-z]+$/, '').trim(); //Trailing non-word code
	if (!fileName) {
		fileName = 'image';
	}
	return fileName + '.' + type;
}