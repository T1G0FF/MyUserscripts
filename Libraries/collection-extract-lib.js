// ==UserScript==
// @name         Fabric Dump Library
// @namespace    http://www.tgoff.me/
// @version      4.1.0
// @description  Implements the base functionality of downloading a Fabric Collection
// @author       www.tgoff.me
// @require      http://tgoff.me/tamper-monkey/tg-lib.js
// ==/UserScript==

let CONFIG_ADD_COPYINFO = true;
let CONFIG_ADD_COPYHTML = true;
let CONFIG_ADD_SAVEIMGS = true;

function createButtons(element = getTitleElement(), location = 'beforeEnd', foreground = 'white', background = 'black') {
	if (!element) return;
	let buttonCSS = `
.tgButton {
	background-color: ${background};
	border: none;
	border-radius: 5px;
	color: ${foreground};
	font-family: Helvetica;
	font-size: 17px;
	font-weight: bolder;
	margin: 0px 2px;
	padding: 2px 10px;
	position: relative;
	text-transform: capitalize;
	vertical-align: middle;
	width: 125px;
	z-index: 1;
}
`;
	MyStyles.addStyle('fabricButtons', buttonCSS);
	if (CONFIG_ADD_COPYINFO) createButton('Copy Info', copyCollection, element, location);
	if (CONFIG_ADD_COPYHTML) createButton('Copy HTML', copyHTML, element, location);
	if (CONFIG_ADD_SAVEIMGS) createButton('Save Images', saveImages, element, location);
}

function createButton(text, func, element, location = 'beforeEnd') {
	let newButton = document.createElement('button');
	newButton.innerText = text;
	newButton.classList.add('tgButton');
	newButton.onclick = function () { WARN_INFO = true; func(); };
	element.insertAdjacentElement(location, newButton);
}

async function copyFromCollection(func) {
	let collection = getCollection();

	if (!collection) {
		Notify.log('Collection is undefined!');
		return;
	}
	let result = await func(collection);

	let msg = 'None found!';
	if (result.count > 0) {
		GM_setClipboard(result.info);
		msg = result.count + ' found and copied!';
	}
	await Notify.log(msg);
}

// Parameterless function used by button
async function copyCollection() {
	await copyFromCollection(getInformation);
}

function getCompany() {
	console.warn('WARN: Redefine getCompany() such that it returns the name of the company as a String.');
	return undefined;
}

function getTitleElement() {
	console.warn('WARN: Redefine getTitleElement() such that it returns the Element containing the Title.');
	return undefined;
}

function getTitle(titleElement = getTitleElement()) {
	return formatTitle(_getTitle(titleElement));
}

function _getTitle(titleElement = getTitleElement()) {
	let title = !titleElement ? '' : titleElement.innerText.trim();
	return title;
}

function formatTitle(title) {
	title = title.replaceAll('["â€³]', '');
	title = title.replaceAll('Search Results: ', '');
	title = title.replaceAll('Search Results For: ', '');
	title = title.replaceAll(' - Single Colorway', '');
	title = title.replaceAll('Copy Info', '');
	title = title.replaceAll('Copy HTML', '');
	title = title.replaceAll('Save Images', '');
	title = title.replaceAll('Sort Codes', '');
	if (window.location.hostname.includes('stoffabrics')) {
		let StofSearchExtractRegEx = /Search results for '(.*)'/;
		title = title.replaceAll(StofSearchExtractRegEx, '$1');
	}
	if (window.location.hostname.includes('dearstelladesign')) {
		let DearStellaSearchExtractRegEx = /Search results for (.*):/;
		title = title.replaceAll(DearStellaSearchExtractRegEx, '$1');
	}
	if (window.location.hostname.includes('lewisandirene')) {
		let LewisIreneCodeCleanRegEx = /(?:[ \t]+[A-z]{2}[0-9]{2})/;
		title = title.replaceAll(LewisIreneCodeCleanRegEx, '');
	}
	title = title.trim().toTitleCase();
	return title;
}

