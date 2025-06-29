// ==UserScript==
// @name         Collection Extraction Library
// @namespace    http://www.tgoff.me/
// @version      2025.01.31.2
// @description  Implements the base functionality of downloading a Fabric Collection
// @author       www.tgoff.me
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/tg-lib.js
// ==/UserScript==

const LIB_CONFIG = {
	'ADD_COPYINFO': true,
	'ADD_COPYHTML': true,
	'ADD_SAVEIMGS': !true,
}

// Creates default buttons used by all.
function createButtons(element = getTitleElement(), location = 'beforeEnd', foreground = 'white', background = 'black') {
	if (LIB_CONFIG.ADD_COPYINFO) createButton('Copy Info', function () { resetWarnings(); copyCollection(); }, element, location);
	if (LIB_CONFIG.ADD_COPYHTML) createButton('Copy HTML', function () { resetWarnings(); copyHTML(); }, element, location);
	if (LIB_CONFIG.ADD_SAVEIMGS) createButton('Save Images', function () { resetWarnings(); saveImages(); }, element, location);
}

// Resets the Show Warning toggle so that they only show once per button click.
function resetWarnings() {
	WARN_INFO_ITEMOBJECT = true;
	WARN_INFO_FORMATINFO = true;
	WARN_SORT_COMPAREITEMS = true;
}

