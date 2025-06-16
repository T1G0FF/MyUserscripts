// ==UserScript==
// @name         # VicText Collection Extractor - Madeira
// @namespace    http://www.tgoff.me/
// @version      2023.10.16.1
// @description  Gets the names and codes from a Madeira Range
// @author       www.tgoff.me
// @match        *://www.madeirausa.com/*
// @match        *://madeirausa.com/*
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/tg-lib.js
// @require      https://raw.githubusercontent.com/T1G0FF/MyUserscripts/main/Libraries/collection-extract-lib.js
// @grant        GM_setClipboard
// @grant        GM_download
// @run-at       document-idle
// ==/UserScript==

let threadLookup = {
	// 813-3892, 816-3000
	'Burmilana': {
		'prefix': '',
		'code': {
			'813': {
				'putup': 'Cone',
				'length': '1000m (1100yd)',
				'weight': '12W/2Ply',
				'fibre': '50% Wool, 50% Acrylic',
			},
			'816': {
				'putup': 'Cone',
				'length': '1000m (1100yd)',
				'weight': '12W/2Ply',
				'fibre': '50% Cotton, 50% Acrylic',
			},
		}
	},
	// 910-1000, 911-1000, 915-1000, 921-1000, 914-1000, 920-1000
	'Classic Rayon': {
		'prefix': '',
		'fibre': 'Rayon/Viscose',
		'code': {
			'910': {
				'putup': 'Cone',
				'length': '5000m (5500yd)',
				'weight': '40W/2Ply',
			},
			'911': {
				'putup': 'Spool',
				'length': '1000m (1100yd)',
				'weight': '40W/2Ply',
			},
			'914': {
				'putup': 'Spool',
				'length': '650m (714yd)',
				'weight': '30W/2Ply',
			},
			'915': {
				'putup': 'Cone',
				'length': '1500m (1640yd)',
				'weight': '60W/2Ply',
			},
			'915S': {
				'putup': 'Spool',
				'length': '1500m (1640yd)',
				'weight': '60W/2Ply',
			},
			'920': {
				'putup': 'Cone',
				'length': '2000m (2200yd)',
				'weight': '12W/2Ply',
			},
			'921': {
				'putup': 'Cone',
				'length': '3000m (3300yd)',
				'weight': '30W/2Ply',
			},
		}
	},
	// 975-4201, 978-4201
	'CR Metallic': {
		'prefix': '',
		'code': {
			'975': {
				'putup': 'Cone',
				'length': '1000m (1100yd)',
				'weight': '12W/2Ply',
				'fibre': '50% Wool, 50% Acrylic',
			},
			'978': {
				'putup': 'Cone',
				'length': '1000m (1100yd)',
				'weight': '12W/2Ply',
				'fibre': '50% Cotton, 50% Acrylic',
			},
		}
	},
	// 922-N1803, 929-N1803
	'Fire Fighter': {
		'prefix': '',
		'fibre': 'Kevlar/Aramid',
		'code': {
			'922': {
				'putup': 'Spool',
				'length': '950m (1000yd)',
				'weight': '40W/2Ply',
			},
			'929': {
				'putup': 'Cone',
				'length': '2500m (2734yd)',
				'weight': '40W/2Ply',
			},
		}
	},
	// 940-7801, 942-7801, 944-7801
	'Frosted Matt': {
		'prefix': '',
		'fibre': 'Polyester',
		'code': {
			'940': {
				'putup': 'Cone',
				'length': '2500m (2734yd)',
				'weight': '40W/2Ply',
			},
			'942': {
				'putup': 'Spool',
				'length': '1000m (1100yd)',
				'weight': '40W/2Ply',
			},
			'944': {
				'putup': 'Cone',
				'length': '2500m (2734yd)',
				'weight': '30W/2Ply',
			},
		}
	},
	// 974-3022, 979-3022, 980-3022, 981-3022, 985-3022, 986-3022, 987-3022, 988-3022
	'FS Metallic': {
		'prefix': '',
		'code': {
			'974': {
				'putup': 'Cone',
				'length': '950m (1000yd)',
				'weight': '20W',
				'fibre': '80% Rayon/Viscose, 20% Polyester',
			},
			'979': {
				'putup': 'Spool',
				'length': '2500m (2734yd)',
				'weight': '30W',
				'fibre': 'Polyester',
			},
			'980': {
				'putup': 'Cone',
				'length': '5000m (5500yd)',
				'weight': '30W',
				'fibre': 'Polyester',
			},
			'981': {
				'putup': 'Spool',
				'length': '560m (612yd)',
				'weight': '20W',
				'fibre': '80% Rayon/Viscose, 20% Polyester',
			},
			'985': {
				'putup': 'Spool',
				'length': '1000m (1100yd)',
				'weight': '40W',
				'fibre': '40% Polyester, 35% Nylon/Polyamide, 25% Special Paper',
			},
			'986': {
				'putup': 'Cone',
				'length': '5000m (5500yd)',
				'weight': '40W',
				'fibre': '40% Polyester, 35% Nylon/Polyamide, 25% Special Paper',
			},
			'987': {
				'putup': 'Spool',
				'length': '1000m (1100yd)',
				'weight': '50W',
				'fibre': '55% Polyester, 45% Nylon/Polyamide',
			},
			'988': {
				'putup': 'Cone',
				'length': '5000m (5500yd)',
				'weight': '50W',
				'fibre': '55% Polyester, 45% Nylon/Polyamide',
			},
		}
	},
	// 442-0000
	'Highly Conductive Embroidery Thread': {
		'prefix': '',
		'fibre': 'Silver Plated Nylon/Polyamide',
		'code': {
			'HC-12': {
				'putup': 'Cone',
				'length': '1000m (1100yd)',
				'weight': '~12W',
				'codeFix': '420',
			},
			'HC-12-SP': {
				'putup': 'Sample Cone',
				'length': '150m (164yd)',
				'weight': '~12W',
				'codeFix': '420SMP',
			},
			'HC-40': {
				'putup': 'Cone',
				'length': '2500m (2700yd)',
				'weight': '~40W',
				'codeFix': '410',
			},
			'HC-40-SP': {
				'putup': 'Sample Cone',
				'length': '250m (273yd)',
				'weight': '~40W',
				'codeFix': '410SMP',
			},
		}
	},
	// 127-502, 996-502
	'Luna': {
		'prefix': '',
		'fibre': 'Nylon/Polyamide',
		'code': {
			'127': {
				'putup': 'Spool',
				'length': '750m (820yd)',
				'weight': '40W/2Ply',
				'codeFix': '996',
			},
			'996': {
				'putup': 'Spool',
				'length': '750m (820yd)',
				'weight': '40W/2Ply',
			},
		}
	},
	// 801-150
	'Monolon': {
		'prefix': '',
		'fibre': 'Nylon/Polyamide',
		'code': {
			'801': {
				'putup': 'Cone',
				'length': '15000m (16500yd)',
				'weight': '150W',
			},
		}
	},
	// 918-1801, 919-1801, 924-1801, 926-1801, 935-1801, 936-1801
	'Polyneon': {
		'prefix': '',
		'fibre': 'Polyester',
		'code': {
			'918': {
				'putup': 'Cone',
				'length': '5000m (5500yd)',
				'weight': '40W/2Ply',
			},
			'919': {
				'putup': 'Spool',
				'length': '1000m (1100yd)',
				'weight': '40W/2Ply',
			},
			'924': {
				'putup': 'Spool',
				'length': '1500m (1640yd)',
				'weight': '60W/2Ply',
			},
			'926': {
				'putup': 'Cone',
				'length': '5000m (5500yd)',
				'weight': '60W/2Ply',
			},
			'935': {
				'putup': 'Cone',
				'length': '10000m (11000yd)',
				'weight': '75W/2Ply',
			},
			'936': {
				'putup': 'Spool',
				'length': '2500m (2734yd)',
				'weight': '75W/2Ply',
			},
		}
	},
	// 718-6801
	'Polyneon Green': {
		'prefix': '',
		'fibre': 'Recycled Polyester',
		'code': {
			'718': {
				'putup': 'Cone',
				'length': '5000m (5500yd)',
				'weight': '40W/2Ply',
			},
		}
	},
	// 442-0000
	'Reflect': {
		'prefix': '',
		'fibre': '75% Polyester, 25% Nylon/Polyamide',
		'code': {
			'442': {
				'putup': 'Cone',
				'length': '500m (550yd)',
				'weight': '~40W',
			},
		}
	},
	// 710-101
	'Sensa® Green': {
		'prefix': '',
		'fibre': 'Tencel/Lyocell',
		'code': {
			'710': {
				'putup': 'Cone',
				'length': '5000m (5500yd)',
				'weight': '50W/2Ply',
			},
		}
	},
	// 982-256, 983-256
	'Supertwist': {
		'prefix': '',
		'fibre': 'Nylon/Polyamide',
		'code': {
			'922': {
				'putup': 'Spool',
				'length': '950m (1000yd)',
				'weight': '40W/2Ply',
			},
			'929': {
				'putup': 'Cone',
				'length': '2500m (2734yd)',
				'weight': '40W/2Ply',
			},
		}
	},
};

