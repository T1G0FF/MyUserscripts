// ==UserScript==
// @name         TG Function Library
// @namespace    http://www.tgoff.me/
// @version      2021.03.09.1
// @description  Contains various useful functions; includes CSS Style Manager, Toast notifications, a simple Queue, a Download Queue and URL Parameters.
// @author       www.tgoff.me
// ==/UserScript==

function clamp(num, min, max) { return num <= min ? min : num >= max ? max : num; }

function comp(a, b) { return a > b ? +1 : b > a ? -1 : 0; }

function colorLightenDarken(col, amt) {
	let usePound = false;

	if (col[0] == '#') {
		col = col.slice(1);
		usePound = true;
	}

	let num = parseInt(col, 16);

	let r = (num >> 16) + amt;

	if (r > 255) r = 255;
	else if (r < 0) r = 0;

	let b = ((num >> 8) & 0x00FF) + amt;

	if (b > 255) b = 255;
	else if (b < 0) b = 0;

	let g = (num & 0x0000FF) + amt;

	if (g > 255) g = 255;
	else if (g < 0) g = 0;

	return (usePound ? '#' : '"' + (g | (b << 8) | (r << 16)).toString(16));
}

function defaultFor(arg, val) { return typeof arg !== 'undefined' ? arg : val; }

function getAbsolutePath(href) {
	let link = document.createElement('a');
	link.href = href;
	return link.href;
}

function getExtension(path) {
	path = stripParams(path);
	let basename = getFilename(path);
	let pos = basename.lastIndexOf('.');
	if (basename === '' || pos < 1)
		return '';
	return basename.slice(pos + 1);
}

function getFilename(path) {
	path = stripParams(path);
	let basename = path.split(/[\\/]/).pop();
	if (basename === '')
		return '';
	return basename;
}

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function getMonthName(monthNum) {
	return monthNames[monthNum] || '';
}
function getShortMonthName(monthNum) {
	let mon = getMonthName(monthNum);
	return mon ? mon.substr(0, 3) : '';
}
function getMonthIndex(monthName) {
	let month = monthNames.indexOf(monthName);
	return month ? month : undefined;
}
function getQuarter(date) {
	date = date || new Date();
	if (!date.hasOwnProperty('getFullYear')) date = new Date(date);
	var q = Math.floor(date.getMonth() / 3) + 1;
	var y = date.getFullYear().toString().substr(2, 2);
	return { 'Quarter': q, 'Year': y };
}

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
function getDayName(dayNum) {
	return dayNames[dayNum] || '';
}
function getShortDayName(dayNum) {
	let day = getDayName(dayNum);
	return day ? day.substr(0, 3) : '';
}
function getDayIndex(dayName) {
	let day = dayNames.indexOf(dayName);
	return day ? day : undefined;
}

function hasParam(field) {
	return hasParam(window.location.search, field);
}
function hasParam(url, field) {
	if (url.indexOf('?' + field + '=') != -1)
		return true;
	else if (url.indexOf('&' + field + '=') != -1)
		return true;
	return false
}

function getParam(field) {
	return getParam(window.location.search, field);
}
function getParam(url, field) {
	let result = null;
	let tmp = [];
	let items = url.split("?")[1] ? url.split("?")[1].split("&") : [];
	for (var index = 0; index < items.length; index++) {
		tmp = items[index].split("=");
		if (tmp[0] === field) result = decodeURIComponent(tmp[1]);
	}
	return result;
}

function inIframe() {
	try {
		return window.self !== window.top;
	} catch (e) {
		return true;
	}
}

function padWithZeros(number, numZeros = 3) {
	let zeros = new Array(numZeros + 1).join('0');
	if (!number) return zeros;
	if (number.length > numZeros) return number;
	number = (zeros + number);
	return number.substr(number.length - numZeros);
}

function isArray(obj) {
	return Object.prototype.toString(obj) === '[object Array]';
}

function isNumeric(obj) {
	var realStringObj = obj && obj.toString();
	return !isArray(obj) && (realStringObj - parseFloat(realStringObj) + 1) >= 0;
}

function isElement(obj) {
	return (typeof HTMLElement === "object" ? obj instanceof HTMLElement : //DOM2
		obj && typeof obj === "object" && obj !== null && obj.nodeType === 1 && typeof obj.nodeName === "string"
	);
}

function stripParams(path) {
	return path.split('?')[0];
}

