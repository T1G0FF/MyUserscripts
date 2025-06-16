// ==UserScript==
// @name         eParcel - Consignee Buttons
// @namespace    http://www.tgoff.me/
// @version      2025.06.13.1
// @description  Adds buttons to display all records and also one to quick export all shown records.
// @author       www.tgoff.me
// @match        *://online.auspost.com.au/eParcel/merchant/auth/viewConsigneeList.do
// @match        *://online.auspost.com.au/eParcel/merchant/auth/submitCreateConsignee.do
// @match        *://eparcel.auspost.com.au/eParcel/merchant/auth/viewConsigneeList.do
// @match        *://eparcel.auspost.com.au/eParcel/merchant/auth/submitCreateConsignee.do
// @icon         https://www.google.com/s2/favicons?sz=64&domain=auspost.com.au
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
	'use strict';
	let buttonRow = document.querySelector('#consForm > table > tbody > tr:nth-child(3) > td');
	if (!buttonRow) return;
	let exportToCSV = buttonRow.querySelector('input[name="smtbtn"][value="Export to CSV"]');

	let selectAlls = document.querySelectorAll('form[name="consigneeListForm"] input[type="checkbox"][name="selectAll"]');
	if (!selectAlls || selectAlls.length != 1) return;
	let selectAll = selectAlls[0];
	let paginationForms = document.querySelectorAll('form[name="paginationForm"]');
	if (!paginationForms || paginationForms.length != 1) return;
	let paginationForm = paginationForms[0];
	let pageSizeInputs = paginationForm.querySelectorAll('input[name="pageSize"]');
	if (!pageSizeInputs || pageSizeInputs.length != 1) return;
	let pageSize = pageSizeInputs[0];

	let exportButton = document.createElement('button');
	exportButton.type = 'button';
	exportButton.innerText = 'Quick Export';
	exportButton.classList += 'button primary';
	exportButton.onclick = function () {
		if (!selectAll.checked) selectAll.click();
		exportToCSV.click();
	}
	buttonRow.appendChild(exportButton);

	buttonRow.appendChild(document.createTextNode("\u00A0 ")); // &nbsp;

	let showAllButton = document.createElement('button');
	showAllButton.type = 'button';
	showAllButton.innerText = 'Show All';
	showAllButton.classList += 'button primary';
	showAllButton.onclick = function () {
		pageSize.value = '100000';
		paginationForm.submit();
	}
	buttonRow.appendChild(showAllButton);
})();