let WARN_INFO = true;
async function formatInformation(item) {
	if (WARN_INFO) {
		console.warn('WARN: Redefine formatInformation() such that it returns the following object:'
			+ '\n\t' + '{'
			+ '\n\t\t' + '\'itemCode\': ITEMCODE,' + '\t\t\t' + '// Where ITEMCODE is the SAP Item Code to use. Must be no greater than 50 characters.'
			+ '\n\t\t' + '\'barCode\': BARCODE,' + '\t\t\t\t' + '// Where BARCODE is the SAP Barcode to use. Must be no greater than 14 characters and have all spaces removed.'
			+ '\n\t\t' + '\'description\': DESCRIPTION,' + '\t\t' + '// Where DESCRIPTION contains as many of the following: [Colour] - [Pattern] - [Collection] - [Composition] - [Width]'
			+ '\n\t\t' + '\'webName\': WEBNAME,' + '\t\t' + '// Where WEBNAME contains as many of the following: [Colour] - [Pattern]'
			+ '\n\t\t' + '\'webDesc\': WEBDESC,' + '\t\t' + '// Where WEBDESC contains as many of the following: [Collection] [Notes] [Fibre] [Width] [Release] [Delivery]'
			+ '\n\t\t' + '\'delDate\': DELDATE,' + '\t\t' + '// Where DELDATE is "Rec [Short Received Month] [4 Digit Received Year]; Del [Short Delivery Month] [4 Digit Delivery Year]" or an empty string (eg. Rec Mar 2019; Del Jul 2019)'
			+ '\n\t\t' + '\'purchaseCode\': PURCHASECODE' + '\t' + '// Where PURCHASECODE is the company\'s item code. Must be no greater than 50 characters.'
			+ '\n\t\t' + '\'webCategory\': WEBCATEGORY' + '\t' + '// Where WEBCATEGORY is the collections category on the Victorian Textiles website. Must be no greater than 25 characters'
			+ '\n\t' + '}');
	}
	WARN_INFO = false;
	return undefined;
}

function getAvailabilityDate() {
	console.warn('WARN: Redefine getAvailabilityDate() such that it returns the Month and Year the collection is expected to be available as a String or undefined');
	return undefined;
}

function getReleaseDates(availDate = getAvailabilityDate(), delDelay = 3) {
	let recDate = new Date();
	let recMonth = recDate.toLocaleString('en-au', { month: 'short' });
	let recYear = recDate.getFullYear();

	let delDate = recDate;
	if (availDate) {
		delDate = new Date(availDate);
		delDelay = 2;
	}
	delDate.setMonth(delDate.getMonth() + delDelay);
	let delMonth = delDate.toLocaleString('en-au', { month: 'short' });
	let delYear = delDate.getFullYear();

	return {
		'Received': recMonth + ' ' + recYear,
		'Delivery': delMonth + ' ' + delYear,
	};
}

function getDeliveryString(availDate = getAvailabilityDate(), delDelay = 3) {
	let result = getReleaseDate(availDate, delDelay);
	return toDeliveryString(result);
}

function toDeliveryString(dates) {
	return 'Rec ' + dates.Received + '; Del ' + dates.Delivery;
}

function toReleaseString(dates) {
	let result = getQuarter(dates.Received);
	let relDate = getCompany() + ' ' + result.Quarter + 'Q' + result.Year;
	return relDate;
}

async function getCollection() {
	console.warn('WARN: Redefine getCollection() such that it returns an array containing the elements of the collection.');
	return undefined;
}

function toWebDescriptionItem(title, info) {
	return `<b>${title}: </b>${info}<br>`;
}

let specialCaseStrings = {
	'digital': 'Digital',
	'flannel': 'Flannel',
	'glow': 'Glow in the Dark',
	'knit': 'Knit',
	'metal': 'Metallic',
}

var SapDescriptionOrder = ['Colour', 'Pattern', 'Collection', 'Special', 'Material', 'Width', 'Repeat'];
function formatSapDescription(dictionary) {
	let result = "";
	SapDescriptionOrder.forEach(key => {
		result += (dictionary.hasOwnProperty(key) && dictionary[key] && dictionary[key].length > 0 ? dictionary[key] + ' - ' : '');
	});
	return result.substring(0, result.length - 3);
}

var WebDescriptionOrder = ['Collection', 'Notes', 'Fibre', 'Width', 'Release', 'Delivery From'];
function formatWebDescription(dictionary) {
	let result = "";
	WebDescriptionOrder.forEach(key => {
		result += (dictionary.hasOwnProperty(key) && dictionary[key] && dictionary[key].length > 0 ? toWebDescriptionItem(key, dictionary[key]) : '');
	});
	return result.substring(0, result.length - 4);
}

async function formatImage(item) {
	console.warn('WARN: Redefine formatImage() such that it returns an array of image URLs as a Strings.');
	return undefined;
}

function formatItemCode(prefix, itemCode) {
	itemCode = prefix + itemCode;
	itemCode = itemCode.replaceAll('/', '-');
	itemCode = truncateLength(itemCode, 50);
	return itemCode;
}

function formatBarCode(itemCode) {
	itemCode = itemCode.replaceAll(' ', '');
	itemCode = itemCode.replaceAll('-', '');
	itemCode = truncateLength(itemCode, 14);
	return itemCode;
}

function formatPurchaseCode(itemCode) {
	itemCode = itemCode.toUpperCase();
	itemCode = truncateLength(itemCode, 50);
	return itemCode;
}