function truncateLength(string, length) {
	let blanks = new Array(length + 1).join(' ');
	return (string + blanks).slice(0, length).trim();
}

async function testLinkResolves(path) {
	return await fetch(path)
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return true;
		})
		.catch(error => {
			return false;
		});
}

/*
EXAMPLE USAGE
currentItem.addEventListener('mouseover', handleEvent(lazyLoadThumbImages, currentItem));

function lazyLoadThumbImages(e, currentItem) {
	let imgElement = currentItem.querySelector('img.swatch-product-img');
	if (imgElement.src === getAbsolutePath('-')) {
		//if (DEBUG) console.log('mouseOver Success! Lazy updated: ', imgElement.getAttribute('thumbImage'));
		imgElement.src = imgElement.getAttribute('thumbImage');
		currentItem.removeEventListener('mouseover', lazyLoadThumbImages);
	}
}
*/
function handleEvent(func, params) {
	return function(e) {
		func(e, params);
	};
}

var dropdownContainers = undefined;
function initDropdownContainer(element, direction = 'right') {
	if (!element) return;
	if (!dropdownContainers) {
		let cssText = `
/* The container <div> - needed to position the dropdown content */
.tg-dropdown-container, .tg-dropdown, .tg-dropleft, .tg-dropright, .tg-dropup {
	position: relative;
	display: inline-flex;
	margin: 0.5rem;
}

.tg-dropdown-button, .tg-dropdown-option {
	background: #000000;
	color: #ECF0F1;
	border: none;
	padding: 2px 0px;
	margin: 0px 0px 2px 0px;
	text-transform: capitalize;
	letter-spacing: 1px;
	font-weight: 700;
	font-family: Helvetica;
	font-size: 15px;
	outline: none;
	min-width: 150px;
	max-width: 150px;
	white-space: pre-line;
	border-radius: 0.25rem;
	vertical-align: middle;
}

.tg-dropdown-button:hover, .tg-dropdown-option:hover {
	background: #32127A;
	color: #FFFFFF;
}

.tg-dropdown-button:active, .tg-dropdown-option:active {
	background: #4B0082;
}

.tg-dropdown-option {

}

.tg-dropdown-menu {
	position: absolute;
	top: 100%;
	left: 0;
	z-index: 100;
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
`;
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
		dropdownContainers = {};
	}
	if (!dropdownContainers[element]) {
		let dropdownContainer = document.createElement('span');
		dropdownContainer.style.float = 'none';
		dropdownContainer.style.padding = '2px 0px';
		dropdownContainer.style.fontSize = 'unset';
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
		dropdownButton.onclick = function () { dropdownMenu.classList.toggle('show'); };

		dropdownContainer.insertAdjacentElement('beforeEnd', dropdownButton);
		dropdownContainer.insertAdjacentElement('beforeEnd', dropdownMenu);
		element.insertAdjacentElement('beforeEnd', dropdownContainer);

		dropdownContainers[element] = dropdownMenu;
	}
	return dropdownContainers[element];
}

function addElementToDropdownContainer(locationElement, elementsToAdd, location = 'beforeEnd', showIf = true) {
	if (!locationElement) return;
	
	let inputContainer = initDropdownContainer(locationElement);
	if (showIf) {
		let thisContainer = document.createElement('span');
		thisContainer.style.float = 'none';
		thisContainer.style.padding = '2px 0px';
		thisContainer.style.fontSize = 'unset';
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
		inputContainer.insertAdjacentElement(location, thisContainer);
	}
}

function createButton(text, func, element, location = 'beforeEnd', showIf = true) {
	if (!element) return;
	if (showIf) {
		let newButton = document.createElement('button');
		newButton.innerText = text;
		newButton.classList.add('tg-dropdown-option');
		newButton.onclick = function () { func(); };

		addElementToDropdownContainer(element, newButton, location, showIf);
	}
}

HTMLElement.prototype.addClass = function(classes) {
	let temp;
	let current = this.className.split(/\s+/);
	let tempArray = [];
	while (current.length) {
		temp = current.shift();
		if (temp && temp != classes) tempArray[tempArray.length] = temp;
	}
	tempArray[tempArray.length] = classes;
	this.className = tempArray.join(' ');
	return;
};

HTMLElement.prototype.removeClass = function(classes) {
	let temp;
	let current = classes.split(/\s+/);
	while (current.length) {
		temp = current.shift();
		this.className.replace(temp, '');
	}
	return;
};