// Performs func on the collection, and copies output to the clipboard.
async function copyFromCollection(func) {
	let collection = await getCollection();

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

// Parameterless function used by 'Copy Info' button.
async function copyCollection() {
	await copyFromCollection(formatCSVOutput);
}

// This should be redefined for every Collection Extractor.
function getCompany() {
	console.warn('WARN: Redefine getCompany() such that it returns the name of the company as a String.');
	return undefined;
}

// This should be redefined for every Collection Extractor.
function getTitleElement() {
	console.warn('WARN: Redefine getTitleElement() such that it returns the Element containing the Title.');
	return undefined;
}

// Gets title without any formatting so that you can do your own formatting.
function getTitle(titleElement = getTitleElement()) {
	let title = !titleElement ? '' : titleElement.innerText.trim();
	title = title.replace(titleElement.querySelector('.tg-dropdown-container')?.innerText, '').trim();
	return title;
}

// Calls formatTitle() on the result of getTitle()
function getFormattedTitle(titleElement = getTitleElement()) {
	return formatTitle(getTitle(titleElement));
}

// Removes strings known to accompany title.
function formatTitle(title) {
	title = title.replaceAll('["â€³]', '');
	title = title.replaceAll('Search Results: ', '');
	title = title.replaceAll('Search Results For: ', '');
	title = title.replaceAll(' - Single Colorway', '');
	if (window.location.hostname.includes('stoffabrics')) {
		let StofSearchExtractRegEx = /Search results for '(.*)'/;
		title = title.replaceAll(StofSearchExtractRegEx, '$1');
	}
	if (window.location.hostname.includes('dearstelladesign')) {
		let DearStellaSearchExtractRegEx = /Search results for (.*):/;
		title = title.replaceAll(DearStellaSearchExtractRegEx, '$1');
	}
	if (window.location.hostname.includes('lewisandirene')) {
		let LewisIreneCodeCleanRegEx = /(?:[ \t]+[a-zA-Z]{2}[0-9]{2})/;
		title = title.replaceAll(LewisIreneCodeCleanRegEx, '');
	}
	title = title.trim().toTitleCase();
	return title;
}

// This should be redefined for every Collection Extractor.
var WARN_INFO_ITEMOBJECT = true;
async function getItemObject(item) {
	if (WARN_INFO_ITEMOBJECT) {
		console.warn('WARN: Redefine getItemObject(item) such that it returns the following object:'
			+ '\n\t' + '{'
			+ '\n\t\t' + '\'Prefix\': PREFIX,' + '\t\t\t\t\t' + '// Where PREFIX is the SAP Item Code prefix to use. (eg "DS" for Dear Stella.)'
			+ '\n\t\t' + '\'CollectionCode\': COLLECTIONCODE,' + '\t' + '// Where COLLECTIONCODE is the Collection portion of the code. (eg "S7736" for "S7736-4G-Black-Gold")'
			+ '\n\t\t' + '\'ColourCode\': COLOURCODE,' + '\t\t\t' + '// Where COLOURCODE is the colour portion of the code padded to 3 digits. (eg "004G" for "S7736-4G-Black-Gold")'
			+ '\n\t\t' + '\'ColourName\': COLOURNAME,' + '\t\t\t' + '// Where COLOURNAME is the name of the colour in title case. (eg "Black Gold" for "S7736-4G-Black-Gold")'
			+ '\n\t\t' + '\'PatternName\': PATTERNNAME,' + '\t\t\t' + '// Where PATTERNNAME is the pattern name/description, if available. (eg "Hedgehogs" for "STELLA-DNS1909")'
			+ '\n\t\t' + '\'CollectionName\': COLLECTIONNAME,' + '\t' + '// Where COLLECTIONNAME is the name of the collection. (eg "Cosmic Skies" for "S7736-4G-Black-Gold")'
			+ '\n\t\t' + '\'SpecialNotes\': SPECIALNOTES' + '\t\t' + '// Where SPECIALNOTES is anything special about the item. (eg "Digital", "Flannel", "Glow", "Metallic")'
			+ '\n\t\t' + '\'Material\': MATERIAL' + '\t\t\t\t' + '// Where MATERIAL is the fibre composition. (eg "C80% L20%")'
			+ '\n\t\t' + '\'Width\': WIDTH' + '\t\t\t\t\t\t' + '// Where WIDTH is the width of fabric expressed as an object like this: { "Measurement": "108", "Unit": "in" }'
			+ '\n\t\t' + '\'BoltLength\': LENGTH' + '\t\t\t\t\t\t' + '// Where LENGTH is the length of fabric expressed as an object like this: { "Measurement": "13.7", "Unit": "m" }'
			+ '\n\t\t' + '\'Repeat\': REPEAT' + '\t\t\t\t\t' + '// Where REPEAT is the width of a patterns repeat expressed as an object like this: { "Measurement": "15", "Unit": "cm" }, if available'
			+ '\n\t\t' + '\'ReleaseDates\': RELEASEDATES' + '\t\t' + '// Where RELEASEDATES is an object like this: { "Received": "[Short Received Month] [4 Digit Received Year]", "Delivery": "[Short Delivery Month] [4 Digit Delivery Year]" }'
			+ '\n\t' + '}');
	}
	WARN_INFO_ITEMOBJECT = false;
	return undefined;
}

// This should be redefined for every Collection Extractor.
var WARN_INFO_FORMATINFO = true;
async function formatInformation(itemElement) {
	if (WARN_INFO_FORMATINFO) {
		console.warn('WARN: Redefine formatInformation(itemElement) such that it returns the following object:'
			+ '\n\t' + '{'
			+ '\n\t\t' + '\'itemCode\': ITEMCODE,' + '\t\t\t' + '// Where ITEMCODE is the SAP Item Code to use. Must be no greater than 50 characters.'
			+ '\n\t\t' + '\'barCode\': BARCODE,' + '\t\t\t\t' + '// Where BARCODE is the SAP Barcode to use. Must be no greater than 14 characters and have all spaces removed.'
			+ '\n\t\t' + '\'description\': DESCRIPTION,' + '\t\t' + '// Where DESCRIPTION contains as many of the following: [Colour] - [Pattern] - [Collection] - [Composition] - [Width]'
			+ '\n\t\t' + '\'webName\': WEBNAME,' + '\t\t\t\t' + '// Where WEBNAME contains as many of the following: [Colour] - [Pattern]'
			+ '\n\t\t' + '\'webDesc\': WEBDESC,' + '\t\t\t\t' + '// Where WEBDESC contains as many of the following: [Collection] [Notes] [Fibre] [Width] [Release] [Delivery]'
			+ '\n\t\t' + '\'delDate\': DELDATE,' + '\t\t\t\t' + '// Where DELDATE is "Rec [Short Received Month] [4 Digit Received Year]; Del [Short Delivery Month] [4 Digit Delivery Year]" or an empty string (eg. Rec Mar 2019; Del Jul 2019)'
			+ '\n\t\t' + '\'purchaseCode\': PURCHASECODE' + '\t' + '// Where PURCHASECODE is the company\'s item code. Must be no greater than 50 characters.'
			+ '\n\t\t' + '\'boltLength\': LENGTH' + '\t' + '// Where LENGTH is the length of a bolt of fabric. Number only, no units.'
			+ '\n\t\t' + '\'webCategory\': WEBCATEGORY' + '\t\t' + '// Where WEBCATEGORY is the collections category on the Victorian Textiles website. Must be no greater than 25 characters'
			+ '\n\t' + '}');
	}
	WARN_INFO_FORMATINFO = false;
	return undefined;
}

// This should preferably be redefined for every Collection Extractor.
function getAvailabilityDate() {
	console.warn('WARN: Redefine getAvailabilityDate() such that it returns the Month and Year the collection is expected to be available as a String or undefined');
	return undefined;
}

// Receive date is current date.
// Delivery date uses current date, unless one is provided.
function getReleaseDates(availDate = getAvailabilityDate(), delDelay = 3) {
	let recDate = new Date();
	let recMonth = recDate.toLocaleString('en-au', { month: 'short' });
	// Fixes 'June', 'July', 'Sept'
	recMonth = recMonth.substring(0, 3);
	let recYear = recDate.getFullYear();

	let delDate = recDate;
	if (availDate) {
		delDate = new Date(availDate);
		delDelay = 2;
	}
	delDate.setMonth(delDate.getMonth() + delDelay);
	let delMonth = delDate.toLocaleString('en-au', { month: 'short' });
	// Fixes 'June', 'July', 'Sept'
	delMonth = delMonth.substring(0, 3);
	let delYear = delDate.getFullYear();

	return {
		'Received': recMonth + ' ' + recYear,
		'Delivery': delMonth + ' ' + delYear,
	};
}

// Returns release dates in the form used in SAP (eg Rec Mar 2019; Del Jul 2019)
function toDeliveryString(dates) {
	return 'Rec ' + dates.Received + '; Del ' + dates.Delivery;
}

// Returns release quarter used in the form used on the website (eg 3Q20)
function toReleaseString(dates) {
	let result = getQuarter(dates.Received);
	let relDate = getCompany() + ' ' + result.Quarter + 'Q' + result.Year;
	return relDate;
}

// This should be redefined for every Collection Extractor.
async function getCollection() {
	console.warn('WARN: Redefine getCollection() such that it returns an array containing the elements of the collection.');
	return undefined;
}

// Returns formatted html used in Web Description
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

// Combines as many of the following into the form used by SAP's ItemName
var SapDescriptionOrder = ['Colour', 'Pattern', 'Collection', 'Special', 'Material', 'Width', 'Repeat'];
function formatSapDescription(dictionary) {
	let result = '';
	SapDescriptionOrder.forEach(key => {
		result += (dictionary.hasOwnProperty(key) && dictionary[key] && dictionary[key].length > 0 ? dictionary[key] + ' - ' : '');
	});
	return result.substring(0, result.length - 3);
}

// Combines as many of the following into the form used by the website html description
var WebDescriptionOrder = ['Collection', 'Bolts', 'Notes', 'Fibre', 'Width', 'Release', 'Delivery From'];
function formatWebDescription(dictionary) {
	let result = '';
	WebDescriptionOrder.forEach(key => {
		result += (dictionary.hasOwnProperty(key) && dictionary[key] && dictionary[key].length > 0 ? toWebDescriptionItem(key, dictionary[key]) : '');
	});
	return result.substring(0, result.length - 4);
}

// This should be redefined for every Collection Extractor.
async function formatImage(item, index, total) {
	console.warn('WARN: Redefine formatImage() such that it returns an array of image URL(s) as Strings.');
	return undefined;
}

function formatItemCode(prefix, itemCode) {
	itemCode = prefix + itemCode;
	itemCode = itemCode.replaceAll('/', '-');
	itemCode = truncateLength(itemCode, 30);
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
	colourName = colourName.replaceAll('Lt[. ]', 'Light ');
	colourName = colourName.replaceAll('Med[. ]', 'Medium ');
	colourName = colourName.replaceAll('Md[. ]', 'Medium ');
	colourName = colourName.replaceAll('Dk[. ]', 'Dark ');
	colourName = colourName.replaceAll('Gray', 'Grey');
	colourName = colourName.replaceAll('[\'\"]', '');  // Remove Quotes
	colourName = colourName.replaceAll('-', ' ');  // Remove Dashes
	colourName = colourName.replaceAll('[.]', ' ');  // Remove Periods
	colourName = colourName.replaceAll('[ ]+', ' ');  // Replace Double Spaces
	colourName = colourName.toTitleCase();
	return colourName;
}
function shortenColourName(colourName) {
	colourName = colourName.trim();
	colourName = colourName.toUpperCase();
	colourName = colourName.replaceAll('WHITE ON WHITE', 'WOW');
	colourName = colourName.replaceAll('WHITE ON ', 'WO');
	colourName = colourName.replaceAll('LIGHT ', 'LT');
	colourName = colourName.replaceAll('MEDIUM ', 'MD');
	colourName = colourName.replaceAll('DARK ', 'DK');
	colourName = colourName.replaceAll('TURQUOISE', 'TURQ');
	colourName = colourName.replaceAll('FOREGROUND', 'FG');
	colourName = colourName.replaceAll('BACKGROUND', 'BG');
	return colourName;
}

async function formatCSVOutput(collection) {
	let items = 'RecordKey' + '\t' + 'ItemCode' + '\t' + 'BarCode' + '\t' + 'ItemName' + '\t' + 'ForeignName' + '\t' + 'User_Text' + '\t' + 'U_Stuff' + '\t' + 'SuppCatNum' + '\t' + 'SalesFactor1' + '\t' + 'U_WebCategory3' + '\n';
	items += 'RecordKey' + '\t' + 'ItemCode' + '\t' + 'BarCode' + '\t' + 'Description' + '\t' + 'WebName' + '\t' + 'WebDescription' + '\t' + 'Delivery' + '\t' + 'PurchaseCode' + '\t' + 'SalesFactor1' + '\t' + 'WebCategory' + '\n';
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
				items += (formattedInfo.boltLength ? formattedInfo.boltLength : '') + '\t';
				items += (formattedInfo.webCategory ? formattedInfo.webCategory : '') + '\n';
			}
		}
	}
	items = items.trim() + '\n';
	return { info: items, count: count };
}

