/* eslint-disable no-console */

console.log('Box select extension on google calendar webpage active.');

// https://stackoverflow.com/questions/9602022/chrome-extension-retrieving-global-variable-from-webpage/9636008#9636008
// https://stackoverflow.com/questions/9515704/insert-code-into-the-page-context-using-a-content-script/9517879#9517879
const s = document.createElement('script');
s.src = chrome.runtime.getURL('js/script.js');
document.body.appendChild(s);
s.onload = function () {
    this.remove();
};

var style = document.createElement('link');
style.rel = 'stylesheet';
style.type = 'text/css';
style.href = chrome.runtime.getURL('css/box-select.css');
(document.head || document.documentElement).appendChild(style);


// b keycode - '66'
const MAIN_KEY_CODE = 66;
//const CONTEXT_MENU_HTML = '../context_menu/context_menu.html';

// is the key with the MAIN_KEY_CODE being pressed
let isKeyPressed = false;
let selector;
let events;
let selectedEvents;

/* function getElementByXPath(path) {
    return document.evaluate(
        path,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
    ).singleNodeValue;
} */

/* console.log('grid: ');
console.log(grid); */

function getEvents() {
    // Get all events
    //console.log('getEvents()');

    events = document.querySelectorAll('div[role=button]');
    events = Array.from(events).filter(event => {
        return event.dataset.eventid;
    });
    if (events.length === 0) {
        setTimeout(() => {
            console.log('No events found. Waiting 500ms.');
            getEvents();
        }, 500);
    }
    console.log(`Found ${events.length} events.`);
}

function highlightEvents(evts) {
    evts.forEach(evt => {
        //evt.classList.add('KKjvXb');
        evt.id = 'selected';
    });

}

function unHiglightEvents(evts) {
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
blocker.style.position = 'absolute';
blocker.style.width = '100%';
blocker.style.height = '100%';
blocker.style.left = '0';
blocker.style.top = '0';
blocker.style.zIndex = '10000';

function setBlocker(parent, state) {
    //console.log(`toggle blocker ${state ? 'on' : 'off'}`);
    state ? parent.insertBefore(blocker, parent.firstChild) : parent.removeChild(blocker);
    blockerCreated = state;
}
//#endregion

let isSelectionVisible = false;
class Selection {
    constructor(startX, startY, parent) {
        this.x = startX;
        this.y = startY;

        let element = document.createElement('div');
        element.style.position = 'absolute';
        element.style.display = 'block';
        element.style.width = '0%';
        element.style.height = '0%';
        element.style.border = '2px dotted #4484f0';
        element.style.backgroundColor = 'rgba(68,132,240, 0.3)';
        element.style.left = `${startX}px`;
        element.style.top = `${startY}px`;
        element.style.zIndex = '10001';
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
        let selectedEvents = [];

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
                selectedEvents.push(event);
            }
        });
        return selectedEvents;
    }


}

//#region ContextMenu
/* class ContextMenu {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.display();
    }
    display() {
        // Insert HTML with JS from file
        // https://stackoverflow.com/questions/15873904/adding-complex-html-using-a-chrome-content-script
        // https://stackoverflow.com/a/3535356/10854888
        const xhr = new XMLHttpRequest();
        xhr.open('GET', CONTEXT_MENU_HTML, true);
        xhr.onreadystatechange = function () {
            if (this.readyState !== 4) {
                console.error(this.readyState);
                return;
            }
            if (this.status !== 200) {
                console.error(this.status);
                return;
            } // or whatever error handling you want
            document.getElementById('y').innerHTML = this.responseText;
        };
        xhr.send();
    }

} */

//#endregion

async function deleteEvents() {
    const OK_PATH = '#yDmH0d > div.NBxL9e.iWO5td > div > div.I7OXgf.dT3uCc.gF3fI.fNxzgd.Inn9w.iWO5td > div.OE6hId.J9fJmf > div > div.uArJ5e.UQuaGc.kCyAyd.l3F1ye.ARrCac.HvOprf.evJWRb.M9Bg4d';
    const TRASH_PATH = '#xDetDlg > div > div.Tnsqdc > div > div > div.pPTZAe > div:nth-child(2) > div';
    for (entry of selectedEvents) {
        console.log(entry);
        //event
        entry.click();
        while (!document.querySelector('#yDmH0d > div > div > div.RDlrG.Inn9w.iWO5td')) {
            await new Promise(r => setTimeout(r, 50));
        }

        document.querySelector(TRASH_PATH).click();
        while (!document.querySelector(OK_PATH)) {
            await new Promise(r => setTimeout(r, 50));
        }

        document.querySelector(OK_PATH).click();
        console.log('waiting for ok to disappear');
        while (document.querySelector(OK_PATH)) {
            await new Promise(r => setTimeout(r, 150));
        }
        while (document.querySelector(TRASH_PATH)) {
            await new Promise(r => setTimeout(r, 150));
        }
        console.log('disappeared');
    }
}

function keyDown(e) {
    // Q
    if (e.keyCode === 81) {
        deleteEvents();
    }
    if (e.keyCode !== MAIN_KEY_CODE) return;

    if (!blockerCreated) {
        setBlocker(document.body, 1);
    } else return;
    unHiglightEvents(selectedEvents);
    getEvents();

    isKeyPressed = true;
}

function keyUp(e) {

    if (e.keyCode !== MAIN_KEY_CODE) return;
    // If something went wrong then also delete selection


    // Delete blocker
    if (blockerCreated) {
        setBlocker(document.body, 0);
    }

    //TODO: Delete shadow from selected

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
    //if (!isKeyPressed) return;
    if (!isSelectionVisible) return;

    unHiglightEvents(selectedEvents);
    selectedEvents = selector.selectedEvents();
    //console.log(selectedEvents);
    /*     selectedEvents.forEach(e => {
            const re = /click:(\S*);/;
            let jsaction = e.attributes.jsaction.nodeValue;
            jsaction = re.exec(jsaction)[1];

        }); */

    //TODO: Apply shadow to selected

    selector.destroy();
}

window.onkeydown = keyDown;
window.onkeyup = keyUp;
window.addEventListener('mousedown', boxSelectDown);
window.addEventListener('mouseup', boxSelectUp);
window.addEventListener('mousemove', boxSelectMove);
// On hash change listens to URL changes