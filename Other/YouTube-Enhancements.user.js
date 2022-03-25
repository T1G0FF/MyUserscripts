// ==UserScript==
// @name         YouTube Enhancements
// @namespace    http://www.tgoff.me/
// @version      2020.11.25.2
// @description  Adds a button for toggling YouTube comments, forces Dark Mode to be on when page loads
// @author       www.tgoff.me
// @match        *://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// @run-at       document-start
// @noframes
// ==/UserScript==

let commentSection;

let hideComments = localStorage.getItem('hideYouTubeComments') || true;


(function () {
	'use strict';
	forceDarkMode();
	setTimeout(function () {
		addCommentToggleButton();
	}, 5000);
})();

// "wide=1; PREF=f1=50000000&f4=4000000&f6=400"

function forceDarkMode() {
	let cookieDomain = '.youtube.com';
	let cookieName = 'PREF';
	let darkModeKey = 'f6';
	let darkModeValue = '400';

	let cookieValue = getCookieValue(cookieName);
	cookieValue = replaceQueryParam(darkModeKey, darkModeValue, cookieValue);
	setCookie(cookieName, cookieValue, cookieDomain);
}

function replaceQueryParam(param, newval, search) {
	let regex = new RegExp('([?;&])?' + param + '[^&;]*[;&]?');
	let query = search.replace(regex, '$1').replace(/&$/, '');

	return (query.length > 2 ? query + '&' : '') + (newval ? param + '=' + newval : '');
}

function _getCookieArray() {
	let decodedCookie = decodeURIComponent(document.cookie);
	let ca = decodedCookie.split(';');
	return ca;
}

function getCookie(cname) {
	let name = cname + '=';
	let ca = _getCookieArray();
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c;
		}
	}
	return '';
}

function getCookieValue(cname) {
	let name = cname + '=';
	let c = getCookie(cname)
	if (c.indexOf(name) == 0) {
		return c.substring(name.length, c.length);
	}
	return '';
}

function setCookie(cname, cvalue, domain, exdays, path) {
	let result = cname + '=' + cvalue + ';';
	if (domain) {
		result += 'domain=' + domain + ';';
	}
	if (exdays) {
		let expires = new Date();
		expires.setTime(expires.getTime() + (exdays * 24 * 60 * 60 * 1000));
		result += 'expires=' + expires.toUTCString() + ';';
	}
	result += 'path=' + (path ? path : '/') + ';';

	document.cookie = result;
}

function addCommentToggleButton() {
	commentSection = document.querySelector('#comments');
	if (commentSection) {
		let buttonElement = document.createElement('paper-button');
		buttonElement.innerText = 'Toggle Comments';
		buttonElement.type = 'button';
		buttonElement.classList += ' more-button style-scope ytd-video-secondary-info-renderer paper-button';
		buttonElement.style.marginLeft = '12px';
		buttonElement.style.padding = '2px 10px';
		buttonElement.onclick = updateCommentDisplay;
		document.querySelector('#meta-contents').insertAdjacentElement('AfterEnd', buttonElement);
		updateCommentDisplay();
	}
}

function updateCommentDisplay() {
	if (hideComments) {
		commentSection.style.display = 'none';
	} else {
		commentSection.style.display = 'initial';
	}

	hideComments = !hideComments;
	localStorage.setItem('hideYouTubeComments', hideComments);
}