function fixColourName(colourName) {
	colourName = colourName.trim();
	colourName = colourName.replaceAll('-', ' ');   // Remove Dashes
	colourName = colourName.replaceAll('[.]', ' '); // Remove Periods
	colourName = colourName.replaceAll('[ ]+', ' ');  // Replace Double Spaces
	colourName = colourName.replaceAll('Light ', 'Lt ');
	colourName = colourName.replaceAll('Dark ', 'Dk ');
	colourName = colourName.replaceAll('Gray', 'Grey');
	colourName = colourName.toTitleCase();
	return colourName;
}

function formatCSVOutput(collection) {
	let items = 'RecordKey' + '\t' + 'ItemCode' + '\t' + 'BarCode' + '\t' + 'Description' + '\t' + 'WebName' + '\t' + 'WebDescription' + '\t' + 'Delivery' + '\t' + 'PurchaseCode' + '\t' + 'WebCategory' + '\n';
	items += 'RecordKey' + '\t' + 'ItemCode' + '\t' + 'CodeBars' + '\t' + 'ItemName' + '\t' + 'ForeignName' + '\t' + 'User_Text' + '\t' + 'U_Stuff' + '\t' + 'SuppCatNum' + '\t' + 'U_WebCategory3' + '\n';
	let count = 0;
	for (let item in collection) {
		let currentItem = collection[item];
		let formattedInfo = '';
		if (collection.hasOwnProperty(item)) {
			formattedInfo = await formatInformation(currentItem);
			if (formattedInfo) {
				count++;
				items += count + '\t';
				items += (formattedInfo.itemCode ? formattedInfo.itemCode : '') + '\t';
				items += (formattedInfo.barCode ? formattedInfo.barCode : '') + '\t';
				items += (formattedInfo.description ? formattedInfo.description : '') + '\t';
				items += (formattedInfo.webName ? formattedInfo.webName : '') + '\t';
				items += (formattedInfo.webDesc ? formattedInfo.webDesc : '') + '\t';
				items += (formattedInfo.delDate ? formattedInfo.delDate : '') + '\t';
				items += (formattedInfo.purchaseCode ? formattedInfo.purchaseCode : '') + '\t';
				items += (formattedInfo.webCategory ? formattedInfo.webCategory : '') + '\n';
			}
		}
	}
	items = items.trim() + '\n';
	return { info: items, count: count };
}

// TODO Remove temporary backward compatibility
async function getInformation(collection) {
	return formatCSVOutput(collection);
}

async function copyHTML() {
	await copyFromCollection(getImageLinks);
}

async function getImageLinks(collection) {
	let imageHtml = '<html>\n<body>\n<hr><h1>' + getTitle() + '</h1>\n';
	let count = 0;
	for (let item in collection) {
		let currentItem = collection[item];
		if (collection.hasOwnProperty(item)) {
			let givenURLs = await formatImage(currentItem);
			if (Array.isArray(givenURLs)) {
				for (const key in givenURLs) {
					if (givenURLs.hasOwnProperty(key)) {
						const givenURL = givenURLs[key];
						imageHtml = imageHtml + '<img src="' + givenURL + '">\n';
					}
				}
			} else {
				imageHtml = imageHtml + '<img src="' + givenURLs + '">\n';
			}
			count++;
		}
	}
	imageHtml = imageHtml + '</body>\n</html>';
	imageHtml = imageHtml.trim() + '\n'

	return { info: imageHtml, count: count };
}

async function saveImages() {
	if (typeof GM_download === 'undefined') {
		await Notify.log('GM_download is not defined!', 5000);
		copyHTML();
		return;
	}

	let collection = await getCollection();
	let count = 0;
	for (let item in collection) {
		let currentItem = collection[item];
		if (collection.hasOwnProperty(item)) {
			let currentURL = getAbsolutePath(formatImage(currentItem));
			let currentExtension = getExtension(currentURL);
			let formattedInfo = await formatInformation(currentItem);
			if (!formattedInfo) continue;
			let currentCode = formattedInfo.itemCode;
			let currentPath = getCompany() + '/' + getTitle() + '/';
			let currentFilename = currentCode + '.' + currentExtension;
			var args = {
				url: currentURL,
				name: currentPath + currentFilename,
				headers: { 'user-agent': 'Mozilla/5.0 (MSIE 10.0; Windows NT 6.1; Trident/5.0)' },
				onload: function () { Notify.log(currentFilename + ' downloaded!'); },
				onerror: function (download) {
					console.error('Error downloading ' + currentFilename
						+ '\n\tError:\t' + download.error + (!download.details ? '' : '\n\tDetails:\t' + download.details.current));
				}
			};
			downloadQueue.enqueue(args);
			count++;
		}
	}

	let msg = 'None found!';
	if (count > 0) {
		msg = count + ' found and saved!';
	}
	await Notify.log(msg);
}
