import {
	CalendarEvent,
	Events,
	IcalendarEventHTMLElement,
	OK_PATH,
	TRASH_PATH
} from '..';
export class SelectedEvents extends Events {
	constructor(selectedEvents: CalendarEvent[]) {
		super();
		if (selectedEvents != null) {
			for (const event of selectedEvents) {
				this.events[event.eid] = event;
			}
		}
	}

	get ids(): string[] {
		return Object.keys(this.events || {});
	}

	/** Delete selected events by clicking on the trashcan.
	 *  Also deletes the events in this.events.
	 */
	public async delete() {
		/* Let popup know when starts and ends for UX animation purposes */
		chrome.runtime.sendMessage({
			action: 'deleteStart'
		});

		console.log('deleting these events:');
		console.log(this.events);

		for (const calendarEvent of this.elements) {
			const event = calendarEvent;
			event.click();

			/* Wait for trash can to appear. */
			while (!document.querySelector(TRASH_PATH)) {
				await new Promise(r => setTimeout(r, 50));
			}

			/* Click trash can. */
			(document.querySelector(
				TRASH_PATH
			) as IcalendarEventHTMLElement).click();

			/*  What is below is important!
			 *  There are multiple ways a delete process in Google Calendar works.
			 *  If an event is reoccurring there is another popup
			 *  that checks whether you want to delete JUST THIS EVENT || THIS AND NEXT || ALL.
			 *  If there is no popup then goes to next.
			 */
			let i = 0;
			let reoccurringEvent = true;
			while (!document.querySelector(OK_PATH)) {
				if (i > 10) {
					reoccurringEvent = false;
					break;
				}
				await new Promise(r => setTimeout(r, 50));
				i++;
			}

			/* If doesn't require choice of type of deletion then you're done. */
			if (!reoccurringEvent) continue;

			/* Confirm delete. */
			(document.querySelector(
				OK_PATH
			) as IcalendarEventHTMLElement).click();

			/* Wait for ok to disappear */
			while (document.querySelector(OK_PATH)) {
				await new Promise(r => setTimeout(r, 250));
			}

			/* Wait for trash can to disappear */
			while (document.querySelector(TRASH_PATH)) {
				await new Promise(r => setTimeout(r, 350));
			}
			console.log('disappeared');

			delete this.events[calendarEvent.dataset.eventid];
		}
		chrome.runtime.sendMessage({
			action: 'deleteEnd'
		});
	}

	/** For all visible events it finds `HTMLElement`s of selected events.
	 *
	 *  Happens e.g. when event is dragged over to another day.
	 *  Ran after load to find events that changed DOM hierarchy e.g. after dragging.
	 *
	 *  // FIXME: when event's HTMLElement DOESN'T change place the id of `selected` gets lost and then when keyDown is triggered id stays!
	 */
	public reset() {
		console.log('reset()\nbefore:');
		console.log(this.events);

		const allEvents = this.findInDOM();

		/* Set only the found events as selectable. */
		allEvents.forEach(event => {
			const eventId = event.dataset.eventid;
			if (this.events.hasOwnProperty(eventId)) {
				this.events[eventId].selectable = true;
			}
		});

		for (const calendarEvent of this.calendarEvents) {
			const newEvent = allEvents.find(
				HTMLEvent => HTMLEvent.dataset.eventid === calendarEvent.eid
			);

			/* The old HTMLEvent is replaced with the newly found one. */
			this.events[calendarEvent.eid].element = newEvent;
			this.events[calendarEvent.eid].selected = true;
		}
		console.log('after:');
		console.log(this.events);
	}

	/** Sets all CalendarEvents.selected = false.
	 *
	 */
	public unselect() {
		this.calendarEvents.forEach((event: CalendarEvent) => {
			event.selected = false;
		});
		// FIXME: the selected events are never readded here
		this.events = {};
	}
}
