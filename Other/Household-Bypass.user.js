// ==UserScript==
// @name         Netflix - Bypass Household Modal
// @namespace    http://www.tgoff.me/
// @version      2025.03.31.1
// @description  Bypasses the "Your device isn’t part of the Netflix Household for this account" popup.
// @author       www.tgoff.me
// @match        *://*.netflix.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=netflix.com
// @downloadURL  https://github.com/T1G0FF/MyUserscripts/blob/main/Other/Household-Bypass.user.js
// @updateURL    https://github.com/T1G0FF/MyUserscripts/blob/main/Other/Household-Bypass.user.js
// @run-at       document-idle
// @grant        none
// ==/UserScript==

let modalSelector	= '.nf-modal.interstitial-full-screen';
let playerSelector	= '[data-uia="player"]';
(function () {
	'use strict';

	function removeModalPopup() {
		// Used to set focus back to a valid element to prevent focus-trap error
		const body = document.querySelector('body');

		document.querySelectorAll(modalSelector)
			.forEach((modal) => {
				body?.focus(); // Move focus to body or any other element

				console.log('Removing modal element:', modal);
				modal.remove();
			}
		);
	}

	function restorePlayerUI() {
		const player = document.querySelector(playerSelector);
		if (player) {
			console.log('Restoring player UI');

			// Reenable pointer events and unhide cursor
			player.style.pointerEvents = 'all';
			player.style.cursor = 'auto';
			// Set focus on the player
			player.focus();
			if (player.classList.contains('active')) {
				console.log('Switching active player to passive');
				player.classList.remove('active');
				player.classList.add('passive');
			}
		}
	}

	function runScripts() {
		removeModalPopup();
		restorePlayerUI();
	}

	// Monitors DOM changes and continuously applies fixes
	const observer = new MutationObserver((mutationsList) => {
		for (const mutation of mutationsList) {
			if (mutation.type === 'childList') {
				runScripts();
			}
		}
	});
	observer.observe(document.body, { childList: true, subtree: true });

	// Run on load
	runScripts();
})();
