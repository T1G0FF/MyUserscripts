// ==UserScript==
// @name         # Kenmei Additions
// @namespace    http://www.tgoff.me/
// @version      2026.06.20.1
// @description  Adds visible tags for which source is used. Also adds links back to chapter numbers.
// @author       www.tgoff.me
// @match        *://*.kenmei.co/*
// @match        *://www.kenmei.co/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=kenmei.co
// @grant        none
// ==/UserScript==

var DEBUG = false;
var ROW_ID = 'data-v-a48f9e68';
var ROW_SELECTOR = 'li[' + ROW_ID + ']';

function createMutationObserver(addedCallback, removedCallback, baseElement = document) {
	if (!addedCallback && !removedCallback) return;

	var thisObserver = new MutationObserver((mutations, observer) => {
		// 'mutations' is an array of mutations that occurred
		// 'observer' is the MutationObserver instance
		mutations.forEach((record) => {
			if (addedCallback) {
				record.addedNodes.forEach((element) => {
					if (isElement(element)) {
						setTimeout(() => { addedCallback(element); }, 250);
					}
				});
			}
			if (removedCallback) {
				record.removedNodes.forEach((element) => {
					if (isElement(element)) {
						setTimeout(() => { removedCallback(element); }, 250);
					}
				});
			}
		});
	});

	// Start observing
	thisObserver.observe(baseElement ?? document, {
		childList: true,
		subtree: true
	});
}

function createCallbackTimer(callback, selector, timeout = 500) {
	let thisTimer = setInterval(function () {
		let selectedElem = document.querySelector(selector);
		if (selectedElem) {
			callback(selectedElem);

			clearInterval(thisTimer);
			thisTimer = null;
		}
	}, timeout);
}

function isElement(element) {
	if (!(element instanceof Element)) {
		if (element.nodeType !== Node.TEXT_NODE) {
			let type = Object.prototype.toString.call(element);
			if (DEBUG) console.log(type);
		}
		return false;
	}
	return true;
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
}

(function () {
	'use strict';
	addMiscCSS();
	createMutationObserver(mutationSwitch, null, document.querySelector('div.the-dashboard'));
})();

function addMiscCSS() {
	let cssText = '';
	cssText =
		`div.shadow-card:has(img.object-cover) {
    overflow: visible;
}

img.object-cover:hover {
    position: absolute;
	scale: 1;
	transform: translateX(calc(-1 * (50% - (48px / 2)))) translateY(calc(-1 * (50% - (72px / 2))));
    width: auto;
    max-width: unset;
    height: 200px;
    max-height: 200px;
    z-index: 10;
}`;
	addStyle(cssText);

	cssText =
		`.sourceTag {
	display: inline-flex;
    align-items: center;
    border-radius: 9999px;
    font-size: .66rem !important;
    line-height: 1rem;
    font-weight: 500;
}`;
	addStyle(cssText);

	cssText =
		`.source-primary,
.source-success,
.source-warning,
.source-warning-light,
.source-danger {
	padding: 0.25rem 0.75rem;
	font-size: 0.8rem;
}

.source-primary {
	background-color: #376CB0;
	color: #D7E4F5;
}

.source-success {
	background-color: #144A44;
	color: #34D399;
}

.source-warning {
	background-color: #BB5031;
	color: #FFDDCC;
}

.source-warning-light {
	background-color: #CB733E;
	color: #F9F8C9;
}

.source-danger {
	background-color: #822222;
	color: #D8B7B7;
}`;
	addStyle(cssText);

	cssText =
		`.addedLink:hover {
	text-decoration: underline;
	text-decoration-color: white;
}`;
	addStyle(cssText);
}

async function mutationSwitch(element) {
	// element is Row or has Parent that is Row.
	if (isElement(element) && (element.matches(ROW_SELECTOR) || element.closest(ROW_SELECTOR))) {
		return await addChapterLinks(element)
			&& addSourceTags(element);
	}
	return false;
}

