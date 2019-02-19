/* Google Calendar Box Select | MIT License | Copyright (c) 2019 Jakub Koralewski */
import '../fonts/OpenSans-Bold.ttf';
import '../fonts/OpenSans-Regular.ttf';
import '../fonts/OpenSans-SemiBold.ttf';
import './options.scss';

/* i18n */
const optionsText = chrome.i18n.getMessage('options');

document.documentElement.lang = chrome.i18n.getMessage('@@ui_locale');
document.title = optionsText;
(document.querySelector('#toolbar #title') as HTMLDivElement).innerText = optionsText;
document.querySelector('#select_text').innerHTML = chrome.i18n.getMessage('selectHotkey', [
	'<b>',
	'</b>'
]);
document.querySelector('#delete_text').innerHTML = chrome.i18n.getMessage('deleteHotkey', [
	'<b>',
	'</b>'
]);
(document.querySelector('input#save') as HTMLInputElement).value = chrome.i18n.getMessage('save');
(document.querySelector('input#remind_defaults') as HTMLButtonElement).value = chrome.i18n.getMessage('remindDefaults');
(document.querySelector('h2#taken') as HTMLHeadingElement).innerText = chrome.i18n.getMessage('takenShortcuts');

const DEFAULTS = {
	boxSelectHotkey: 'b',
	deleteHotkey: 'q'
};

const listItems = document.querySelectorAll('#taken-inner > ul > *');
listItems.forEach(li => {
	(li.firstChild as HTMLElement).classList.add('selector-bg');
});

const logo: HTMLImageElement = document.querySelector('#logo');

logo.src = 'icon-48.png';

// let CURRENT = {};

const selectInput: HTMLInputElement = document.querySelector('#input_select_hotkey');
const deleteInput: HTMLInputElement = document.querySelector('#input_delete_hotkey');
const saveButton: HTMLButtonElement = document.querySelector('#save');
const restoreButton: HTMLButtonElement = document.querySelector('#remind_defaults');

function updatePlaceholders(select, del) {
	selectInput.placeholder = select || DEFAULTS.boxSelectHotkey;
	deleteInput.placeholder = del || DEFAULTS.deleteHotkey;
}

chrome.storage.sync.get(['boxSelectHotkey', 'deleteHotkey'], data => {
	updatePlaceholders(data.boxSelectHotkey, data.deleteHotkey);
});

chrome.storage.onChanged.addListener(data => {
	console.log(data);
	updatePlaceholders(data.boxSelectHotkey.newValue, data.deleteHotkey.newValue);
});

saveButton.addEventListener('click', save);
restoreButton.addEventListener('click', rememberDefaults);

selectInput.addEventListener('input', handleInput);
deleteInput.addEventListener('input', handleInput);

interface InputEvent extends Event {
	target: HTMLInputElement;
}

function handleInput(e: InputEvent) {
	// const input = e.data;
	if (e.target.value.length > 1) {
		console.log('only 1 char');
		e.target.value = e.target.value.charAt(0);
		return;
	}
	e.target.value = e.target.value.toLowerCase();
	console.log(e);
}

function save() {
	// https://stackoverflow.com/questions/28277312/chrome-extensions-saving-settings
	const boxSelectHotkey = selectInput.value;
	const deleteHotkey = deleteInput.value;
	if (!boxSelectHotkey || !deleteHotkey) {
		console.log('no input in one or more');
		return;
	}
	console.log(boxSelectHotkey, deleteHotkey);
	chrome.storage.sync.set({
		boxSelectHotkey,
		deleteHotkey
	});
}

function rememberDefaults() {
	selectInput.value = DEFAULTS.boxSelectHotkey;
	deleteInput.value = DEFAULTS.deleteHotkey;
}
