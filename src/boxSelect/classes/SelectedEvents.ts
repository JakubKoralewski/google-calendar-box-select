import {
	CalendarEvent,
	CalendarEvents,
	Events,
	IcalendarEventHTMLElement,
	OK_PATH,
	TRASH_PATH
} from '..';
export class SelectedEvents extends Events {
	private allEvents: CalendarEvents;

	constructor(selectedEvents: CalendarEvent[], allEvents: CalendarEvents) {
		super();
		if (selectedEvents != null) {
			for (const event of selectedEvents) {
				this.events[event.eid] = event;
			}
		}
		this.allEvents = allEvents;
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
	 * @returns {boolean} have any elements been found
	 */
	public reset(): boolean {
		console.log('reset()\nbefore:');
		console.log(this.events);

		/* this.calendarEvents.forEach(event => (event.selectable = false)); */

		const allEvents = this.findInDOM();

		for (const calendarEvent of this.calendarEvents) {
			/** // FIXME: newEvent undefined in edge case when reset is set when HTMLElement changes place, but calendarEvent is an object with property of selectable = true */
			const newEvent = allEvents.find(
				HTMLEvent => HTMLEvent.dataset.eventid === calendarEvent.eid
			);
			if (!newEvent) {
				debugger;
			}

			/* The old HTMLEvent is replaced with the newly found one. */
			this.events[calendarEvent.eid].element = newEvent;
			this.events[calendarEvent.eid].selected = true;
			this.events[calendarEvent.eid].selectable = true;
		}
		console.log('after:');
		console.log(this.events);

		return allEvents.length > 0;
	}

	/** Sets all `CalendarEvent`s.selected = false.
	 *
	 */
	public unselect() {
		this.calendarEvents.forEach(event => (event.selected = false));
		delete this.events;
		this.allEvents.selectedObsolete();
	}
}
