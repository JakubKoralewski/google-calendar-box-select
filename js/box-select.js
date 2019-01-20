/* eslint-disable no-console */
let popupModeDelete = false;
chrome.runtime.onMessage.addListener(function(request) {
    if (request.action == 'boxSelect') {
        console.log('boxSelect');
        popupModeDelete = true;

        keyDown({
            key: 'b'
        });
    } else if (request.action == 'delete') {
        window.focus();
        keyDown({
            key: 'q'
        });
        console.log('delete');
    }
});

console.log('Box select extension on google calendar webpage active.');

// https://stackoverflow.com/questions/9602022/chrome-extension-retrieving-global-variable-from-webpage/9636008#9636008
// https://stackoverflow.com/questions/9515704/insert-code-into-the-page-context-using-a-content-script/9517879#9517879
const s = document.createElement('script');
s.src = chrome.runtime.getURL('js/script.js');
document.body.appendChild(s);
s.onload = function() {
    this.remove();
};

// Inject stylesheet into website
var style = document.createElement('link');
style.rel = 'stylesheet';
style.type = 'text/css';
style.href = chrome.runtime.getURL('css/box-select.css');
(document.head || document.documentElement).appendChild(style);

let SELECT_KEY = 'b';
let DELETE_KEY = 'q';

Set.prototype.union = function(setB) {
    var union = new Set(this);
    for (var elem of setB) {
        union.add(elem);
    }
    return union;
};

chrome.storage.sync.get(['boxSelectHotkey', 'deleteHotkey'], function(data) {
    SELECT_KEY = data.boxSelectHotkey || SELECT_KEY;
    DELETE_KEY = data.deleteHotkey || DELETE_KEY;
});
console.log(`SELECT_KEY: ${SELECT_KEY}; DELETE_KEY: ${DELETE_KEY}`);

chrome.storage.onChanged.addListener(function(data) {
    console.log(data);
    SELECT_KEY = data.boxSelectHotkey.newValue || SELECT_KEY;
    DELETE_KEY = data.deleteHotkey.newValue || DELETE_KEY;
});

// is the key with the SELECT_KEY being pressed
let isKeyPressed = false;
let selector;
let events;
let selectedEvents = new Set();

function getEvents() {
    // Get all events
    //console.log('getEvents()');

    events = document.querySelectorAll(
        'div[role~="button"], div[role~="presentation"]'
    );
    events = Array.from(events);
    events = events.filter(event => {
        return event.dataset.eventid;
    });
    //console.log(events);
    console.log(`Found ${events.length} events.`);
}

function highlightEvents(evts) {
    evts.forEach(evt => {
        //evt.classList.add('KKjvXb');
        evt.id = 'selected';
    });
}

function unHighlightEvents(evts) {
    if (!evts) return;
    evts.forEach(evt => {
        evt.id = '';
        //evt.classList.remove('KKjvXb');
    });
}

//let grid = getElementByXPath('/html/body/div[2]/div[1]/div[1]/div[2]');
//#region blocker

// Blocker will disable click reaction when holding e.g. 'B'
let blockerCreated = false;

const blocker = document.createElement('div');
blocker.id = 'blocker';

function setBlocker(parent, state) {
    //console.log(`toggle blocker ${state ? 'on' : 'off'}`);
    state
        ? parent.insertBefore(blocker, parent.firstChild)
        : parent.removeChild(blocker);
    blockerCreated = state;
}
//#endregion

let isSelectionVisible = false;
class Selection {
    constructor(startX, startY, parent) {
        this.x = startX;
        this.y = startY;

        let element = document.createElement('div');
        element.style.left = `${startX}px`;
        element.style.top = `${startY}px`;

        element.id = 'selector';
        this.element = element;

        this.parent = parent;
        isSelectionVisible = true;

        this.parent.insertBefore(this.element, this.parent.firstChild);
    }

    display(x, y) {
        // https://stackoverflow.com/questions/30983000/how-to-workaround-a-negative-height-and-width

        this.element.style.width = Math.abs(x - this.x) + 'px';
        this.element.style.height = Math.abs(y - this.y) + 'px';

        if (y < this.y) {
            this.element.style.top = y + 'px';
            this.element.style.height = Math.abs(y - this.y) + 'px';
        }
        if (x < this.x) {
            this.element.style.left = x + 'px';
            this.element.style.width = Math.abs(x - this.x) + 'px';
        }
    }

    destroy() {
        this.parent.removeChild(this.element);
        isSelectionVisible = false;
    }

