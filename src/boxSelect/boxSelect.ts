import {
	Blocker,
	CalendarEvent,
	CalendarEvents,
	DEFAULT_DELETE_KEY,
	DEFAULT_SELECT_KEY,
	Idetail,
	IloadFormData,
	IuncompletedRequest,
	repeatWebRequest,
	Selection,
	Slidedown
} from '.';

let SELECT_KEY = DEFAULT_SELECT_KEY;
let DELETE_KEY = DEFAULT_DELETE_KEY;

/** is the key with the SELECT_KEY being pressed */
let isSelectKeyPressed = false;
let selector: Selection;
// let events.elements: IcalendarEventHTMLElement[];
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

chrome.runtime.onMessage.addListener(async request => {
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

		// The order of these events corresponds to the order they come in!

		case 'onBeforeRequest': {
			if (!events.selected) return;

			/* Check if that request pertains to actions made to events */
			const webRequestEventId =
				request.details.requestBody.formData.eid[0];
			// FIXME: ids undefined when not selected
			const idIsInTheSelectedEvents =
				events.selected.ids.includes(webRequestEventId) || false;

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

			if (!events.selected) return;
			console.log('onSendHeaders: ');
			console.log(request.details);
			uncompletedRequest.onSendHeaders = request.details;

			// FIXME: events.selected has only the originalEvent :/
			repeatWebRequest(events.selected, uncompletedRequest);
			events.selected.reset();
			break;
		}
		case 'onCompleted': {
			if (uncompletedRequest.requestId !== request.details.requestId) {
				return;
			}
			if (!events.selected) return;
			console.log('onCompleted:');
			console.log(request.details);

			events.selected.reset();
			break;
		}

		// The order of these load events corresponds to the order they come in!
		case 'eventLoaded': {
			/* if (!events.selected) return; */
			console.log('eventLoaded');

			// TODO: if new events present add to all events / update allEvents
			console.log(request.details);
			const loadFormData: IloadFormData =
				request.details.requestBody.formData;
			const rawNewData: string = loadFormData.emf[0];
			/* const newData: any = {}; */

			/* rawData = "I2NvbnRhY3RzQGdyb3VwLnYuY2FsZW5kYXIuZ29vZ2xlLmNvbQ 20190120/20190321 63685150699"  */
			for (const rawData of rawNewData.split('\n')) {
				const data = rawData.split(' ');
				const eid = data[0];
				const timestamp = data[1];
				const calendarEvent = events.calendarEvents.find(
					event => event.eid === eid
				);
				if (calendarEvent) {
					calendarEvent.timestamp = timestamp;
				}
			}

			break;
		}
		/* case 'containsLoadOnSendHeaders': {
			if (!events.selected) return;
			console.log('containsLoadOnSendHeaders');
			break;
		} */
		case 'containsLoadOnCompleted': {
			if (!events.selected) return;
			console.log('containsLoadOnCompleted');

			/** Number of tries before you give up waiting. */
			let i: number = 5;

			// Wait a few times for div to change place
			while (!events.selected.reset() && i) {
				await new Promise(r => setTimeout(r, 100));
				i--;
			}

			break;
		}
		default:
			throw new Error(`unknown request.action: ${request.action}`);
	}
});

console.log('Box select extension on google calendar webpage active.');

const s: HTMLScriptElement = document.createElement('script');
s.src = chrome.runtime.getURL('script.bundle.js');
document.body.insertBefore(s, document.body.lastChild);
s.onload = () => {
	s.remove();
};

window.addEventListener('injectedScriptInitialData', (data: CustomEvent) => {
	data.detail.forEach((eventData: Idetail) => {
		events.add(new CalendarEvent(eventData));
	});
});

interface IeventLoadCustomEvent extends CustomEvent {
	detail: string;
}

interface IsingleEventLoad extends Array<number | string> {
	[index: number]: string;
}

interface IrawEventData {
	[index: number]: any;

	/** event id  */
	[0]: string;

	/** title  */
	[1]: string;

	/** start date timestamp  */
	[2]: string;

	/** end date timestamp  */
	[3]: string;
}

interface IeventData {
	eid: string;
	startDate: string;
	endDate: string;
	title: string;
}

/* Load new event data caused by an overwrite of XHR prototype's functions. */
window.addEventListener(
	'injectedScriptEventLoad',
	(data: IeventLoadCustomEvent) => {
		console.group('injectedScriptEventLoad');
		const detail: IsingleEventLoad[] = JSON.parse(
			String.raw`${data.detail.substring(5)}`
		);
		console.log(detail);
		for (const unknownDataElement of detail) {
			/*
				"a" - event
				"v" - ?
				"us" - ?
			*/
			if (unknownDataElement[0] === 'a') {
				const rawEventData: IrawEventData = JSON.parse(
					unknownDataElement[1]
				);

				const eventData: IeventData = {
					/* no id, I think it's not needed */
					eid: rawEventData[0],
					title: rawEventData[1],
					startDate: rawEventData[2],
					endDate: rawEventData[3]
				};

				const foundEvent = events.calendarEvents.find(
					event => event.eid === eventData.eid
				);

				if (!foundEvent) {
					/* FIXME: this actually happens! should it? */
					/* debugger; */

					/* Event created while extension was online. Create new one? */
					events.add(new CalendarEvent(eventData));
				} else {
					/* No need to assign if new event just got created. */
					foundEvent.assign(eventData);
				}
			}
		}
		console.groupEnd();
	}
);

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
		if (!events.selected) return;
		events.selected.delete();
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
		events.updateVisible();
		events.setGradientAnimation(true);
		isSelectKeyPressed = true;

		if (events.selected) {
			events.selected.unselect();
		}
	}
}

function keyUp(e: { key: string } | KeyboardEvent) {
	if (e.key !== SELECT_KEY) {
		return;
	}

	slidedown.up();

	events.setGradientAnimation(false);

	// Delete blocker
	if (blocker.created) {
		blocker.setState(document.body, false);
	}

	if (Selection.visible) {
		selector.destroy();
	}

	isSelectKeyPressed = false;
}

function boxSelectDown(e: MouseEvent) {
	// If B is not being held dont do anything
	if (!isSelectKeyPressed) {
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
	if (!isSelectKeyPressed) {
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
	selector.select(events);
	events.selected.reset();
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
