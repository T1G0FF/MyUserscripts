// ==UserScript==
// @name            Google - View Image button - EDIT
// @namespace       https://github.com/bijij/ViewImage
// @version         3.5.0.1
// @description     This userscript re-implements the "View Image" and "Search by image" buttons into google images.
// @author          Joshua B
// @run-at          document-end
// @include         http*://*.google.tld/search*tbm=isch*
// @include         http*://*.google.tld/imgres*
// ==/UserScript==
'use strict';

/*
Added image's dimensions back to thumbnails.
Uses Translations from make-gis-great-again.user.js by Bae Junehyeon
	https://gist.github.com/trlkly/cb4f9a349259f1df4eeef6e3f438600c/raw/make-gis-great-again.user.js
*/

const options = {
	'open-in-new-tab': true,
	'open-search-by-in-new-tab': true,
	'hide-images-subject-to-copyright': false,
	'manually-set-button-text': false,
	'no-referrer': false,
	'button-text-view-image': '',
	'button-text-search-by-image': '',
	'add-image-dimensions-to-thumbnails': true,
	'show-image-dimensions-on-hover-only': false,
};

const localizedLanguage = {
	'ViewImage': {
		en: 'View image',
		ru: 'Показать в полном размере',
		'zh-CN': '查看原图',
		'zh-TW': '查看原图',
		ja: '画像を表示',
		he: 'הצג תמונה',
		fr: 'Voir l\'image',
		sl: 'Ogled slike',
		ar: 'عرض الصورة',
		de: 'Bild ansehen',
		tr: 'Resmi görüntüle',
		pt: 'Ver imagem',
		lt: 'Rodyti vaizdą',
		pl: 'Pokaż obraz',
		nl: 'Afbeelding bekijken',
		se: 'Visa bild',
		uk: 'Показати зображення',
		it: 'Apri immagine'
	},
	'SearchByImage': {
		en: 'Search by Image',
		ru: 'Поиск по картинке',
		'zh-CN': '以图搜图',
		'zh-TW': '以圖搜圖',
		ja: '画像を検索',
		he: 'חפש לפי תמונה',
		fr: 'Recherche par image',
		sl: 'Iskanje s sliko',
		ar: 'البحث عن الصورة',
		de: 'Zur "Bildersuche"',
		tr: 'Görselle Ara',
		pt: 'Pesquisar por imagem',
		lt: 'Ieškoti paveikslėlio',
		pl: 'Wyszukiwanie obrazem',
		nl: 'Afbeelding zoeken',
		se: 'Fler storlekar',
		uk: 'Шукати зображення',
		it: 'Ricerca tramite immagine'
	}
};

const DEBUG = false;

const VERSIONS = {
	FEB18: 'FEB18',
	JUL19: 'JUL19',
	OCT19: 'OCT19'
};

var images = new Object();

// Finds the div which contains all required elements
function getContainer(node) {
	var container, version;
	[
		['.irc_c[style*="visibility: visible;"][style*="transform: translate3d(0px, 0px, 0px);"]', VERSIONS.FEB18],
		['.irc_c[data-ved]', VERSIONS.JUL19],
		['.tvh9oe', VERSIONS.OCT19]
	].forEach(element => {
		if (node.closest(element[0])) {
			[container, version] = [node.closest(element[0]), element[1]];
		}
	});
	return [container, version];
}


// Finds and deletes all extension related elements.
function clearExtElements(container) {
	// Remove previously generated elements
	var oldExtensionElements = container.querySelectorAll('.vi_ext_addon');
	for (var element of oldExtensionElements) {
		element.remove();
	}
}


// Returns the image URL
function findImageURL(container, version) {
	var image = null;

	switch (version) {
		case VERSIONS.FEB18:
			image = container.querySelector('img[src]#irc_mi, img[alt^="Image result"][src]:not([src^="https://encrypted-tbn"]).irc_mut, img[src].irc_mi');
			break;
		case VERSIONS.JUL19:
			var iframe = container.querySelector('iframe.irc_ifr');
			if (!iframe)
				return findImageURL(container, VERSIONS.FEB18);
			image = iframe.contentDocument.querySelector('img#irc_mi');
			break;
		case VERSIONS.OCT19:
			image = container.querySelector('img[src].n3VNCb');
			if (image.src in images) {
				return images[image.src];
			}
	}

	// Override url for images using base64 embeds
	if (image === null || image.src === '' || image.src.startsWith('data')) {
		var thumbnail = document.querySelector('img[name="' + container.dataset.itemId + '"]');
		if (thumbnail === null) {
			// If no thumbnail found, try getting image from URL
			var url = new URL(window.location);
			var imgLink = url.searchParams.get('imgurl');
			if (imgLink) {
				return imgLink;
			}
		} else {
			var meta = thumbnail.closest('.rg_bx').querySelector('.rg_meta');
			var metadata = JSON.parse(meta.innerHTML);
			return metadata.ou;
		}
	}

	// If the above doesn't work, use the link in related images to find it
	if (image === null || image.src === '' || image.src.startsWith('data')) {
		var target_image = container.querySelector('img.target_image');
		if (target_image) {
			var link = target_image.closest('a');
			if (link) {
				// Some extensions replace google image links with their original links
				if (link.href.match(/^[a-z]+:\/\/(?:www\.)?google\.[^/]*\/imgres\?/)) {
					var link_url = new URL(link.href);
					var new_imgLink = link_url.searchParams.get('imgurl');
					if (new_imgLink) {
						return new_imgLink;
					}
				} else {
					return link.href;
				}
			}
		}
	}

	if (image) {
		return image.src;
	}
}

