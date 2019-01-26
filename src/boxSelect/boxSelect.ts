import Blocker from './classes/Blocker';
import CalendarEvent from './classes/CalendarEvent';
import CalendarEvents from './classes/CalendarEvents';
import Selection from './classes/Selection';
import Slidedown from './classes/Slidedown';
import ICalendarEventHTMLElement from './interfaces/ICalendarEventHTMLElement';
import IUncompletedRequest from './interfaces/IUncompletedRequest';
import repeatWebRequest from './repeatWebRequest';

let SELECT_KEY = 'b';
let DELETE_KEY = 'q';
// is the key with the SELECT_KEY being pressed
let isKeyPressed = false;
let selector: Selection;
let eventsHTMLElements: ICalendarEventHTMLElement[];
let allEvents: CalendarEvents;
let selectedEvents: Set<CalendarEvent> = new Set();
let selectedEventsIds: string[] = [];
const uncompletedRequest: IUncompletedRequest = {onBeforeRequest: null, onSendHeaders: null, requestId: null};

const blocker = new Blocker();
const slidedown = new Slidedown();

let popupModeDelete = false;

function resetSelectedEvents() {
	console.log('selectedEvents before reload:');
	console.log(selectedEvents);
	selectedEvents.forEach(event => {
		event.element.id = '';
	});
	selectedEvents.clear();
	getEvents();
	const newSelectedEvents = eventsHTMLElements.filter(event => {
		return selectedEventsIds.includes(event.dataset.eventid);
	});
	newSelectedEvents.forEach(event => {
		event.id = 'selected';
	});
	selectedEvents = new Set(newSelectedEvents);
	selectedEventsIds = newSelectedEvents.map(event => event.dataset.eventid);
	console.log('selectedEvents after reload:');
	console.log(selectedEvents);
}

chrome.runtime.onMessage.addListener(request => {
	switch (request.action) {
		case 'boxSelect':
			console.log('boxSelect');
			popupModeDelete = true;

			keyDown({
				key: 'b'
			});
			break;
		case 'delete':
			window.focus();
			keyDown({
				key: 'q'
			});
			console.log('delete');
			break;
		case 'onBeforeRequest': {
			/* Check if that request pertains to actions made to events */
			const webRequestEventId =
				request.details.requestBody.formData.eid[0];
			const idIsInTheSelectedEvents = selectedEventsIds.includes(
				webRequestEventId
			);

			if (idIsInTheSelectedEvents) {
				uncompletedRequest.requestId = request.details.requestId;
				uncompletedRequest.onBeforeRequest = request.details;
				console.log(request.details);
			}
			break;
		}
		case 'onSendHeaders': {
			if (uncompletedRequest.requestId !== request.details.requestId) {
				return;
			}
			console.log('onSendHeaders: ');
			console.log(request.details);
			uncompletedRequest.onSendHeaders = request.details;

			repeatWebRequest(selectedEvents, uncompletedRequest);
			break;
		}
		case 'onCompleted': {
			if (uncompletedRequest.requestId !== request.details.requestId) {
				return;
			}
			console.log('onCompleted:');
			console.log(request.details);

			resetSelectedEvents();
			break;
		}
		case 'containsLoadonCompleted': {
			console.log('containsLoadonCompleted');
			// TODO: if new events present add to all events / update allEvents

			resetSelectedEvents();
			break;
		}
		default:
			throw new Error(`unknown request.action: ${request.action}`);
	}
});

console.log('Box select extension on google calendar webpage active.');

const s: HTMLScriptElement = document.createElement('script');
s.src = chrome.runtime.getURL('script.js');
document.body.insertBefore(s, document.documentElement.lastChild);
s.onload = () => {
	s.remove();
};

window.addEventListener('injectedScriptInitialData', (data: CustomEvent) => {
	allEvents = data.detail.map(event => {
		const constructor = {eid: event.eid, title: event.title, startDate: event.startDate, endDate: event.endDate};
		return new CalendarEvent(constructor);
	});
});

// Inject stylesheet into website
const style = document.createElement('link');
style.rel = 'stylesheet';
style.type = 'text/css';
style.href = chrome.runtime.getURL('globalStyles.css');
(document.head || document.documentElement).appendChild(style);

Set.prototype.union = function(setB) {
	const union = new Set(this);
	for (const elem of setB) {
		union.add(elem);
	}
	return union;
};

chrome.storage.sync.get(['boxSelectHotkey', 'deleteHotkey'], data => {
	SELECT_KEY = data.boxSelectHotkey || SELECT_KEY;
	DELETE_KEY = data.deleteHotkey || DELETE_KEY;
});
console.log(`SELECT_KEY: ${SELECT_KEY}; DELETE_KEY: ${DELETE_KEY}`);

chrome.storage.onChanged.addListener(data => {
	console.log(data);
	SELECT_KEY = data.boxSelectHotkey.newValue || SELECT_KEY;
	DELETE_KEY = data.deleteHotkey.newValue || DELETE_KEY;
});