HTMLElement.prototype.getAllChildren = function() {
	let elem = this;
	let children = [];
	let q = [];
	q.push(elem);
	while (q.length > 0) {
		let current = q.pop();
		children.push(current);
		pushAll(current.children);
	}
	function pushAll(elemArray) {
		for (let i = 0; i < elemArray.length; i++) {
			q.push(elemArray[i]);
		}
	}
	return children;
};

HTMLElement.prototype.getCoords = function() {
	let box = this.getBoundingClientRect();

	let body = document.body;
	let docEl = document.documentElement;

	let scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
	let scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

	let clientTop = docEl.clientTop || body.clientTop || 0;
	let clientLeft = docEl.clientLeft || body.clientLeft || 0;

	let top = box.top + scrollTop - clientTop;
	let left = box.left + scrollLeft - clientLeft;

	return { top: Math.round(top), left: Math.round(left) };
};

HTMLElement.prototype.getTextNode = function(index = 1, ignoreEmpty = true) {
	let count = 0;
	let element = this;
	for (var i = 0; i < element.childNodes.length; i++) {
		var curNode = element.childNodes[i];
		if (curNode.nodeType === Node.TEXT_NODE) {
			if (ignoreEmpty && curNode.nodeValue.trim() === '') {
				continue;
			}
			count++;
			if (count == index) {
				return curNode;
			}
		}
	}
}

HTMLElement.prototype.getTextNodeValue = function(index = 1, ignoreEmpty = true) {
	return this.getTextNode().nodeValue;
}

String.prototype.escapeRegExp = function() {
	let target = this;
	return target.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
};

String.prototype.replaceAll = function(search, replacement = '', caseSensitive = false) {
	let target = this;
	let options = caseSensitive ? 'g' : 'gi';
	return target.replace(new RegExp(search, options), replacement);
};

String.prototype.toTitleCase = function(ignoreCase = true) {
	let target = this;
	let split = target.replaceAll(' ', ' ').split(' ');
	for (let i = 0; i < split.length; i++) {
		let endOfWord = ignoreCase ? split[i].slice(1).toLowerCase() : split[i].slice(1);
		split[i] = split[i].charAt(0).toUpperCase() + endOfWord;
	}
	return split.join(' ');
};

// ==UserScript==
// @name         CSS Style Adder
// @namespace    http://www.tgoff.me/
// @description  Object for dealing with Custom CSS
// @author       www.tgoff.me
// ==/UserScript==

