import {
	Blocker,
	CalendarEvent,
	CalendarEvents,
	Idetail,
	IuncompletedRequest,
	repeatWebRequest,
	Selection,
	Slidedown
} from '.';

/** Default: `b`  */
let SELECT_KEY = 'b';
/** Default: `q`  */
let DELETE_KEY = 'q';

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

			repeatWebRequest(events.selected, uncompletedRequest);
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
		case 'containsLoadOnCompleted': {
			if (uncompletedRequest.requestId !== request.details.requestId) {
				return;
			}
			if (!events.selected) return;
			console.log('containsLoadOnCompleted');
			// TODO: if new events present add to all events / update allEvents

			/* events.selected.reset(); */
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
	selector.select(events.selectable);
	// FIXME: not giving events.selected new events
	// events.resetSelected();
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
