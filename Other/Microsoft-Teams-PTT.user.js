// ==UserScript==
// @name         # Microsoft Teams - Push-To-Talk
// @namespace    http://www.tgoff.me/
// @version      2021.05.19.1
// @description  Adds Push-To-Talk functionality to Microsoft Teams. Based entirely on https://github.com/greatesh/Microsoft-teams-PTS/tree/master
// @author       www.tgoff.me
// @match        *://teams.live.com/*
// @match        *://teams.microsoft.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=teams.com
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
	'use strict';
	var active = true;
	var keyCodePTT = 'Space';
	var mute = active;

	document.addEventListener('keyup', (k) => {
		if (mute === active && k.code == keyCodePTT) {
			document.querySelector("#microphone-button").click();
			mute = !active;
		}
	})

	document.addEventListener('keydown', (k) => {
		if (mute === !active && k.code == keyCodePTT) {
			document.querySelector("#microphone-button").click();
			mute = active;
		}
	})
})();