function addViewImageButton(container, imageURL, version) {
	// Get the visit button
	var visitButton;
	switch (version) {
		case VERSIONS.FEB18:
			visitButton = container.querySelector('td > a.irc_vpl[href]').parentElement;
			break;
		case VERSIONS.JUL19:
			visitButton = container.querySelector('a.irc_hol[href]');
			break;
		case VERSIONS.OCT19:
			visitButton = container.querySelector('.ZsbmCf[href], a.J2oL9c');
			break;
	}

	// Create the view image button
	var viewImageButton = visitButton.cloneNode(true);
	viewImageButton.classList.add('vi_ext_addon');

	// Set the view image button url
	var viewImageLink;
	switch (version) {
		case VERSIONS.FEB18:
			viewImageLink = viewImageButton.querySelector('a');
			break;
		default:
			viewImageLink = viewImageButton;
	}

	viewImageLink.href = imageURL;
	// Remove Google's link fuckery
	if (version == VERSIONS.OCT19) {
		viewImageLink.removeAttribute('jsaction');
	}

	// Set additional options
	if (options['open-in-new-tab']) {
		viewImageLink.setAttribute('target', '_blank');
	}
	if (options['no-referrer']) {
		viewImageLink.setAttribute('rel', 'noreferrer');
	}
	// Set the view image button text
	var viewImageButtonText;
	switch (version) {
		case VERSIONS.FEB18:
			viewImageButtonText = viewImageButton.querySelector('.Tl8XHc');
			break;
		case VERSIONS.JUL19:
			viewImageButtonText = viewImageButton.querySelector('.irc_ho');
			break;
		case VERSIONS.OCT19:
			viewImageButtonText = viewImageButton.querySelector('.pM4Snf, .KSvtLc');
			break;
	}

	if (options['manually-set-button-text']) {
		viewImageButtonText.innerText = options['button-text-view-image'];
	} else {
		viewImageButtonText.innerText = localizedLanguage.ViewImage[(localizedLanguage.ViewImage[navigator.language] ? navigator.language : 'en')];
	}

	// Place the view image button
	visitButton.parentElement.insertBefore(viewImageButton, visitButton);
	visitButton.parentElement.insertBefore(visitButton, viewImageButton);
}


function addSearchImageButton(container, imageURL, version) {
	var link;
	switch (version) {
		case VERSIONS.FEB18:
			link = container.querySelector('.irc_dsh > a.irc_hol');
			break;
		case VERSIONS.JUL19:
			link = container.querySelector('.irc_ft > a.irc_help');
			break;
		case VERSIONS.OCT19:
			link = container.querySelector('.PvkmDc, .qnLx5b, .zSA7pe');
			break;
	}

	// Create the search by image button
	var searchImageButton = link.cloneNode(true);
	searchImageButton.classList.add('vi_ext_addon');

	// Set the more sizes button text
	var searchImageButtonText;
	switch (version) {
		case VERSIONS.FEB18:
			searchImageButtonText = container.querySelector('.irc_ho');
			break;
		case VERSIONS.JUL19:
			searchImageButtonText = searchImageButton.querySelector('span');
			break;
		case VERSIONS.OCT19:
			searchImageButtonText = searchImageButton;
			break;
	}

	if (options['manually-set-button-text']) {
		searchImageButtonText.innerText = options['button-text-search-by-image'];
	} else {
		searchImageButtonText.innerText = localizedLanguage.SearchByImage[(localizedLanguage.SearchByImage[navigator.language] ? navigator.language : 'en')];
	}

	// Set the search by image button url
	searchImageButton.href = '/searchbyimage?image_url=' + imageURL;

	// Set additional options
	if (options['open-search-by-in-new-tab']) {
		searchImageButton.setAttribute('target', '_blank');
	}

	// Place the more sizes button
	link.parentElement.insertBefore(searchImageButton, link);
	link.parentElement.insertBefore(link, searchImageButton);

	switch (version) {
		case VERSIONS.OCT19:
			if (!searchImageButton.parentElement.querySelector('span.vi_ext_addon')) {
				var span = document.createElement('span');
				span.classList.add('vi_ext_addon');
				span.innerText = " | ";
				searchImageButton.insertAdjacentElement('beforebegin', span);
			}
			break;
		default:
			break;
	}
}