async function addChapterLinks(element) {
	let linksAdded = element.querySelector('.addedLink');
	if (linksAdded) return true;

	// Trigger event that causes command bar to be loaded
	element.querySelector('div.list-row')?.dispatchEvent(new Event('focusin'));
	// Wait for command bar
	let actBar = await new Promise((resolve, reject) => {
		let thisTimer = setInterval(() => {
			let _actBar = element.querySelector('div.actions-bar.command-bar');
			if (_actBar) {
				resolve(_actBar);
				clearInterval(thisTimer);
			}
		}, 50);
	});

	let noNewChapters = element.querySelector('div.actions-bar.command-bar > a').innerText === 'No new chapters';

	let minusElem = element.querySelector('button:has(svg.lucide-minus)');
	let plusElem = element.querySelector('button:has(svg.lucide-plus)');
	let saveElem = element.querySelector('button:has(svg.lucide-check-check)');
	let discardElem = element.querySelector('button:has(svg.lucide-x)');
	if (!minusElem || !plusElem || !saveElem || !discardElem) return false;

	let currChapLink = '';
	let nextChapLink = '';
	if (noNewChapters) {
		nextChapLink = await getPrevChap(element);
		let outdatedSource = element.querySelector('div.actions-bar.command-bar > a').innerText === 'No new chapters';
		if (outdatedSource) {
			nextChapLink = await getPrevChap(element);
		}
		else {
			currChapLink = nextChapLink;
		}
		await discardElem.click();
	}
	else {
		nextChapLink = await getCurrChap(element);
		currChapLink = await getPrevChap(element);
		await discardElem.click();
	}

	let currChapLabel = element.querySelector('div.row-content span.ch-now');
	createChapLink(currChapLabel, currChapLink);

	let nextChapLabel = element.querySelector('div.row-content span.ch-latest');
	createChapLink(nextChapLabel, nextChapLink);

	element.classList.add('linksAdded');
	return true;
}

async function getCurrChap(element) {
	let chapLink = element.querySelector('div.actions-bar.command-bar > a').href;
	return chapLink;
}

async function getPrevChap(element) {
	let minusElem = element.querySelector('button:has(svg.lucide-minus)');
	await minusElem.click();
	return getCurrChap(element);
}

function createChapLink(element, href) {
	let range = document.createRange();
	let linkParent = document.createElement('a');
	linkParent.classList.add('addedLink');
	if (href != '') {
		linkParent.target = '_blank';
		linkParent.rel = 'noreferrer';
		linkParent.href = href;
	}
	range.selectNode(element);
	range.surroundContents(linkParent);
}

