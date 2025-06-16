// ==UserScript==
// @name         # Studio E - Asset Date Sorter
// @namespace    http://www.tgoff.me/
// @version      2021.03.26.1
// @description  Allows sorting of the Band table in search results.
// @author       www.tgoff.me
// @match        *://studioefabrics.net/asset/*
// @match        *://*.studioefabrics.net/asset/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=studioefabrics.net
// @grant        none
// @run-at       document-idle
// ==/UserScript==

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function getMonthIndex(monthName) {
	let month = monthNames.indexOf(monthName);
	return month ? month : undefined;
}

(function () {
	'use strict';
	jQuery.extend(jQuery.fn.dataTableExt.oSort, {
		"MMMyyyy-pre": function (a) {
			a = a.split(' ');
			if (a.length < 1) return 0;
			return Date.parse(15 + '/' + getMonthIndex(a[0]) + '/' + a[1]);
		},
		"MMMyyyy-asc": function (a, b) {
			return ((a < b) ? -1 : ((a > b) ? 1 : 0));
		},
		"MMMyyyy-desc": function (a, b) {
			return ((a < b) ? 1 : ((a > b) ? -1 : 0));
		}
	});

	$('#con_table').dataTable({
		"columnDefs": [{
			targets: [6], type: "MMMyyyy"
		}]
	})
})();