// Adds links to an object
function addLinks(node) {
	if (DEBUG) {
		console.log('ViewImage: Trying to add links to node: ', node);
	}

	// Find the container
	var [container, version] = getContainer(node);

	// Return if no container was found
	if (!container) {
		if (DEBUG) {
			console.log('ViewImage: Adding links failed, container was not found.');
		}
		return;
	}

	if (DEBUG) {
		console.log('ViewImage: Assuming site version: ', version);
	}

	// Clear any old extension elements
	clearExtElements(container);

	// Find the image url
	var imageURL = findImageURL(container, version);

	// Return if image was not found
	if (!imageURL) {
		if (DEBUG) {
			console.log('ViewImage: Adding links failed, image was not found.');
		}

		return;
	}

	addViewImageButton(container, imageURL, version);
	addSearchImageButton(container, imageURL, version);
}


function parseDataSource1() {
	const start_search = /AF_initDataCallback\({key:\s'ds:1',\sisError:\s{2}false\s,\shash:\s'\d+',\sdata:/;
	const end_search = ', sideChannel: {}});</script>';

	var match = document.documentElement.innerHTML.match(start_search);

	var start_index = match.index + match[0].length;
	var end_index = start_index + document.documentElement.innerHTML.slice(start_index).indexOf(end_search);

	parseDataSource(JSON.parse(document.documentElement.innerHTML.slice(start_index, end_index)));
}

function parseDataSource2() {
	const start_search = /AF_initDataCallback\({key:\s'ds:2',\sisError:\s{2}false\s,\shash:\s'\d+',\sdata:function(){return\s/;
	const end_search = '}});</script>';

	var match = document.documentElement.innerHTML.match(start_search);

	var start_index = match.index + match[0].length;
	var end_index = start_index + document.documentElement.innerHTML.slice(start_index).indexOf(end_search);
	parseDataSource(JSON.parse(document.documentElement.innerHTML.slice(start_index, end_index)));
}

// Check if source holds array of images
try {
	if (document.documentElement.innerHTML.indexOf('key: \'ds:1\'') != -1) {
		if (DEBUG) {
			console.log('ViewImage: Attempting to parse data source 1.');
		}
		parseDataSource1();
	} else if (document.documentElement.innerHTML.indexOf('key: \'ds:2\'') != -1) {
		if (DEBUG) {
			console.log('ViewImage: Attempting to parse data source 2.');
		}
		parseDataSource2();
	} else {
		throw 'Could not determine data source type.';
	}

	if (DEBUG) {
		console.log('ViewImage: Successfully created source images array.');
	}
}
catch (error) {
	if (DEBUG) {
		console.log('ViewImage: Failed to create source images array.');
		console.error(error);
	}
}


// Define the mutation observers
var observer = new MutationObserver(function (mutations) {
	if (DEBUG) {
		console.log('ViewImage: Mutations detected: ', mutations);
	}

	for (var mutation of mutations) {
		var node;
		if (mutation.addedNodes && mutation.addedNodes.length > 0) {
			for (node of mutation.addedNodes) {
				if (node.classList) {
					// Check for new image nodes
					if (['irc_mi', 'irc_mut', 'irc_ris', 'n3VNCb'].some(className => node.classList.contains(className))) {
						addLinks(node);
					}
				}
			}
		}

		if (mutation.target.classList && mutation.target.classList.contains('n3VNCb')) {
			node = mutation.target.closest('.tvh9oe');

			if (!node.hasAttribute('aria-hidden')) {
				addLinks(node);
			}
		}
	}
});

// Start adding links
if (DEBUG) {
	console.log('ViewImage: Initialising observer...');
}

observer.observe(document.body, {
	childList: true,
	subtree: true,
	attributes: true
});

// Inject CSS into document
if (DEBUG) {
	console.log('ViewImage: Injecting CSS...');
}

var customStyle = document.createElement('style');
customStyle.type = 'text/css'
customStyle.innerText =
	`.irc_dsh>.irc_hol.vi_ext_addon,
.irc_ft>.irc_help.vi_ext_addon,
.PvkmDc.vi_ext_addon,
.qnLx5b.vi_ext_addon {
    margin: 0 4pt !important
}

.zSA7pe[href^="/searchbyimage"] {
    margin-left: 2px;
}

.ZsbmCf.vi_ext_addon {
    flex-grow:0
}

.irc_hol.vi_ext_addon {
    flex-grow:0 !important
}`;

if (options['add-image-dimensions-to-thumbnails']) {
	customStyle.innerText += options['show-image-dimensions-on-hover-only'] ? '.isv-r:hover::before' : '.isv-r::before';
	customStyle.innerText +=
		`{
    content:attr(data-ow) "x" attr(data-oh);
    display: inline-block;
    z-index: 1;

    background-color: rgba(0,0,0,.5);
    border-radius: 0 2px 0 0;
    bottom: 4.2em;
    box-shadow: 0 0 1px 0 rgb(0 0 0 / 16%);
    box-sizing: border-box;
    color: #f1f3f4;
    font-family: Roboto-Medium,Roboto,arial,sans-serif;
    font-size: 10px;
    left: 0;
    line-height: 12px;
    margin-left: 0;
    overflow: hidden;
    padding: 4px;
    position: absolute;
    white-space: nowrap;
}`;
};
document.head.appendChild(customStyle);