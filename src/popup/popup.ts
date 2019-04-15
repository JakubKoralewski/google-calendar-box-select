/* Google Calendar Box Select | MIT License | Copyright (c) 2019 Jakub Koralewski */
import { browser } from 'webextension-polyfill-ts';
import './popup.scss';

/* i18n */
document.documentElement.lang = browser.i18n.getMessage('@@ui_locale');

const del = document.querySelector('#delete');
const boxSelect = document.querySelector('#box-select');

boxSelect.addEventListener('click', () => {
	boxSelect.classList.add('select-active');

	browser.tabs
		.query({
			active: true,
			currentWindow: true
		})
		.then(tabs => {
			browser.tabs.sendMessage(tabs[0].id, {
				action: 'boxSelect'
			});
		});
});

del.addEventListener('click', () => {
	browser.tabs
		.query({
			active: true,
			currentWindow: true
		})
		.then(tabs => {
			browser.tabs.sendMessage(tabs[0].id, {
				action: 'delete'
			});
		});
});

browser.runtime.onMessage.addListener(request => {
	if (request.action === 'boxSelectOff') {
		boxSelect.classList.remove('select-active');
	} else if (request.action === 'deleteStart') {
		del.classList.add('delete-active');
	} else if (request.action === 'deleteEnd') {
		del.classList.remove('delete-active');
	}
});