function getEvents() {
	// Get all visible events

	eventsHTMLElements = Array.from(
		document.querySelectorAll(
			'div[role~="button"], div[role~="presentation"]'
		)
	);
	eventsHTMLElements = eventsHTMLElements.filter(event => {
		return event.dataset.eventid;
	});
	// console.log(events);
	console.log(`Found ${eventsHTMLElements.length} events.`);
	return eventsHTMLElements;
}

function highlightEvents(evts: ICalendarEventHTMLElement[]) {
	evts.forEach(evt => {
		evt.id = 'selected';
	});
}

function unHighlightEvents(evts: ICalendarEventHTMLElement[]) {
	evts.forEach(evt => {
		evt.id = '';
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
	for (const entry of selectedEvents) {
		// event
		entry.click();
		while (!document.querySelector(TRASH_PATH)) {
			await new Promise(r => setTimeout(r, 50));
		}

		(document.querySelector(TRASH_PATH) as ICalendarEventHTMLElement).click();

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
			// console.log(i);
			await new Promise(r => setTimeout(r, 50));
			// console.log(document.querySelector(OK_PATH));
			i++;
		}
		if (!reoccurringEvent) {
			continue;
		}

		(document.querySelector(OK_PATH) as ICalendarEventHTMLElement).click();
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
 */
function showPossibleEvents(evts) {
	evts.forEach((evt: ICalendarEventHTMLElement) => {
		/* evtColor = rgb(202, 189, 191) */
		const evtColor: string = evt.style.backgroundColor;

		/* Extract numbers from rgb string to create brightened color. */
		let brColor: number[] | string = evtColor
			.match(/\d+/g)
			.map((colorValue: string) => parseInt(colorValue, 10));

		/* Add 20 to every value to brighten it. */
		brColor = brColor.map(colorValue =>
			colorValue + 20 > 255 ? 255 : colorValue + 20
		);
		brColor = `rgb(${brColor[0]}, ${brColor[1]}, ${brColor[2]})`;

		evt.setAttribute('oldColor', evtColor);

		const backgroundText = `-webkit-linear-gradient(left, ${evtColor} 0%, ${brColor} 50%, ${evtColor} 100%), linear-gradient(to right, ${evtColor} 0%, ${brColor} 50%,${evtColor} 100%)`;
		evt.style.background = backgroundText;
		evt.style.backgroundSize = '400% 400%';

		evt.style.zIndex = '10002';

		evt.classList.add('possible');
	});
}

/**
 *  Same as showPossibleEvents but in reverse.
 *  Removes the 'possible' class from events.
 */
function hidePossibleEvents(evts: ICalendarEventHTMLElement[]) {
	console.log('restoring old zindex and color');
	evts.forEach(evt => {
		evt.style.background = '';

		evt.style.backgroundColor = evt.getAttribute('oldColor');
		evt.style.zIndex = '4';
		evt.classList.remove('possible');
	});
}

function keyDown(e: { key: string }) {
	// Q
	if (e.key === DELETE_KEY) {
		deleteEvents();
	}
	if (e.key !== SELECT_KEY) {
		return;
	}

	if (!blocker.created) {
		blocker.setState(document.body, true);

		if (!Slidedown.created) {
			Slidedown.created = true;
			slidedown.appendToDOM(document.body);
		}

		slidedown.down();

		unHighlightEvents(selectedEvents);
		getEvents();

		showPossibleEvents(eventsHTMLElements);
		isKeyPressed = true;
		selectedEvents.clear();
	}
}

function keyUp(e: {key: string}) {
	if (e.key !== SELECT_KEY) {
		return;
	}

	slidedown.up();

	hidePossibleEvents(eventsHTMLElements);

	// Delete blocker
	if (blocker.created) {
		blocker.setState(document.body, false);
	}

	if (Selection.visible) {
		selector.destroy();
	}

	isKeyPressed = false;
}

function boxSelectDown(e: MouseEvent) {
	// If B is not being held dont do anything
	if (!isKeyPressed) {
		return;
	}
	// If it's a right click dont create selection
	// 2 = right button
	if (e.button === 2) {
		// TODO: context menu
		// contextMenu = new ContextMenu(e.clientX, e.clientY, e.button);
		return;
	}

	if (!Selection.visible) {
		selector = new Selection(e.clientX, e.clientY, document.body);
		selector.display(e.clientX, e.clientY);
	}
}

function boxSelectMove(e: MouseEvent) {
	if (!isKeyPressed) {
		return;
	}
	if (!Selection.visible) {
		return;
	}

	// e.target = blocker
	selector.display(e.clientX, e.clientY);
}

function boxSelectUp() {
	if (!Selection.visible) {
		return;
	}
	let newSelectedEvents = null;

	({ newSelectedEvents, selectedEventsIds } = selector.selectedEvents(
		eventsHTMLElements
	));

	// Merge current selected events with the newly selected ones
	selectedEvents = selectedEvents.union(newSelectedEvents);

	highlightEvents(selectedEvents);
	selector.destroy();

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