let MyStyles = new function() {
	this.added = false;
	this.addedStyles = {};
	this.container = {};

	this.init = function() {
		let cssText = `
		#CSSToggleContainer {
			position: fixed;
			background: none;
			bottom: 1px;
			right: 1px;
			height: 14px;
			width: 14px;
			z-index: 2147483647;
		}

		.CSSToggleLabel {
			display: block;
			text-align: right;
		}

		input[id*="CSSToggleCheckbox"] {
			margin-left: 10px;
		}

		#CSSToggleContainer .CSSToggleLabel {
			visibility: hidden;
		}

		#CSSToggleContainer:hover {
			height: unset;
			width: unset;
		}

		#CSSToggleContainer:hover .CSSToggleLabel {
			visibility: visible;
		}
		`;
		this._addStyle(cssText);
		this.container = document.createElement('div');
		this.container.id = 'CSSToggleContainer';

		let that = this;
		this._addStyleToggle('SelectAll', function() {
			let checkBox = document.getElementById('CSSToggleCheckbox_SELECTALL');
			if (checkBox.checked) {
				that.enableAllAddedStyles();
			} else {
				that.disableAllAddedStyles();
			}
		});

		document.body.appendChild(this.container);
		this.added = true;
	};

	this.addStyle = function(name, css) {
		if (!this.added) this.init();
		let nameKey = name.toUpperCase();
		let node;
		if (this.addedStyles.hasOwnProperty(nameKey)) {
			node = this.addedStyles[nameKey];
			node = this._refreshStyle(node, css);
			this.addedStyles[nameKey] = node;
		} else {
			node = this._addStyle(css);
			this.addedStyles[nameKey] = node;
			this.addStyleToggle(name);
		}
		node.id = nameKey;
	};

	this._addStyle = function(css) {
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

	this._refreshStyle = function(node, css) {
		node.disabled = true;
		node.innerText = css;
		node.disabled = false;
		return node;
	};

	this.addStyleToggle = function(name) {
		let that = this;
		this._addStyleToggle(name, function() {
			let nameKey = name.toUpperCase();
			let checkBox = document.getElementById('CSSToggleCheckbox_' + nameKey);
			if (checkBox.checked) {
				that.enableStyle(nameKey);
			} else {
				that.disableStyle(nameKey);
			}
		});
	};

	this._addStyleToggle = function(name, func) {
		let nameKey = name.toUpperCase();

		let checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		checkbox.id = 'CSSToggleCheckbox_' + nameKey;
		checkbox.onclick = func;
		checkbox.checked = true;

		let label = document.createElement('label');
		label.setAttribute('for', checkbox.id);
		label.innerText = name;
		label.addClass('CSSToggleLabel');

		label.appendChild(checkbox);
		this.container.appendChild(label);
	};

	this.disableStyle = function(name) {
		let nameKey = name.toUpperCase();
		if (this.addedStyles.hasOwnProperty(nameKey)) {
			this.addedStyles[nameKey].disabled = true;
		}
	};

	this.enableStyle = function(name) {
		let nameKey = name.toUpperCase();
		if (this.addedStyles.hasOwnProperty(nameKey)) {
			this.addedStyles[nameKey].disabled = false;
		}
	};

	this.disableAllAddedStyles = function() {
		for (var key in this.addedStyles) {
			if (this.addedStyles.hasOwnProperty(key)) {
				this.addedStyles[key].disabled = true;
				document.getElementById('CSSToggleCheckbox_' + key).checked = false;
			}
		}
	};

	this.enableAllAddedStyles = function() {
		for (var key in this.addedStyles) {
			if (this.addedStyles.hasOwnProperty(key)) {
				this.addedStyles[key].disabled = false;
				document.getElementById('CSSToggleCheckbox_' + key).checked = true;
			}
		}
	};
};

// ==UserScript==
// @name         Toast Popup
// @namespace    http://www.tgoff.me/
// @description  Adds multiple popup toast notifications
// @author       www.tgoff.me
// ==/UserScript==

let Toast = new function() {
	this.MAX_TOAST_COUNT = 10;
	this.CONFIG_TOAST_POPUPS = true;
	this.CONFIG_TOAST_DELAY = 1500;
	this.CONFIG_TOAST_COUNT = 5;

	this._toasts;
	this._msgQueue;
	this.created = false;

	this._getMargin = function(index) {
		return (56 * index) + (10 * (index - 1)) + 'px';
	}

	this.init = async function() {
		this._msgQueue = new Queue();
		if (inIframe()) return;
		let cssText = `
.tgToast {
  min-width: 350px;
  background-color: #333333BB;
  color: #FFFFFF;
  text-align: center;
  border-radius: 5px;
  padding: 16px;
  position: fixed;
  z-index: 999;
  right: 30px;
  font-size: 17px;
}`;
		MyStyles.addStyle('AllToasts', cssText);

		this._toasts = [];
		for (let index = 1; index <= this.MAX_TOAST_COUNT; index++) {
			let currentToast = document.querySelector('#tgToast' + index);
			if (!this._toasts[index] && currentToast) {
				// Rebind lost toasts to array
				this._toasts[index] = currentToast;
			}
		}
		for (let index = 1; index <= this.CONFIG_TOAST_COUNT; index++) {
			if (!this._toasts[index]) {
				await this.create(index);
			}
		}
		this.created = true;

		let that = this;
		setInterval(async function() {
			if (!that._msgQueue.isEmpty()) {
				let index = await that.get();
				if (index > 0) {
					let currentMsg = that._msgQueue.dequeue();
					that.popup(index, currentMsg.msg, currentMsg.timer);
				}

			}
		}, 250); // Check every 250ms
	};

	this.create = async function(index) {
		if (inIframe()) return;
		this._toasts[index] = {};
		this._toasts[index] = document.createElement('div');
		this._toasts[index].inUse = true;
		this._toasts[index].id = 'tgToast' + index;
		this._toasts[index].classList.add('tgToast');
		this._toasts[index].innerText = 'A pop-up message on Toast ' + index;

		let margin = this._getMargin(index);
		let cssText = `
#tgToast${index} {
  visibility: hidden;
  bottom: ${margin};
}

#tgToast${index}.show {
  visibility: visible;
  -webkit-animation: tgToastFadeIn${index} 0.5s, tgToastFadeOut${index} 0.5s var(--delay);
  animation: tgToastFadeIn${index} 0.5s, tgToastFadeOut${index} 0.5s var(--delay);
}

@-webkit-keyframes tgToastFadeIn${index} {
  from {bottom: 0; opacity: 0;}
  to {bottom: ${margin}; opacity: 1;}
}

@keyframes tgToastFadeIn${index} {
  from {bottom: 0; opacity: 0;}
  to {bottom: ${margin}; opacity: 1;}
}

@-webkit-keyframes tgToastFadeOut${index} {
  from {bottom: ${margin}; opacity: 1;}
  to {bottom: 0; opacity: 0;}
}

@keyframes tgToastFadeOut${index} {
  from {bottom: ${margin}; opacity: 1;}
  to {bottom: 0; opacity: 0;}
}`;
		MyStyles._addStyle(cssText);
		document.body.appendChild(this._toasts[index]);
		this._toasts[index].inUse = false;
	};

	this.get = async function() {
		if (inIframe()) return;
		if (!this.created) await this.init();
		for (let index = 1; index <= this.MAX_TOAST_COUNT; index++) {
			if (!this._toasts[index]) { await this.create(index); }
			if (!this._toasts[index].inUse) {
				this._toasts[index].inUse = true;
				return index;
			}
		}
		return -1;
	};

	this.popup = async function(index, msg, timeout = this.CONFIG_TOAST_DELAY) {
		if (inIframe()) return;
		this._toasts[index].innerText = msg;
		timeout = timeout < 1000 ? 1000 : timeout;
		let delay = (timeout - 500) / 1000;
		this._toasts[index].style = '--delay: ' + delay + 's';
		this._toasts[index].classList.add('show');

		let that = this;
		setTimeout(function() {
			that._toasts[index].classList.remove('show');
			that._toasts[index].inUse = false;

			//let count = 0;
			//let myBottom = parseInt(window.getComputedStyle(that._toasts[index]).bottom);
			//for (let i = 1; i <= that.MAX_TOAST_COUNT; i++) {
			//	let currentToast = that._toasts[i];
			//	if (currentToast && currentToast.inUse) {
			//		let yourBottom = parseInt(window.getComputedStyle(currentToast).bottom);
			//		if (yourBottom > myBottom) {
			//			that._toasts[i].style.bottom = (56 * (index + count)) + (10 * ((index + count) - 1)) + 'px';
			//			count++;
			//		}
			//	}
			//}
			let oldBottom = that._getMargin(index);
			that._toasts[index].style.bottom = oldBottom;
		}, timeout);
	};

	this.enqueue = async function(msg, timer) {
		if (!this._msgQueue) this._msgQueue = new Queue();
		this._msgQueue.enqueue({ 'msg': msg, 'timer': timer });
	}
};

let Notify = new function() {
	if (!Toast.created) Toast.init();

	this.log = async function(msg, object = null, timer = 3000) {
		let func = console.log;
		await this._notify(func, msg, object, timer);
		return;
	};

	this.warn = async function(msg, object = null, timer = 3000) {
		let func = console.warn;
		await this._notify(func, msg, object, timer);
		return;
	};

	this.error = async function(msg, object = null, timer = 3000) {
		let func = console.error;
		await this._notify(func, msg, object, timer);
		return;
	};

	this._notify = async function(func, msg, object = null, timer = 3000) {
		if (Toast.CONFIG_TOAST_POPUPS) {
			await Toast.enqueue(msg, timer);
		}
		else {
			func(msg);
		}
		if (object) {
			func(msg);
			func(object);
		}
		return;
	};
};

// ==UserScript==
// @name         Simple Queue
// @namespace    http://www.tgoff.me/
// @description  Implements a simple Queue using a Linked List
// @author       www.tgoff.me
// ==/UserScript==

function Queue() {
	this.length = 0;

	this.isEmpty = function() {
		return (this.length == 0);
	};

	this.enqueue = function(data) {
		var node = { 'data': data };
		if (this.last) {
			// New node added to end
			this.last = this.last.next = node;
		} else {
			// New node is only item
			this.last = this.first = node;
		}
		this.length++;
	};

	this.dequeue = function() {
		var node = this.first;
		if (node) {
			this.first = node.next;
			if (!(--this.length)) {
				// Last node removed
				this.last = undefined;
			}
			return node.data;
		}
		return undefined;
	};

	this.peek = function() {
		var node = this.first;
		return (node ? node.data : undefined);
	};

	this.slice = function(start = 0, end = Infinity) {
		var output = [];

		var i = 0;
		for (var node = this.first; node; node = node.next) {
			if (--end < 0) break;
			if (++i > start) output.push(node.data);
		}
		return output;
	};
}

// ==UserScript==
// @name         Download Queue
// @namespace    http://www.tgoff.me/
// @description  Implements a Download Queue using a Linked List
// @author       www.tgoff.me
// ==/UserScript==

function DownloadQueue() {
	this._check = async function() {
		if (typeof GM_download === 'undefined') {
			await Notify.log('GM_download is not defined!', 5000);
			return false;
		}
		return true;
	};
	this.valid = this._check();

	this._queue = new Queue();
	this.timer;
	this.isRunning = false;

	this._downloader = function() {
		if (this._queue.length > 0) {
			let args = this._queue.dequeue();
			GM_download(args);
		} else {
			clearInterval(this.timer);
			this.isRunning = false;
		}
	};

	this.enqueue = async function(object) {
		if (this.valid) {
			this._queue.enqueue(object);
			if (!this.isRunning) {
				var self = this;
				this.timer = setInterval((function() {
					self.isRunning = true;
					self._downloader();
				}), 500);
			}
		}
	};
}
let downloadQueue = new DownloadQueue();

// ==UserScript==
// @name         URL Parameters
// @namespace    http://www.tgoff.me/
// @description  Object for dealing with URL Parameters
// @author       www.tgoff.me
// ==/UserScript==

function Params(urlFull) {
	this._getParams = function(urlFull) {
		let result = [];
		let url = urlFull.split('?')[0];
		// Include the '?'
		let urlParams = urlFull.substring(url.length + 1).split('&');
		let currentKVP;
		for (let i = 0; i < urlParams.length; i++) {
			currentKVP = urlParams[i].split('=');
			result[i] = { 'key': currentKVP[0], 'value': currentKVP[1] };
		}
		return result;
	};

	this._sortParams = function() {
		this.list = this.list.sort((a, b) => (a.key.toUpperCase() > b.key.toUpperCase()) ? 1 : -1);
	};

	this.url = urlFull.split('?')[0];
	this.list = this._getParams(urlFull);


	this.addParam = function(paramKey, paramValue) {
		this.list.push({ 'key': paramKey, 'value': paramValue });
		return this.toURL(true);
	};

	this.addParams = function(paramsList) {
		let currentKVP;
		for (let i = 0; i < paramsList.length; i++) {
			if (paramsList.hasOwnProperty(i)) {
				currentKVP = paramsList[i];
				if (currentKVP.hasOwnProperty('key')
					&& currentKVP.hasOwnProperty('value')) {
					this.list.push({ 'key': currentKVP.key, 'value': currentKVP.value });
				}
			}
		}
		return this.toURL(true);
	};

	this.getValue = function(paramKey) {
		let currentKVP;
		for (let i = 0; i < this.list.length; i++) {
			if (this.list.hasOwnProperty(i)) {
				currentKVP = this.list[i];
				if (currentKVP.key.toUpperCase() === paramKey.toUpperCase()) {
					return currentKVP.value;
				}
			}
		}
		return undefined;
	};

	this.removeParam = function(paramKey) {
		let currentKVP;
		for (let i = 0; i < this.list.length; i++) {
			if (this.list.hasOwnProperty(i)) {
				currentKVP = this.list[i];
				if (currentKVP.key.toUpperCase() === paramKey.toUpperCase()) {
					this.list = this.list.filter((item) => (item !== paramKey));
				}
			}
		}
		return this.toURL(true);
	};

	this.sortParams = function() {
		this._sortParams();
		return this.toURL(true);
	};

	this.toURL = function(rerun = false) {
		if (!rerun) return this._fullURL;
		let result = this.url;
		if (this.list.length > 0) {
			this._sortParams(this.list);
			// In case the url already has parameters
			result = result + (result.includes('?') ? '&' : '?');

			let currentKVP;
			for (let i = 0; i < this.list.length; i++) {
				if (this.list.hasOwnProperty(i)) {
					currentKVP = this.list[i];
					result = result + currentKVP.key + '=' + currentKVP.value + '&';
				}
			}
			// Remove trailing &
			result = result.substring(0, result.length - 1);
		}
		this._fullURL = result;
		return result;
	};
	this._fullURL = this.toURL(true);
}
Params.sort = function(urlFull) {
	let urlParamsObject = new Params(urlFull);
	urlParamsObject._sortParams();
	return urlParamsObject.toURL();
};