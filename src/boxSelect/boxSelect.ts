import Blocker from './classes/Blocker';
import CalendarEvent from './classes/CalendarEvent';
import CalendarEvents from './classes/CalendarEvents';
import Selection from './classes/Selection';
import Slidedown from './classes/Slidedown';
/* import IcalendarEventHTMLElement from './interfaces/IcalendarEventHTMLElement'; */
/* import IselectionReturn from './interfaces/IselectionReturn'; */
import IuncompletedRequest from './interfaces/IuncompletedRequest';
import repeatWebRequest from './repeatWebRequest';
import './types/Set';
import IcalendarEventHTMLElement from './interfaces/IcalendarEventHTMLElement';
/* import IselectionReturn from './interfaces/IselectionReturn'; */

let SELECT_KEY = 'b';
let DELETE_KEY = 'q';
// is the key with the SELECT_KEY being pressed
let isKeyPressed = false;
let selector: Selection;
// let eventsHTMLElements: IcalendarEventHTMLElement[];
const events: CalendarEvents = new CalendarEvents();
/* let selectedEvents: Set<IcalendarEventHTMLElement> = new Set();
let selectedEventsIds: string[] = []; */
const uncompletedRequest: IuncompletedRequest = {
	onBeforeRequest: null,
	onSendHeaders: null,
	requestId: null
};

const blocker = new Blocker();
const slidedown = new Slidedown();

let popupModeDelete = false;

/** Ran after load to find events that changed DOM hierarchy e.g. after dragging. */
function resetSelectedEvents() {
	console.log('events.selected before reload:');
	console.log(events.selected);;
	/* (selectedEvents as Set<IcalendarEventHTMLElement>).clear(); */
	events.getVisible();
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
			const idIsInTheSelectedEvents = events.selected.ids.includes(
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

			repeatWebRequest(events.selected, uncompletedRequest);
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
		case 'containsLoadOnCompleted': {
			console.log('containsLoadOnCompleted');
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
	events = new CalendarEvents(data.detail.map(event => {
		const constructor = {
			eid: event.eid,
			title: event.title,
			startDate: event.startDate,
			endDate: event.endDate
		};
		return new CalendarEvent(constructor);
	}));
});

// Inject stylesheet into website
const style = document.createElement('link');
style.rel = 'stylesheet';
style.type = 'text/css';
style.href = chrome.runtime.getURL('globalStyles.css');
(document.head || document.documentElement).appendChild(style);

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

function keyDown(e: { key: string } | KeyboardEvent) {
	// Q
	if (e.key === DELETE_KEY) {
		events.clickTrashcan(events.selected);
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

		/* unHighlightEvents(selectedEvents) */
		events.selected.setHighlight(false);
		events.getVisible();

		events.addGradientAnimation(eventsHTMLElements);
		isKeyPressed = true;
		selectedEvents.clear();
	}
}

function keyUp(e: { key: string } | KeyboardEvent) {
	if (e.key !== SELECT_KEY) {
		return;
	}

	slidedown.up();

	events.removeGradientAnimation(eventsHTMLElements);

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
	let newSelectedEvents = selector.selectedEvents(
		eventsHTMLElements
	);
	selectedEvents = newSelectedEvents.newSelectedEvents;
	selectedEventsIds = newSelectedEvents.selectedEventsIds;

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
