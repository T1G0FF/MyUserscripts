// ==UserScript==
// @name         # Solo Printing - Bond weight conversions
// @namespace    http://www.tgoff.me/
// @version      2024.06.25.1
// @description  Adds Bond paper weight conversions
// @author       www.tgoff.me
// @match        *://soloprinting.com/resources/paper-weight-conversions/*
// @match        *://*.soloprinting.com/resources/paper-weight-conversions/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=soloprinting.com
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
	'use strict';
	let option = {};

	let lbs = document.querySelector('select.lbs')
	option = document.createElement('option');
	option.text = 'Bond';
	option.value = '3.75';
	lbs.add(option);

	let gsm = document.querySelector('select.gsm')
	option = document.createElement('option');
	option.text = 'Bond';
	option.value = '3.75';
	gsm.add(option);
})();