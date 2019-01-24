import Selection from './selection.js';
import Blocker from './blocker.js';
import Slidedown from './slidedown.js';

let SELECT_KEY = 'b';
let DELETE_KEY = 'q';
// is the key with the SELECT_KEY being pressed
let isKeyPressed = false;
let selector;
let selectorHistory = [];
let events;
let selectedEvents = new Set();

const blocker = new Blocker();
const slidedown = new Slidedown();

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
/* const s = document.createElement('script');
s.src = chrome.runtime.getURL('script.js');
document.body.appendChild(s);
s.onload = function() {
	this.remove();
}; */

// Inject stylesheet into website
var style = document.createElement('link');
style.rel = 'stylesheet';
style.type = 'text/css';
style.href = chrome.runtime.getURL('globalStyles.css');
(document.head || document.documentElement).appendChild(style);

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

function getEvents() {
	// Get all events
	//console.log('getEvents()');

	events = document.querySelectorAll('div[role~="button"], div[role~="presentation"]');
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

async function deleteEvents() {
	// Let popup.js know when deleting starts and ends for UX animation purposes
	chrome.runtime.sendMessage({
		action: 'deleteStart'
	});
	console.log('deleting these events:');
	console.log(selectedEvents);
	const OK_PATH =
		'div.I7OXgf.dT3uCc.gF3fI.fNxzgd.Inn9w.iWO5td > div.OE6hId.J9fJmf > div > div.uArJ5e.UQuaGc.kCyAyd.l3F1ye.ARrCac.HvOprf.evJWRb.M9Bg4d';
	const TRASH_PATH =
		'#xDetDlg > div > div.Tnsqdc > div > div > div.pPTZAe > div:nth-child(2) > div';
	for (let entry of selectedEvents) {
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
			if (i > 10) {
				reoccurringEvent = false;
				break;
			}
			//console.log(i);
			await new Promise(r => setTimeout(r, 50));
			//console.log(document.querySelector(OK_PATH));
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
	chrome.runtime.sendMessage({
		action: 'deleteEnd'
	});
}

/**
 * Instead of creating a bland, blue blocker overlay. Highlight the possible events, by changing their color!
 * Adds a 'possible' class to events.
 * */
function showPossibleEvents(evts) {
	evts.forEach(evt => {
		/* evtColor = rgb(202, 189, 191) */
		let evtColor = evt.style.backgroundColor;

		/* Extract numbers from rgb string to create brightened color. */
		let brColor = evtColor.match(/\d+/g).map(number => parseInt(number));

		/* Add 20 to every value to brighten it. */
		brColor = brColor.map(number => (number + 20 > 255 ? 255 : number + 20));
		brColor = `rgb(${brColor[0]}, ${brColor[1]}, ${brColor[2]})`;

		evt.oldColor = evtColor;

		let backgroundText = `-webkit-linear-gradient(left, ${evtColor} 0%, ${brColor} 50%, ${evtColor} 100%), linear-gradient(to right, ${evtColor} 0%, ${brColor} 50%,${evtColor} 100%)`;
		evt.style.background = backgroundText;
		evt.style.backgroundSize = '400% 400%';

		evt.oldZIndex = evt.style.zIndex;

		evt.style.zIndex = '10002';

		evt.classList.add('possible');
	});
}

/**
 *  Same as showPossibleEvents but in reverse.
 *  Removes the 'possible' class from events.
 * */
function hidePossibleEvents(evts) {
	evts.forEach(evt => {
		evt.style.background = '';
		console.log(`evt.oldColor = ${evt.oldColor}`);

		evt.style.backgroundColor = evt.oldColor;
		evt.style.zIndex = evt.OldZIndex;
		evt.classList.remove('possible');
	});
}

function keyDown(e) {
	// Q
	if (e.key === DELETE_KEY) {
		deleteEvents();
		return;
	}
	/** CTRL+Z -> UNDO last selector  */
	if (e.key === 'z' && e.ctrlKey && !e.repeat) {
		selectorHistory[selectorHistory.length - 1].destroy();
		selectorHistory.pop();
	}

	if (e.key !== SELECT_KEY) return;

	if (!blocker.created) {
		blocker.setState(document.body, 1);

		if (!Slidedown.created) {
			Slidedown.created = true;
			slidedown.appendToDOM(document.body);
		}

		slidedown.down();

		unHighlightEvents(selectedEvents);
		getEvents();

		showPossibleEvents(events);
		isKeyPressed = true;
		selectedEvents = new Set();
	}
}

function keyUp(e) {
	if (e.key !== SELECT_KEY) return;

	slidedown.up();

	hidePossibleEvents(events);

	// Delete blocker
	if (blocker.created) {
		blocker.setState(document.body, 0);
	}

	if (Selection.visible) {
		selector.disable();
		//selector.destroy();
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

	if (!Selection.visible) {
		/* if (1) { */
		selector = new Selection(e.clientX, e.clientY, document.body);
		selectorHistory.push(selector);
		selector.display(e.clientX, e.clientY);
	}
}

function boxSelectMove(e) {
	if (!isKeyPressed) return;
	if (!Selection.visible) return;

	//e.target = blocker
	selector.display(e.clientX, e.clientY);
}

function boxSelectUp() {
	if (!Selection.visible) return;

	// Merge current selected events with the newly selected ones
	selectedEvents = selectedEvents.union(selector.selectedEvents(events));

	highlightEvents(selectedEvents);
	//selector.destroy();
	selector.disable();

	// If triggered from popup/popup.html then remember to remove the blocker!
	if (popupModeDelete) {
		keyUp({
			key: 'b'
		});

		// Get rid of highlight when box select div active in popup.html
		chrome.runtime.sendMessage({
			action: 'boxSelectOff'
		});

		popupModeDelete = false;
	}
}

window.onkeydown = keyDown;
window.onkeyup = keyUp;
window.addEventListener('mousedown', boxSelectDown);
window.addEventListener('mouseup', boxSelectUp);
window.addEventListener('mousemove', boxSelectMove);
// On hash change listens to URL changes