(function () {
	'use strict';
	let viewCountElem = document.querySelector('div#viewCount');
	if (viewCountElem) {
		createButtons();

		var itemCountElem = document.querySelector('#ResultSorting > div.countWrap > span.num');
		//var showAllElem = viewCountElem.querySelector('div.selectric-hide-select select option[value="500"]');
		//showAllElem.value = itemCountElem.innerText;

		var link = document.createElement('a');
		link.innerHTML = itemCountElem.outerHTML;
		link.setAttribute('href', window.location.origin + window.location.pathname + '?cp=1&ppp=' + itemCountElem.innerText + '&sort=title');

		itemCountElem.parentNode.insertBefore(link, itemCountElem);
		itemCountElem.remove();
	}
})();

function getCompany() {
	let company = 'Madeira';
	return company;
}

function getTitleElement() {
	let titleElement = document.querySelector('#page > div.subpage > div.row > div > h1');
	return titleElement;
}

function getCollection() {
	let collection = document.querySelectorAll('div.SearchResults > div.GridResult');
	return collection;
}

function formatInformation(item) {
	let title = getFormattedTitle();
	let company = getCompany();

	let nameElem = item.querySelector('a.productTitle');
	let givenName = nameElem?.innerText.toUpperCase() ?? '';	// 910-1001 MADEIRA CLASSIC RAYON #40 WEIGHT

	let descElem = item.querySelector('div.shortDesc');
	let givenDesc = descElem?.innerText ?? ''; // 5500yd CONE WHITE
	for (const ignore of ['ASST', 'COLLECTION', 'KIT']) {
		let ignoreIndex = givenDesc.toUpperCase().indexOf(ignore);
		if (ignoreIndex >= 0) {
			return;
		}
	}

	let spaceIndex = givenName.indexOf(' ');
	let givenCode = givenName.substring(0, spaceIndex); // 910-1001
	let givenTitle = givenName.substring(spaceIndex + 1); // MADEIRA CLASSIC RAYON #40 WEIGHT

	// 981-437 MADEIRA FS METALLIC 20 WEIGHT - SAPPHIRE
	// 612yd SPOOL BLUE
	let givenColour = '';
	let colorSuffix = 'WEIGHT - ';
	let dashIndex = givenTitle.toUpperCase().indexOf(colorSuffix);
	if (dashIndex >= 0) {
		dashIndex += colorSuffix.length;
		givenColour = givenTitle.substring(dashIndex).trim();	// SAPPHIRE
		givenTitle = givenTitle.substring(0, dashIndex - ' - '.length);	// MADEIRA FS METALLIC 20 WEIGHT
	}

	let weightRegex = /((?:#[0-9]+ WEIGHT)|(?:[0-9]+ WEIGHT)|(?:#[0-9]+)|(?:[0-9]+ WT))/i;
	let givenWeight = '';
	let matches = weightRegex.exec(givenTitle);
	if (matches && matches.length > 0) {
		givenWeight = matches[0]; // #40 WEIGHT
		givenTitle = givenTitle.replace(matches[0], '').replace(/[ ]+/g, ' ').trim(); // MADEIRA CLASSIC RAYON
	}
	else {
		let hashIndex = givenTitle.search(weightRegex);

		if (hashIndex >= 0) {
			givenWeight = givenTitle.substring(hashIndex); // #40 WEIGHT
			givenTitle = givenTitle.substring(0, hashIndex).trim(); // MADEIRA CLASSIC RAYON
		}
	}

	let givenSize = '';
	for (const size of ['CONE', 'SPOOL']) {
		let sizeIndex = givenDesc.toUpperCase().indexOf(size);
		if (sizeIndex >= 0) {
			sizeIndex += size.length;
			givenSize = givenDesc.substring(0, sizeIndex);	// 5500yd CONE
			if (givenColour.length < 1) givenColour = givenDesc.substring(sizeIndex).trim();	// WHITE
			break;
		}
	}

	let name = givenTitle.replace('MADEIRA', '');
	name = name.replace('BURMILANA CO', 'BURMILANA');
	name = name.trim().toTitleCase();
	name = name.replace('Fs Metallic', 'FS Metallic');
	name = name.replace('Polyester Cr Metallic', 'CR Metallic');
	let thisThread = threadLookup[name];
	let threadCode = givenCode.substring(0, givenCode.lastIndexOf('-'));

	let prefix = '';
	let material = 'MAT%';
	let length = '';
	let weight = '';
	if (thisThread && (thisThread.code.hasOwnProperty(threadCode) || thisThread.code.hasOwnProperty(givenCode))) {
		threadCode = thisThread.code.hasOwnProperty(threadCode) ? threadCode : givenCode;
		prefix = thisThread.prefix;
		material = thisThread.code[threadCode].fibre ?? thisThread.fibre;
		length = thisThread.code[threadCode].length;
		weight = thisThread.code[threadCode].weight;
	}
	else {
		let lenObj = getLengths(givenSize)
		length = lenObj.hasOwnProperty('Metres') ? `${lenObj.Metres.Measurement}m (${lenObj.Yards.Measurement}yd)` : `${lenObj.Measurement}${lenObj.Unit}`;
		weight = givenWeight.replace(/[^0-9]/g, '') + 'W';
	}

	let itemCode = (prefix + givenCode);
	let barCode = formatBarCode(itemCode);
	let purchaseCode = givenCode;

	let colour = givenColour.toTitleCase();

	// Metrosene 100 150m - 4000 Black
	let webName = `${name} ${parseInt(weight)} - ${length.substring(0, length.indexOf(' '))} - ${givenCode} ${colour}`;
	// Black - Metrosene 100 - 150m (164yd) - P100% - 60W/2P
	let description = `${colour} - ${name} ${parseInt(weight)} - ${length} - ${formatMaterial(material)} - ${weight.replace('Ply', 'P')}`;
	/*
	!! ONLY APPEARS ON PARENT !!
	Cotton, synthetics, mixed fabrics, linen or silk. Clothes make the man. And the universal thread METROSENE will ensure that you and your clothes make a particularly dazzling appearance - and more. Its excellent smoothness, high tensile strength and ideal sewability make the universal METROSENE a reliable partner for all your creations.<br>
	<b>Fibre: </b>100% Polyester, Corespun<br>
	<b>Length: </b>150m|164yd<br>
	<b>Weight: </b>60W/2Ply<br>
	<b>Box of: </b>5<br>
	<b>Needle size: </b>80-90
	*/
	let webDesc = '';

	let delDate = '';//toDeliveryString(getReleaseDates());
	let result = { 'itemCode': itemCode, 'barCode': barCode, 'description': description, 'webName': webName, 'webDesc': webDesc, 'delDate': delDate, 'purchaseCode': purchaseCode };
	return result;
}

// https://www.madeirausa.com/_resources/cache/images/product/910-1001_375x387-pad.jpg
// https://www.madeirausa.com/_resources/images/product/910-1001.jpg

function formatImage(item) {
	let thumbElem = item.querySelector('div.productImage img');
	let thumbUrl = thumbElem.src;

	let fullUrl = thumbUrl.replace('cache/', '').replace('_375x387-pad', '');
	return fullUrl;
}

function getLengths(lengthInput) {
	for (const size of ['CONE', 'SPOOL']) {
		lengthInput = lengthInput.replace(new RegExp(size, 'i'), '').trim();
	}

	let measurement = parseInt(lengthInput);
	let metres = -1;
	let yards = -1;
	let unit = lengthInput.replace(/^[0-9]+/, '');
	switch (unit.toUpperCase()) {
		case 'YD':
			yards = measurement;
			metres = yards * 0.9144;
			metres = MRound(metres, 5);
			break;
		case 'M':
			metres = measurement;
			yards = metres / 0.9144;
			yards = MRound(yards, 5);
			break;
		default:
			return { 'Measurement': measurement, 'Unit': unit };
	}
	return {
		'Metres': { 'Measurement': metres, 'Unit': 'm' },
		'Yards': { 'Measurement': yards, 'Unit': 'yd' }
	};
}

function MRound(number, roundto) {
	return roundto * Math.round(number / roundto);
}

function formatMaterial(matInput) {
	let result = matInput;
	let regex = /([0-9]+%) Acrylic/gi;
	result = result.replace(regex, 'A$1');
	regex = /([0-9]+%) Cotton/gi;
	result = result.replace(regex, 'C$1');
	regex = /([0-9]+%) Kevlar(?:\/Aramid)?/gi;
	result = result.replace(regex, 'K$1');
	regex = /([0-9]+%) Tencel(?:\/Lyocell)?/gi;
	result = result.replace(regex, 'L$1');
	regex = /([0-9]+%) Nylon(?:\/Polyamide)?/gi;
	result = result.replace(regex, 'N$1');
	regex = /([0-9]+%) Polyester/gi;
	result = result.replace(regex, 'P$1');
	regex = /([0-9]+%) Rayon(?:\/Viscose)?/gi;
	result = result.replace(regex, 'R$1');
	regex = /([0-9]+%) Wool/gi;
	result = result.replace(regex, 'W$1');
	regex = /Acrylic/gi;
	result = result.replace(regex, 'A100%');
	regex = /Cotton/gi;
	result = result.replace(regex, 'C100%');
	regex = /Kevlar(?:\/Aramid)?/gi;
	result = result.replace(regex, 'K100%');
	regex = /Tencel(?:\/Lyocell)?/gi;
	result = result.replace(regex, 'L100%');
	regex = /Nylon(?:\/Polyamide)?/gi;
	result = result.replace(regex, 'N100%');
	regex = /Polyester/gi;
	result = result.replace(regex, 'P100%');
	regex = /Rayon(?:\/Viscose)?/gi;
	result = result.replace(regex, 'R100%');
	regex = /Wool/gi;
	result = result.replace(regex, 'W100%');
	result = result.replace(/(?:, )/g, ' ').trim();
	result = result.replace(/[ ]+/g, ' ').trim();
	return result;
}