function addSourceTags(element) {
	let sourceTag = element.querySelector('.sourceTag');
	if (sourceTag) return true;

	let spacer = element.querySelector('div.row-body > div:nth-child(4)');
	let status = element.querySelector('div.row-body > div:nth-child(5) > span');
	let currChap = element.querySelector('div.row-content a:has(span.ch-now)');// 'div.actions-bar.command-bar > a'); //
	let nextChap = element.querySelector('div.row-content a:has(span.ch-latest)');// 'div.actions-bar.command-bar > a'); //
	if (!spacer || !status || !currChap || !nextChap) return false;

	let tagName = '';
	let tagClass = 'source-success';
	let currLink = currChap.href.toLowerCase();
	let nextLink = nextChap.href.toLowerCase();

	if (currLink == '' && nextLink != '') {
		tagName = 'Outdated';
		tagClass = 'source-warning';
	}
	else if (nextLink == '') {
		if (nextChap.innerText !== 'No new chapters') {
			tagName = 'No Source';
			tagClass = 'source-warning';
		}
	}
	// Official
	else if (nextLink.includes('omoi.com')) {
		tagName = 'Azuki/Omoi';
		tagClass = 'source-warning';
	}
	else if (nextLink.includes('comikey.com')) {
		tagName = 'Comikey';
		tagClass = 'source-warning-light';
	}
	else if (nextLink.includes('kmanga.kodansha.com')) {
		tagName = 'K Manga';
		tagClass = 'source-warning-light';
	}
	else if (nextLink.includes('mangaplus.shueisha.co.jp')) {
		tagName = 'Manga Plus';
		tagClass = 'source-warning-light';
	}
	else if (nextLink.includes('manga-up.com')) {
		tagName = 'Manga Up';
		tagClass = 'source-warning-light';
	}
	else if (nextLink.includes('pocketcomics.com')) {
		tagName = 'Pocket Comics';
		tagClass = 'source-warning-light';
	}
	else if (nextLink.includes('tapas.io')) {
		tagName = 'Tapas';
		tagClass = 'source-warning-light';
	}
	else if (nextLink.includes('tappytoon.com')) {
		tagName = 'Tappytoon';
		tagClass = 'source-warning';
	}
	else if (nextLink.includes('webtoons.com')) {
		tagName = 'Webtoons';
		tagClass = 'source-warning-light';
	}
	// Groups
	else if (nextLink.includes('asuracomic.net') ||
		nextLink.includes('asurascans.com')) {
		tagName = 'Asura Scans';
	}
	else if (nextLink.includes('reader.deathtollscans.net')) {
		tagName = 'Death Toll Scans';
	}
	else if (nextLink.includes('flamecomics.xyz')) {
		tagName = 'Flame Comics';
	}
	else if (nextLink.includes('gdscans.com')) {
		tagName = 'Galaxy Degen Scans';
	}
	else if (nextLink.includes('gourmetsupremacy.com')) {
		tagName = 'Gourmet Scans';
	}
	else if (nextLink.includes('hivetoons.org')) {
		tagName = 'Hive Toon';
	}
	else if (nextLink.includes('ksgroupscans.com')) {
		tagName = 'KS Group Scans';
	}
	else if (nextLink.includes('lhtranslation.net')) {
		tagName = 'LHTranslation';
	}
	else if (nextLink.includes('mangasushi.org')) {
		tagName = 'Manga Sushi';
	}
	else if (nextLink.includes('manhuaplus.com')) {
		tagName = 'Manhua Plus';
	}
	else if (nextLink.includes('rizzfables.com')) {
		tagName = 'Rizz Comic';
	}
	else if (nextLink.includes('manga.saytsu.com')) {
		tagName = 'Setsu Scans';
	}
	else if (nextLink.includes('stonescape.xyz')) {
		tagName = 'StoneScape';
	}
	else if (nextLink.includes('en-thunderscans.com')) {
		tagName = 'Thunder Scans';
	}
	else if (nextLink.includes('tritinia.org')) {
		tagName = 'Tritinia Scans';
	}
	else if (nextLink.includes('violetscans.org')) {
		tagName = 'Violet Scans';
	}
	// Aggregators
	else if (nextLink.includes('atsu.moe')) {
		tagName = 'Atsumaru';
		tagClass = 'source-primary';
	}
	else if (nextLink.includes('comick.io')) {
		tagName = 'Comick';
		tagClass = 'source-danger';
	}
	else if (nextLink.includes('mangadex.org')) {
		tagName = 'MangaDex';
		tagClass = 'source-primary';
	}
	// Unknown
	else {
		tagName = 'Missing';
		tagClass = 'source-danger';
		console.warn('Missing Source Tag', element, nextLink);
	}

	if (tagName != '') {
		let tagElem = document.createElement('span');
		tagElem.classList.add('sourceTag');
		tagElem.classList.add(tagClass);
		tagElem.innerText = tagName.replace(/[ ]/g, '\u00a0');

		status.parentElement.style.flexWrap = 'wrap';
		status.parentElement.style.justifyContent = 'center';
		status.insertAdjacentElement('afterEnd', tagElem);
	}
	return true;
}


