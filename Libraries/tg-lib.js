// ==UserScript==
// @name         TG Function Library
// @namespace    http://www.tgoff.me/
// @version      2023.07.14.1
// @description  Contains various useful functions; includes CSS Style Manager, Toast notifications, a simple Queue, a Download Queue, URL Parameters & an iFrame.
// @author       www.tgoff.me
// ==/UserScript==

function clamp(num, min, max) { return num <= min ? min : num >= max ? max : num; }

function comp(a, b) { return a > b ? +1 : b > a ? -1 : 0; }

function colorLightenDarken(col, amt) {
	let usePound = false;

	if (col[0] === '#') {
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

	return (usePound ? '#' : '' + (g | (b << 8) | (r << 16)).toString(16));
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
	if (url.indexOf('?' + field + '=') !== -1)
		return true;
	else if (url.indexOf('&' + field + '=') !== -1)
		return true;
	return false
}

function getParam(field) {
	return getParam(window.location.search, field);
}
function getParam(url, field) {
	let result = undefined;
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

function getUUID() {
	let array = new Uint32Array(8);
	window.crypto.getRandomValues(array);
	let str = '';
	for (let i = 0; i < array.length; i++) {
		str += (i < 2 || i > 5 ? '' : '-') + array[i].toString(16).slice(-4);
	}
	return str;
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

function waitForElements(selector, timeout = -1) {
	return new Promise(resolve => {
		let initElements = document.querySelectorAll(selector);
		if (initElements.length) {
			return resolve(initElements);
		}

		const observer = new MutationObserver(mutations => {
			mutations.forEach((record) => {
				let obsElements = Array.from(record.addedNodes).filter(node => node.matches(selector));

				if (obsElements.length) {
					resolve(obsElements);
					observer.disconnect();
				}
			});
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true
		});

		if (timeout && timeout > 0) {
			setTimeout(function () {
				reject();
				observer.disconnect();
			}, timeout);
		}
	});
}

function isIE() {
	var ua = window.navigator.userAgent;
	return /MSIE|Trident/.test(ua);
}

function supportsSVG() {
	// Check if we can create an <svg> element.
	return !!('createElementNS' in document && document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect);
}

function addSvgFallback(element, svgSrc, fallbackSrc) {
	element.src = svgSrc;
	element.onerror = () => {
		element.src = fallbackSrc;
		element.onerror = null;
	};
}

HTMLElement.prototype.addClass = function(classes) {
	let temp;
	let current = this.className.split(/\s+/);
	let tempArray = [];
	while (current.length) {
		temp = current.shift();
		if (temp && temp !== classes) tempArray[tempArray.length] = temp;
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
			if (count === index) {
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
	// ([^.]?) - The not dot is an attempt to ignore web addresses, it's far from perfect.
	target = target.replace(/([^.]?)\b([a-zA-Z]+)\b/g, (match, p1, p2, offset, string) => {
		// Test for Roman Numerals
		let romanNumeral = /(\b(?:[MDCLXVI])M*(?:C[MD]|D?C{0,3})(?:X[CL]|L?X{0,3})(?:I[XV]|V?I{0,3})\b)/.test(match);
		let endOfWord = ignoreCase && !romanNumeral ? p2.slice(1).toLowerCase() : p2.slice(1);
		return p1 + p2.charAt(0).toUpperCase() + endOfWord;
	});
	return target;
};

Array.prototype.remove = function() {
	var what, a = arguments, L = a.length, ax;
	while (L && this.length) {
		what = a[--L];
		while ((ax = this.indexOf(what)) !== -1) {
			this.splice(ax, 1);
		}
	}
	return this;
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
	this.addedCheckboxes = {};
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
			color: #F2F2F2;
			font-family: system-ui;
			font-size: medium;
			font-weight: 500;
			line-height: normal;
			text-shadow: 1px 1px black, -1px -1px black, -1px 1px black, 1px -1px black;
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
			let checkBox = that.addedCheckboxes['SELECTALL'];
			that._setAllAddedStyles(!checkBox.checked, true);
		});

		document.body.appendChild(this.container);
		this.added = true;
	};

	this.addStyle = function(name, css, disabled = false) {
		if (!this.added) this.init();
		let nameKey = name.toUpperCase();
		let node;
		if (!this.addedStyles.hasOwnProperty(nameKey)) {
			// Create
			node = this._addStyle(css, disabled);
			this.addStyleToggle(name, !disabled);
		} else {
			// Update
			node = this.addedStyles[nameKey];
			node = this._updateStyle(node, css, disabled);
			this.addedCheckboxes[nameKey].checked = !disabled;
		}
		this.addedStyles[nameKey] = node;
		node.id = nameKey;
	};

	this._addStyle = function(css, disabled = false) {
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

	this._updateStyle = function(node, css, disabled = false) {
		node.disabled = true;
		node.innerText = css;
		node.disabled = disabled;
		return node;
	};

	this.addStyleToggle = function(name, checked = true) {
		let nameKey = name.toUpperCase();
		let that = this;

		this._addStyleToggle(name, function() {
			let checkBox = that.addedCheckboxes[nameKey];
			that._setStyle(nameKey, !checkBox.checked, false);
		}, checked);
	};

	this._addStyleToggle = function(name, func, checked = true) {
		let nameKey = name.toUpperCase();

		let checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		checkbox.id = 'CSSToggleCheckbox_' + nameKey;
		checkbox.onclick = func;
		checkbox.checked = checked;

		let label = document.createElement('label');
		label.setAttribute('for', checkbox.id);
		label.innerText = name;
		label.addClass('CSSToggleLabel');

		label.appendChild(checkbox);
		this.container.appendChild(label);
		this.addedCheckboxes[nameKey] = checkbox;
	};

	this._setStyle = function(name, disabled, updateCheckBox = true) {
		let nameKey = name.toUpperCase();
		if (this.addedStyles.hasOwnProperty(nameKey)) {
			this.addedStyles[nameKey].disabled = disabled;
		}
		// If this is called from the checkbox, we don't need to update the checkbox
		if (updateCheckBox && this.addedCheckboxes.hasOwnProperty(nameKey)) {
			this.addedCheckboxes[nameKey].checked = !disabled;
		}
	};

	this._setAllAddedStyles = function(disabled, updateCheckBox = true) {
		for (var nameKey in this.addedStyles) {
			this._setStyle(nameKey, disabled, updateCheckBox);
		}
	};

	this.enableStyle = function(name, updateCheckBox = true) {
		this._setStyle(name, false, updateCheckBox);
	};

	this.enableAllAddedStyles = function() {
		this._setAllAddedStyles(false, true);
	};

	this.disableStyle = function(name, updateCheckBox = true) {
		this._setStyle(name, true, updateCheckBox);
	};

	this.disableAllAddedStyles = function() {
		this._setAllAddedStyles(true, true);
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

	this.log = async function(msg, object = undefined, timer = 3000) {
		let func = console.log;
		await this._notify(func, msg, object, timer);
		return;
	};

	this.warn = async function (msg, object = undefined, timer = 3000) {
		let func = console.warn;
		await this._notify(func, msg, object, timer);
		return;
	};

	this.error = async function (msg, object = undefined, timer = 3000) {
		let func = console.error;
		await this._notify(func, msg, object, timer);
		return;
	};

	this._notify = async function (func, msg, object = undefined, timer = 3000) {
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
		return (this.length === 0);
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
			await Notify.log('GM_download is not defined!', undefined, 5000);
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

// ==UserScript==
// @name         Default iFrame Setup
// @namespace    http://www.tgoff.me/
// @description  Object for dealing with URL Parameters
// @author       www.tgoff.me
// ==/UserScript==

let MyiFrame = new function () {
	this.added = false;
	this.init = function () {
		let cssText = `
.tg-iframe {
	height: 25%;
	width: 25%;
	position: absolute;
	display: none;
	visibility: hidden;
	top: 0px;
	left: 0px;
	z-index: 999;
}`;
		MyStyles._addStyle(cssText);
	}

	this.create = function (name) {
		if (!this.added) this.init();

		let iFrame = document.querySelector('#' + name);
		if (!iFrame) {
			if (inIframe()) return;

			iFrame = document.createElement('iframe');
			iFrame.id = iFrame.name = name;
			iFrame.classList.add('tg-iframe');
			iFrame.sandbox = 'allow-same-origin allow-scripts';
			iFrame.domain = document.domain;
			document.body.appendChild(iFrame);
		}
		return iFrame;
	}

	this.show = function (iFrame, src, caller = undefined) {
		iFrame.caller = caller;
		if (iFrame.src !== src) iFrame.src = src;
		iFrame.style.display = 'block';
		iFrame.style.visibility = 'visible';
	}

	this.hide = function (iFrame, src = undefined) {
		iFrame.caller = undefined;
		if (src) iFrame.src = src;
		iFrame.style.display = 'none';
		iFrame.style.visibility = 'hidden';
	}
};