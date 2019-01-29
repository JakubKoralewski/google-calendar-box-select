import './popup.scss';

/* i18n */
document.documentElement.lang = chrome.i18n.getMessage('@@ui_locale');

const del = document.querySelector('#delete');
const boxSelect = document.querySelector('#box-select');

boxSelect.addEventListener('click', () => {
	boxSelect.classList.add('select-active');

	chrome.tabs.query(
		{
			active: true,
			currentWindow: true
		},
		function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {
				action: 'boxSelect'
			});
		}
	);
});

del.addEventListener('click', () => {
	chrome.tabs.query(
		{
			active: true,
			currentWindow: true
		},
		function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {
				action: 'delete'
			});
		}
	);
});

chrome.runtime.onMessage.addListener(function(request) {
	if (request.action == 'boxSelectOff') {
		boxSelect.classList.remove('select-active');
	} else if (request.action == 'deleteStart') {
		del.classList.add('delete-active');
	} else if (request.action == 'deleteEnd') {
		del.classList.remove('delete-active');
	}
});