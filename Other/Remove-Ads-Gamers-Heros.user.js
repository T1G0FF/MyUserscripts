// ==UserScript==
// @name         Remove Ads - Gamers Heroes
// @namespace    http://www.tgoff.me/
// @version      2020.12.08.1
// @description  Removes Sidebar and Bottom Bar from Gamers Heroes
// @author       www.tgoff.me
// @match        *://*.gamersheroes.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=gamersheroes.com
// @grant        none
// ==/UserScript==

(function () {
	'use strict';
	let sideElem = document.querySelector('div#sidebar_main');
	sideElem.style.display = 'none';

	let bottomElem = document.querySelector('div.sc_blogger');
	bottomElem.style.display = 'none';

	let mainElem = document.querySelector('div#main');
	mainElem.classList.remove('with_sidebar');
	mainElem.classList.remove('left_sidebar');
	mainElem.classList.remove('right_sidebar');
})();