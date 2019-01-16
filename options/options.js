/* eslint-disable no-unused-vars */
/* eslint-disable no-console */

const DEFAULTS = {
    boxSelectHotkey: 'b',
    deleteHotkey: 'q'
};

const selectInput = document.querySelector('#input_select_hotkey');
const deleteInput = document.querySelector('#input_delete_hotkey');
const saveButton = document.querySelector('#save');
const restoreButton = document.querySelector('#remember_defaults');

saveButton.addEventListener('click', save);
restoreButton.addEventListener('click', rememberDefaults);

selectInput.addEventListener('input', handleInput);
deleteInput.addEventListener('input', handleInput);

function handleInput(e) {
    const input = e.data;
    if (e.target.value.length > 1) {
        console.log('only 1 char');
        e.target.value = e.target.value.charAt(0);
        return;
    }
    e.target.value = e.target.value.toLowerCase();
    e.target.value;
    console.log(e);
}

function save() {
    // https://stackoverflow.com/questions/28277312/chrome-extensions-saving-settings
    let boxSelectHotkey = selectInput.value;
    let deleteHotkey = deleteInput.value;
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