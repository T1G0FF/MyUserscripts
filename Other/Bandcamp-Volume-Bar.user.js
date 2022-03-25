// ==UserScript==
// @name         Bandcamp Volume Bar
// @namespace    http://www.tgoff.me/
// @version      2019.11.08.1
// @description  Adds a volume bar to Bandcamp
// @author       www.tgoff.me
// @match        *://*.bandcamp.com/*
// @match        *://rabbitjunk.com/*
// @exclude      *://bandcamp.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bandcamp.com
// @require      http://tgoff.me/tamper-monkey/tg-lib.js
// @grant        none
// @run-at       document-idle
// ==/UserScript==

var audio;
var volume;
var volumeInner;
var speaker;
var percentage = localStorage.getItem("volume") || 0.5;

var globalCss = `
.volumeControl {
  align-items: center;
  display: flex;
  height: 52px;
  margin-top: 1em
}
.volumeControl .thumb {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none
}
.volumeControl > .speaker {
  height: 50px;
  width: 54px;
  min-height: 50px;
  min-width: 54px;
  line-height: 50px;
  background: #FFF;
  border: 1px solid #D9D9D9;
  border-radius: 2px;
  color: #000;
  cursor: pointer;
  font-size: 32px;
  position: relative;
  text-align: center;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
`;

(function () {
	'use strict';
	MyStyles.addStyle('VolumeBar', globalCss);
	createController();
	updateHtml();
})();

function createController() {
	var inlinePlayer = document.getElementsByClassName("inline_player ")[0]

	if (inlinePlayer != null || inlinePlayer != undefined) {
		var font = document.createElement("link");
		font.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
		font.rel = "stylesheet";
		document.head.appendChild(font);

		audio = document.getElementsByTagName("audio")[0];
		updateVolume();

		var container = document.createElement("div");
		container.classList.add("volumeControl");

		speaker = document.createElement("i");
		speaker.classList.add("material-icons", "speaker");
		speaker.onclick = function () {
			audio.muted = !audio.muted;
			updateHtml();
		};
		container.appendChild(speaker);

		volume = document.createElement("div");
		volume.classList.add("progbar");
		container.appendChild(volume);

		var fill = document.createElement("div");
		fill.classList.add("progbar_empty");
		fill.style.width = document.querySelectorAll(".inline_player .progbar_cell .progbar")[0].offsetWidth + "px";//"248px";
		fill.onmousedown = function (e) {
			changeVolume(e);
			$(document.body).on("mousemove.volumeDragger", function (e) { changeVolume(e); });
		};
		volume.appendChild(fill);

		volumeInner = document.createElement("div");
		volumeInner.classList.add("thumb");
		volumeInner.onmousedown = function (e) {
			changeVolume(e);
		};
		fill.appendChild(volumeInner);

		inlinePlayer.appendChild(container);

		document.onmouseup = function (e) {
			localStorage.setItem("volume", percentage);
			console.log("## Percentage: " + (percentage * 100).toFixed(2) + "%");
			$(document.body).off("mousemove.volumeDragger");
		};
	}
}

function changeVolume(e) {
	var clickPos = e.pageX - volume.getCoords().left;
	percentage = clickPos / volume.offsetWidth;
	updateVolume();
	updateHtml();
}

function updateVolume() {
	percentage = clamp(percentage, 0, 1);
	audio.volume = (Math.exp(percentage) - 1) / (Math.E - 1);
}

function updateHtml() {
	if (audio.muted) {
		speaker.innerText = "volume_off";
		volumeInner.style.left = "0%";
	} else {
		if (percentage <= 0) {
			speaker.innerText = "volume_mute";
		} else if (percentage < 0.6) {
			speaker.innerText = "volume_down";
		} else {
			speaker.innerText = "volume_up";
		}
		volumeInner.style.left = (volume.offsetWidth - volumeInner.offsetWidth) * percentage + 'px';
	}
}

