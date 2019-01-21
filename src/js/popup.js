import '../css/popup.scss';

const del = document.querySelector('#delete');
const boxSelect = document.querySelector('#box-select');

boxSelect.addEventListener('click', () => {
    boxSelect.classList.add('select-active');

    chrome.tabs.query({
        active: true,
        currentWindow: true
    },
    function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: 'boxSelect'
        });
    }
    );
});

del.addEventListener('click', () => {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    },
    function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: 'delete'
        });
    }
    );
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action == 'boxSelectOff') {
        boxSelect.classList.remove('select-active');
    } else if (request.action == 'deleteStart') {
        del.classList.add('delete-active');
    } else if (request.action == 'deleteEnd') {
        del.classList.remove('delete-active');
    }
});