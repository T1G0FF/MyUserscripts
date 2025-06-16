// ==UserScript==
// @name         # IMDb - Actor Image Zoom
// @namespace    http://tgoff.me/
// @version      2021.02.07.1
// @description  Enlarges actor pictures in IMDb cast lists when you hover over them.
// @author       www.tgoff.me
// @include      *://imdb.com/title/*
// @include      *://*.imdb.com/title/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
	'use strict';
	addStyle(
		// Since we replace thumbs with medium images and removed width/height, keep them small this way 44x32px
		"img.actorPicture { min-height: 44px; min-width: 32px; }" +
		"table.cast_list tr { min-height: 44px; }" +
		// Enlarge on hover
		"table.cast_list tr:hover a img.actorPicture { height: auto; width: 150px; position: absolute; margin-left: 550px; margin-top: calc(-222px / 2); }" +
		"table.cast_list tr.odd:hover, table.cast_list tr.even:hover { height: 45px; }"
	);

	setTimeout(function () {
		document.querySelectorAll('.cast_list .primary_photo img').forEach(i => {
			waitFor(() => { return !i.getAttribute('loadlate') }, () => {
				let link = i.src;;
				// Replace thumbs with larger images 317x214px
				i.src = link.replace(/_V1_U(?:X|Y)\d+_CR\d+,\d+,\d+,\d+_AL_/, "_V1_UY317_CR18,0,214,317_AL_");
				i.height = i.width = null;
				i.classList.add('actorPicture');
			});
		});
	}, 500);
})();

function waitFor(condition, callback) {
	if (!condition()) {
		window.setTimeout(waitFor.bind(null, condition, callback), 100); /* this checks the flag every 100 milliseconds*/
	} else {
		callback();
	}
}

function addStyle(css) {
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