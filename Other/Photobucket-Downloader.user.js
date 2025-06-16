// ==UserScript==
// @name         # Photobucket - Album Downloader
// @namespace    http://www.tgoff.me/
// @version      2019.04.26.1
// @description  Downloads Photobucket Albums
// @author       www.tgoff.me
// @match        *://smg.photobucket.com/user/thelyzardiam/library*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=amazon.com
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/tg-lib.js
// @grant        GM_setClipboard
// @grant        GM_download
// @runat        document-idle
// ==/UserScript==

(function () {
	'use strict';
	addDownloadButton();
})();

function addDownloadButton() {
	//let buttonLocationElement = document.querySelector('#bulkLinkModal > form > div.modal-header > h2');
	//if(buttonLocationElement) {
	let buttonElement = document.createElement('button');
	buttonElement.innerText = 'Download';
	buttonElement.style.position = 'fixed';
	buttonElement.style.bottom = '0px';
	buttonElement.style.right = '0px';
	buttonElement.style.padding = '2px 10px';
	buttonElement.style.zIndex = '9999999';
	buttonElement.onclick = downloadImages;
	document.body.insertAdjacentElement('beforeEnd', buttonElement);
	//}
}

function copyHTML() {
	let albumImages = document.querySelectorAll('ul.filmstrip-wrapper li.filmstrip-item input[name*="selected[]"]')
	let imageHtml = '<html>\n<body>\n';
	let count = 0;
	for (let item in albumImages) {
		let currentItem = albumImages[item];
		if (albumImages.hasOwnProperty(item)) {
			let currentURL = getAbsolutePath(currentItem.getAttribute('value'));
			imageHtml = imageHtml + '<img src="' + currentURL + '">\n';
			count++;
		}
	}
	imageHtml = imageHtml + '</body>\n</html>';

	let msg = 'None found!';
	if (count > 0) {
		GM_setClipboard(imageHtml.trim());
		msg = count + ' found and copied!';
	}
	console.log(msg);
}

async function downloadImages() {
	if (typeof GM_download === 'undefined') {
		await log('GM_download is not defined!', 5000);
		copyHTML();
		return;
	}

	let albumImages = document.querySelectorAll('ul.filmstrip-wrapper li.filmstrip-item input[name*="selected[]"]')
	let count = 0;
	for (let item in albumImages) {
		let currentItem = albumImages[item];
		if (albumImages.hasOwnProperty(item)) {
			let givenURL = currentItem.getAttribute('value');
			let currentURL = getAbsolutePath(givenURL);
			let currentExtension = getExtension(currentURL);
			let currentCode = givenURL.replaceAll('https://oimg.photobucket.com/albums/v392/thelyzardiam/');
			let currentPath = 'Lyzzie/PhotoBucket/';
			let currentFilename = currentCode.replaceAll('%20', ' ');// + '.' + currentExtension;
			var args = {
				url: currentURL,
				name: currentPath + currentFilename,
				onload: function () { log(currentFilename + ' downloaded!'); },
				onerror: function (error, details) {
					console.error('Error downloading ' + currentFilename
						+ '\n\t' + error + (!details ? '' : '\n\t' + details));
				}
			};
			GM_download(args);
			count++;
		}
	}

	let msg = 'None found!';
	if (count > 0) {
		msg = count + ' found and saved!';
	}
	await log(msg);
}