    selectedEvents() {
        let selected = new Set();

        // 102px (string) -> 102 (number)
        let left = this.element.style.left;
        left = parseInt(left.substring(0, left.length - 2));

        let top = this.element.style.top;
        top = parseInt(top.substring(0, top.length - 2));

        let height = this.element.style.height;
        height = parseInt(height.substring(0, height.length - 2));

        let width = this.element.style.width;
        width = parseInt(width.substring(0, width.length - 2));

        let right = left + width;
        let bottom = top + height;

        events.forEach(event => {
            let b = event.getBoundingClientRect();

            const eventsLeftEdgeToTheLeftOfRightEdge = b.left < right;
            const eventsRightEdgeToTheRightOfLeftEdge = b.right > left;
            const eventsTopAboveBottom = b.top < bottom;
            const eventsBottomBelowTop = b.bottom > top;

            // If event overlaps selector
            if (
                eventsLeftEdgeToTheLeftOfRightEdge &&
                eventsRightEdgeToTheRightOfLeftEdge &&
                eventsTopAboveBottom &&
                eventsBottomBelowTop
            ) {
                selected.add(event);
            }
        });
        return selected;
    }
}

async function deleteEvents() {
    // Let popup.js know when deleting starts and ends for UX animation purposes
    chrome.runtime.sendMessage({ action: 'deleteStart' });
    console.log('deleting these events:');
    console.log(selectedEvents);
    const OK_PATH = 'div.I7OXgf.dT3uCc.gF3fI.fNxzgd.Inn9w.iWO5td > div.OE6hId.J9fJmf > div > div.uArJ5e.UQuaGc.kCyAyd.l3F1ye.ARrCac.HvOprf.evJWRb.M9Bg4d';
    const TRASH_PATH =
        '#xDetDlg > div > div.Tnsqdc > div > div > div.pPTZAe > div:nth-child(2) > div';
    for (entry of selectedEvents) {
        //event
        entry.click();
        while (!document.querySelector(TRASH_PATH)) {
            await new Promise(r => setTimeout(r, 50));
        }

        document.querySelector(TRASH_PATH).click();

        /* The whole deal with the i variable below is important!
           There are multiple ways a delete process in Google Calendar works.
           If an event is reoccurring there is another popup
           that checks whether you want to delete just this event or this and next or all.
           So basically:
           If there is no popup it ( waits 5 times ) then goes to next.
        */
        let i = 0;
        let reoccurringEvent = true;
        while (!document.querySelector(OK_PATH)) {
            if (i > 9) OK_PATH = OK_PATH2;
            if (i > 10) {
                reoccurringEvent = false;
                break;
            }
            //console.log(i);
            await new Promise(r => setTimeout(r, 50));
            console.log(document.querySelector(OK_PATH));
            i++;
        }
        if (!reoccurringEvent) continue;

        document.querySelector(OK_PATH).click();
        console.log('waiting for ok to disappear');
        while (document.querySelector(OK_PATH)) {
            await new Promise(r => setTimeout(r, 250));
        }
        while (document.querySelector(TRASH_PATH)) {
            await new Promise(r => setTimeout(r, 350));
        }
        console.log('disappeared');
    }
    unHighlightEvents(selectedEvents);
    chrome.runtime.sendMessage({ action: 'deleteEnd' });
}

function keyDown(e) {
    // Q
    if (e.key === DELETE_KEY) {
        deleteEvents();
    }
    if (e.key !== SELECT_KEY) return;

    // Clear selected events

    if (!blockerCreated) {
        setBlocker(document.body, 1);
        unHighlightEvents(selectedEvents);
        getEvents();
        isKeyPressed = true;
        selectedEvents = new Set();
    }
}

function keyUp(e) {
    if (e.key !== SELECT_KEY) return;
    // If something went wrong then also delete selection

    // Delete blocker
    if (blockerCreated) {
        setBlocker(document.body, 0);
    }

    if (isSelectionVisible) {
        selector.destroy();
    }

    isKeyPressed = false;
}

function boxSelectDown(e) {
    // If B is not being held dont do anything
    if (!isKeyPressed) return;
    // If it's a right click dont create selection
    // 2 = right button
    if (e.button === 2) {
        //TODO: context menu
        //contextMenu = new ContextMenu(e.clientX, e.clientY, e.button);
        return;
    }

    if (!isSelectionVisible) {
        selector = new Selection(e.clientX, e.clientY, document.body);
        selector.display(e.clientX, e.clientY);
    }
}

function boxSelectMove(e) {
    if (!isKeyPressed) return;
    if (!isSelectionVisible) return;

    //e.target = blocker
    selector.display(e.clientX, e.clientY);
}

function boxSelectUp(e) {
    if (!isSelectionVisible) return;

    // Merge current selected events with the newly selected ones
    selectedEvents = selectedEvents.union(selector.selectedEvents());

    highlightEvents(selectedEvents);
    selector.destroy();

    // If triggered from popup/popup.html then remember to remove the blocker!
    if (popupModeDelete) {
        keyUp({ key: 'b' });

        // Get rid of highlight when box select div active in popup.html
        chrome.runtime.sendMessage({ action: 'boxSelectOff' });

        popupModeDelete = false;
    }
}

window.onkeydown = keyDown;
window.onkeyup = keyUp;
window.addEventListener('mousedown', boxSelectDown);
window.addEventListener('mouseup', boxSelectUp);
window.addEventListener('mousemove', boxSelectMove);
// On hash change listens to URL changes