async function copyHTML() {
	await copyFromCollection(getImageLinks);
}

async function getImageLinks(collection) {
	let imageHtml = '<html>\n<body>\n<hr><h1>' + getFormattedTitle() + '</h1>\n';
	let count = 0;
	for (let item in collection) {
		let currentItem = collection[item];
		if (collection.hasOwnProperty(item)) {
			let givenURLs = await formatImage(currentItem, count, collection.length);
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
			let currentURL = getAbsolutePath(formatImage(currentItem, count, collection.length));
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

/***********************************************
 * Dropdown Options Menu
 ***********************************************/
var DROPDOWN_CONTAINERS = undefined;
function initDropdownContainer(locationElement, location = 'beforeEnd', direction = 'right') {
	if (!locationElement) return;
	if (!DROPDOWN_CONTAINERS) {
		let cssText = `/* Hide the dropdown container by Default */
.tg-dropdown-container {
	display: none;
}

/* Format Tables */
.tg-table {
	width: 100%;
	text-align: center;
}

.tg-table-header {
	text-decoration-line: underline;
}

.tg-table-row {
	display: none;
}

.tg-table-header,
.tg-table-text {
	color: #ECF0F1;
}

.tg-input {
	margin-left: 2px;
	padding: 6px 2px;
	width: 60px;
	color: #2E2F37;
}`;
		MyStyles._addStyle(cssText); // 'HideDropdown & FormatTables'

		cssText = `
/* The container <div> - needed to position the dropdown content */
.tg-dropdown-container {
	float: none;
	padding: 2px 0px;
	font-size: unset;
	line-height: unset;
}

.tg-dropdown-container, .tg-dropdown, .tg-dropleft, .tg-dropright, .tg-dropup {
	position: relative;
	display: inline-flex;
	margin: 0.5rem;
}

.tg-dropdown-text,
.tg-dropdown-button, .tg-dropdown-button-half, .tg-dropdown-button-quart,
.tg-dropdown-option, .tg-dropdown-option-half, .tg-dropdown-option-quart {
	color: #ECF0F1;
	font-size: 15px;
	text-transform: capitalize;
	letter-spacing: 1px;
	font-weight: 700;
	font-family: Helvetica;
	user-select: none;
}

.tg-dropdown-button, .tg-dropdown-button-half, .tg-dropdown-button-quart,
.tg-dropdown-option, .tg-dropdown-option-half, .tg-dropdown-option-quart {
	background: #000000;
	border: none;
	padding: 2px 0px;
	margin: 0px 0px 2px 0px;
	outline: none;
	white-space: pre-line;
	border-radius: 0.25rem;
	vertical-align: middle;
}

.tg-dropdown-button, .tg-dropdown-option {
	min-width: 150px;
	max-width: 150px;
}

.tg-dropdown-button-half, .tg-dropdown-option-half {
	min-width: 75px;
	max-width: 75px;
}

.tg-dropdown-button-quart, .tg-dropdown-option-quart {
	min-width: 35px;
	max-width: 35px;
}

.tg-dropdown-button:hover, .tg-dropdown-button-half:hover, .tg-dropdown-button-quart:hover,
.tg-dropdown-option:hover, .tg-dropdown-option-half:hover, .tg-dropdown-option-quart:hover{
	background: #32127A;
	color: #FFFFFF;
}

.tg-dropdown-button:active, .tg-dropdown-button-half:active, .tg-dropdown-button-quart:active,
.tg-dropdown-option:active, .tg-dropdown-option-half:active, .tg-dropdown-option-quart:active {
	background: #4B0082;
}

.tg-dropdown-menu {
	position: absolute;
	top: 100%;
	left: 0;
	z-index: 500;
	display: none;
	float: left;
	min-width: 10rem;
	padding: 0;
	margin: 0.125rem 0 0;
	font-size: 1rem;
	color: #212529;
	text-align: left;
	list-style: none;
	background-color: #212529;
	background-clip: padding-box;
	border-radius: 0.25rem;
	box-shadow: 4px 4px 4px 0px rgba(0,0,0,0.6);
}

.tg-dropleft .tg-dropdown-menu {
	top: 0;
	right: 100%;
	left: auto;
	margin-top: 0;
	margin-right: 0.125rem;
}

.tg-dropright .tg-dropdown-menu {
	top: 0;
	right: auto;
	left: 100%;
	margin-top: 0;
	margin-left: 0.125rem;
}

.tg-dropup .tg-dropdown-menu {
	top: auto;
	bottom: 100%;
	margin-top: 0;
	margin-bottom: 0.125rem;
}

.show {
	display:block !important;
}
.showRow {
	display:table-row !important;
}`;
		MyStyles.addStyle('DropdownCSS', cssText);
		window.onclick = function (event) {
			var dropdowns = document.getElementsByClassName('tg-dropdown-menu');
			if (!event.target.matches('.tg-dropdown-button') && !Array.from(dropdowns).some(i => i.contains(event.target))) {
				var i;
				for (i = 0; i < dropdowns.length; i++) {
					var openDropdown = dropdowns[i];
					if (openDropdown.classList.contains('show')) {
						openDropdown.classList.remove('show');
					}
				}
			}
		}
		DROPDOWN_CONTAINERS = {};
	}

	// Reset dropdown container if it has been removed from the DOM
	if (DROPDOWN_CONTAINERS[locationElement] && !document.querySelector('span.tg-dropdown-container')) {
		DROPDOWN_CONTAINERS[locationElement] = undefined;
	}

	if (!DROPDOWN_CONTAINERS[locationElement]) {
		let dropdownContainer = document.createElement('span');
		dropdownContainer.classList.add('tg-dropdown-container');
		switch (direction) {
			case 'down':
				dropdownContainer.classList.add('tg-dropdown');
				break;
			case 'left':
				dropdownContainer.classList.add('tg-dropleft');
				break;
			default:
			case 'right':
				dropdownContainer.classList.add('tg-dropright');
				break;
			case 'up':
				dropdownContainer.classList.add('tg-dropup');
				break;
		}

		let dropdownMenu = document.createElement('div');
		dropdownMenu.classList.add('tg-dropdown-menu');

		let dropdownButton = document.createElement('button');
		dropdownButton.classList.add('tg-dropdown-button');
		dropdownButton.innerText = 'Options';
		dropdownButton.type = 'button';
		dropdownButton.onclick = function () { dropdownMenu.classList.toggle('show'); };

		dropdownContainer.insertAdjacentElement('beforeEnd', dropdownButton);
		dropdownContainer.insertAdjacentElement('beforeEnd', dropdownMenu);
		locationElement.insertAdjacentElement(location, dropdownContainer);

		DROPDOWN_CONTAINERS[locationElement] = {};
		DROPDOWN_CONTAINERS[locationElement]['dropContainer'] = dropdownContainer;
		DROPDOWN_CONTAINERS[locationElement]['dropMenu'] = dropdownMenu;
	}
	return DROPDOWN_CONTAINERS[locationElement]['dropMenu'];
}

function addElementToDropdownContainer(locationElement, elementsToAdd, location = 'beforeEnd', showIf = true) {
	if (!locationElement) return;

	let inputContainer = initDropdownContainer(locationElement, location);
	if (showIf) {
		let thisContainer = document.createElement('span');
		thisContainer.style.float = 'none';
		thisContainer.style.padding = '2px 0px';
		thisContainer.style.fontSize = 'unset';
		thisContainer.style.lineHeight = 'unset';
		thisContainer.style.whiteSpace = 'nowrap';

		if (Array.isArray(elementsToAdd)) {
			for (let i in elementsToAdd) {
				let obj = elementsToAdd[i];
				if (isElement(obj)) {
					thisContainer.insertAdjacentElement('beforeEnd', obj);
				}
			}
		} else {
			if (isElement(elementsToAdd)) {
				thisContainer.insertAdjacentElement('beforeEnd', elementsToAdd);
			}
		}
		inputContainer.insertAdjacentElement('beforeEnd', thisContainer);
	}
}

function createButton(text, func, element, location = 'beforeEnd', showIf = true) {
	let btnFunc = (event) => { func(event); };
	_createButton(text, btnFunc, element, location, showIf);
}

function createButtonWithAlts(text, func, modifierFuncs, element, location = 'beforeEnd', showIf = true) {
	let btnFunc = (event) => {
		for (const key in modifierFuncs) {
			if (_modifierTriggerSuccess(key, event)) {
				modifierFuncs[key](event);
				return;
			}
		}

		func(event);
	};

	_createButton(text, btnFunc, element, location, showIf);
}

function _createButton(text, btnFunc, element, location = 'beforeEnd', showIf = true) {
	if (!element) return;
	if (showIf) {
		let newButton = document.createElement('button');
		newButton.innerText = text;
		newButton.type = 'button';
		newButton.classList.add('tg-dropdown-option');
		newButton.onclick = btnFunc;

		addElementToDropdownContainer(element, newButton, location, showIf);
	}
}

function _normaliseModifierKey(key) {
	let upperKey = key.toUpperCase();
	let result = '';
	result += upperKey.indexOf('ALT') >= 0 ? 'ALT' : '';
	result += upperKey.indexOf('CTRL') >= 0 ? 'CTRL' : '';
	result += upperKey.indexOf('SHIFT') >= 0 ? 'SHIFT' : '';
	return result;
}

function _modifierTriggerSuccess(key, event) {
	let result = false;
	switch (_normaliseModifierKey(key)) {
		case 'ALTCTRLSHIFT':
			result = event.altKey && event.ctrlKey && event.shiftKey;
			break;
		case 'ALTCTRL':
			result = event.altKey && event.ctrlKey;
			break;
		case 'ALTSHIFT':
			result = event.altKey && event.shiftKey;
			break;
		case 'CTRLSHIFT':
			result = event.ctrlKey && event.shiftKey;
			break;
		case 'ALT':
			result = event.altKey;
			break;
		case 'CTRL':
			result = event.ctrlKey;
			break;
		case 'SHIFT':
			result = event.shiftKey;
			break;
	}
	return result;
}

function hideDropdownTableElements(tableElement) {
	if (!tableElement) return;
	let headerRow = tableElement.querySelector('tr.tg-table-header');
	let otherRows = tableElement.querySelectorAll('tr:not(.tg-table-header)');

	headerRow.onclick = (event) => {
		for (const row of otherRows) {
			row.classList.toggle('showRow');
		}
	};
}

/***********************************************
 * Collection Sorting & Filtering
 ***********************************************/
var WARN_SORT_COMPAREITEMS = true;
var SORT_DIR = 0;
const SORT_DIR_LOOKUP = [
	{
		'direction': 0,
		'string': '-'
	},
	{
		'direction': 1,
		'string': ' ▲'
	},
	{
		'direction': -1,
		'string': ' ▼'
	},
]

var SORT_BY = 0;
var SORT_BY_LOOKUP = [
	{
		'compare': (aItem, bItem) => {
			if (WARN_SORT_COMPAREITEMS) {
				console.log('INFO: Use addSortBy(Name, SelectorFunction: (item) => DoTheThing(item)) to add more sorting options. SelectorFunction can return an array of results to chain comparisons. Use Name = \'Default\' to override default comparer.');
			}
			WARN_SORT_COMPAREITEMS = false;
			return comp(getCodeFromItem(aItem), getCodeFromItem(bItem));
		},
		'string': 'Default'
	},
];

async function addSortFilterInputs(locationElement = getTitleElement(), collection = undefined) {
	collection = (collection || await getCollection());
	let reqsNotMet = false;
	let testItem = collection[0];
	if (!getItemContainer()) {
		console.warn('WARN: Define getItemContainer() in order to use Sorting/Filtering.');
		reqsNotMet = true;
	}
	if (testItem && !getCodeFromItem(testItem)) {
		console.warn('WARN: Define getCodeFromItem() in order to use Sorting/Filtering.');
		reqsNotMet = true;
	}
	if (testItem && !testFilterAgainst(testItem)) {
		console.warn('WARN: Define testFilterAgainst() in order to use Sorting/Filtering.');
		reqsNotMet = true;
	}
	reqsNotMet = reqsNotMet || !testItem;
	if (reqsNotMet) {
		console.warn('WARN: Requirements for Sorting/Filtering not met.');
		return;
	}
	testItem = undefined;

	let table = document.createElement('table');
	table.id = 'sortOptions';
	table.classList.add('tg-dropdown-option');
	table.classList.add('tg-table');
	table.innerHTML =
`<tbody>
	<tr class="tg-table-header">
		<td colspan="2" class="tg-dropdown-text">Sort Options</td>
	</tr>
	<tr class="tg-table-row tg-table-text">
		<td>Dir</td>
		<td>By</td>
	</tr>
	<tr class="tg-table-row">
		<td><button id="tg-sortdir-button"></button></td>
		<td><button id="tg-sortby-button"></button></td>
	</tr>
</tbody>`.replace(/\r\n|\n|\r|\t/gm, '');
	addElementToDropdownContainer(locationElement, [table], 'beforeEnd');

	let tableElement = document.querySelector('table#sortOptions');
	hideDropdownTableElements(tableElement);

	let sortDirButton = tableElement.querySelector('button#tg-sortdir-button');
	sortDirButton.classList.add('tg-dropdown-option-half');
	sortDirButton.innerText = SORT_DIR_LOOKUP[SORT_DIR].string;
	sortDirButton.onclick = (event) => { resetWarnings(); btnAction_sortCollectionDir(sortDirButton, event.ctrlKey ? -1 : +1) };

	let sortByButton = tableElement.querySelector('button#tg-sortby-button');
	sortByButton.classList.add('tg-dropdown-option-half');
	sortByButton.innerText = SORT_BY_LOOKUP[SORT_BY].string;
	sortByButton.onclick = (event) => { resetWarnings(); btnAction_sortCollectionBy(sortByButton, event.ctrlKey ? -1 : +1) };

	table = document.createElement('table');
	table.id = 'filterOptions';
	table.classList.add('tg-dropdown-option');
	table.classList.add('tg-table');
	table.innerHTML =
`<tbody>
	<tr class="tg-table-header">
		<td colspan="2" class="tg-dropdown-text">Filter Options</td>
	</tr>
	<tr class="tg-table-row">
		<td><input id="tg-filter-input"></td>
		<td><button id="tg-filter-button"></button></td>
	</tr>
</tbody>`.replace(/\r\n|\n|\r|\t/gm, '');
	addElementToDropdownContainer(locationElement, [table], 'beforeEnd');

	tableElement = document.querySelector('table#filterOptions');
	hideDropdownTableElements(tableElement);

	let filterButton = tableElement.querySelector('button#tg-filter-button');
	filterButton.classList.add('tg-dropdown-option-half');
	filterButton.style.width = '50px';
	filterButton.innerText = 'X';
	filterButton.onclick = (event) => { resetWarnings(); btnAction_filterCollection(filterButton) };

	let filterTextbox = tableElement.querySelector('input#tg-filter-input');
	filterTextbox.classList.add('tg-input');
	filterTextbox.type = 'text';
	filterTextbox.value = '';
	filterTextbox.style.width = '100%';
	filterTextbox.typingTimer = {};
	filterTextbox.doneTypingInterval = 750;

	filterTextbox.addEventListener('keyup', () => {
		clearTimeout(filterTextbox.typingTimer);
		filterTextbox.typingTimer = setTimeout(() => { typeAction_filterCollection(filterButton) }, filterTextbox.doneTypingInterval);
	});
	filterTextbox.addEventListener('keydown', () => {
		clearTimeout(filterTextbox.typingTimer);
	});

	filterCollection();
}

function addSortBy(string, selectorFunc) {
	let compFunc = (aItem, bItem) => {
		let aComp = selectorFunc(aItem);
		let bComp = selectorFunc(bItem);

		if (Object.prototype.toString(aComp) === '[object Array]') {
			let result = 0;
			for (let i = 0; i < aComp.length; i++) {
				const aCompI = aComp[i];
				const bCompI = bComp[i];
				result = comp(aCompI, bCompI);
				if (result !== 0) break;
			}
			return result;
		}
		return comp(aComp, bComp);
	};

	let obj = {
		'compare': compFunc,
		'string': string
	};

	if (string === 'Default') {
		SORT_BY_LOOKUP[0] = obj;
	}
	else {
		SORT_BY_LOOKUP.push(obj);
	}
}

function isSorted() {
	return !(SORT_DIR % SORT_DIR_LOOKUP.length === 0);
}

async function btnAction_sortCollectionDir(sortDirButton = undefined, direction = +1) {
	let next = (SORT_DIR + direction);
	SORT_DIR = next < 0 ? SORT_DIR_LOOKUP.length - 1 : next % SORT_DIR_LOOKUP.length;
	refreshCollection(getItemContainer(), await sortCollection());
	if (sortDirButton) {
		sortDirButton.innerText = SORT_DIR_LOOKUP[SORT_DIR].string;
	}
}

async function btnAction_sortCollectionBy(sortByButton = undefined, direction = +1) {
	let next = (SORT_BY + direction);
	SORT_BY = next < 0 ? SORT_BY_LOOKUP.length - 1 : next % SORT_BY_LOOKUP.length;
	refreshCollection(getItemContainer(), await sortCollection());
	if (sortByButton) {
		sortByButton.innerText = SORT_BY_LOOKUP[SORT_BY].string;
	}
}

async function sortCollection(collection = undefined) {
	collection = collection || await getCollection();
	let itemList = Array.from(collection);
	let sortDir = SORT_DIR_LOOKUP[SORT_DIR].direction;
	let sortFunction = SORT_BY_LOOKUP[SORT_BY].compare;
	itemList.sort(function (a, b) {
		let result = 0;
		result = sortFunction(a, b) * sortDir;
		return result;
	});
	return itemList;
}

async function btnAction_filterCollection(filterButton = undefined) {
	if (filterButton) {
		let filterElement = getFilterElement();
		if (filterElement && filterElement.value.length > 0) {
			filterButton.innerText = 'X';
			filterElement.value = '';
			await filterCollection();
		}
	}
}

async function typeAction_filterCollection(filterButton = undefined) {
	let result = await filterCollection();
	if (filterButton) {
		filterButton.innerText = (!result.filtered ? 'X' : `(${result.found}/${result.total})`);
	}
}

async function filterCollection() {
	if (!getFilterElement()) return;
	return await refreshCollection(getItemContainer(), undefined);
}

var collectionOriginalSort = undefined;
async function refreshCollection(itemContainer = getItemContainer(), itemList = undefined) {
	if (!itemList) {
		if (!collectionOriginalSort) {
			collectionOriginalSort = Array.from(await getCollection());
		}
		itemList = await sortCollection();
	}
	itemList = isSorted() ? itemList : collectionOriginalSort;
	itemList = (Array.isArray(itemList)) ? itemList : Array.from(itemList);
	let children = Array.from(itemContainer.children);
	let foundChildren = [];
	for (let i = itemList.length - 1; i >= 0; i--) {
		let child = itemList[i];
		if (children.includes(child)) {
			itemContainer.removeChild(child);
			foundChildren.unshift(child);
		}
	}
	itemList = foundChildren;

	let filterTrueList = [];
	let filterFalseList = [];
	let filter = getFilterText();
	for (let i = itemList.length - 1; i >= 0; i--) {
		let itemOut = itemList[i];
		if (testFilter(filter, testFilterAgainst(itemOut))) {
			filterTrueList.unshift(itemOut);
		} else {
			filterFalseList.unshift(itemOut);
		}
	}

	if (filterFalseList.length > 0) {
		for (let j = filterFalseList.length - 1; j >= 0; j--) {
			let itemOut = filterFalseList[j];
			removeFilterMatchStyle(itemOut);
			itemContainer.insertAdjacentElement('afterBegin', itemOut);
		}
	}
	if (filterTrueList.length > 0) {
		for (let j = filterTrueList.length - 1; j >= 0; j--) {
			let itemOut = filterTrueList[j];
			addFilterMatchStyle(itemOut);
			itemContainer.insertAdjacentElement('afterBegin', itemOut);
		}
	}

	return { 'filtered': filter.length > 0, 'found': filterTrueList.length, 'total': itemList.length };
}

function getFilterElement() {
	return document.querySelector('#tg-filter-input');
}

function getFilterText() {
	let elem = getFilterElement();
	if (elem) return (elem.value) ? elem.value : '';
}

function testFilter(filter, str) {
	if (!str || !str.length > 0) return false;
	if (!filter || !filter.length > 0) return false;
	try {
		let filterRegex = new RegExp(filter, 'i');
		if (filterRegex) {
			return filterRegex.test(str);
		}
	}
	catch (ex) {
		if (ex.message.startsWith('Invalid regular expression')) {
			filter = filter.toLowerCase();
			str = str.toLowerCase();
			return str.indexOf(filter) >= 0;
		}
		else {
			throw ex;
		}
	}
}

/* Virtual Functions */
function getItemContainer() {
	console.warn('WARN: Redefine getItemContainer() such that it returns the element that contains the items to be sorted.');
	return undefined;
}

function getCodeFromItem(item) {
	console.warn('WARN: Redefine getCodeFromItem() such that it returns the item code as a String.');
	return undefined;
}

function testFilterAgainst(item) {
	console.warn('WARN: Redefine testFilterAgainst() such that it returns the string to search using the filter.');
	return undefined;
}

function addFilterMatchStyle(item) {
	console.log('INFO: Redefining addFilterMatchStyle() will allow you to change the style of the item element if it matches the filter.');
	return undefined;
}

function removeFilterMatchStyle(item) {
	console.log('INFO: Redefine removeFilterMatchStyle() such that it removes the changes made by addFilterMatchStyle().');
	return undefined;
}