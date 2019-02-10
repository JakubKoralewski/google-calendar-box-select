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

	/** There should be seven DIV's - each corresponding to a day.
	 *  Will work in 4 days view, week view.
	 *  Won't work in Month view.
	 */
	private elementsContainer: HTMLDivElement[];
	private elementsContainerObservers: MutationObserver[];
	private isMutationObserverApplied: boolean = false;

	constructor(selectedEvents: CalendarEvent[], allEvents: CalendarEvents) {
		super();
		if (selectedEvents != null) {
			for (const event of selectedEvents) {
				this.events[event.eid] = event;
			}
		}
		this.allEvents = allEvents;

		this.elementsContainer = Array.from(
			document.querySelectorAll('div[role=row] > div[role=gridcell]')
		);

		const mutationObserverConfig = { childList: true, subtree: true };

		this.elementsContainer.forEach(container => {
			const mutationObserver = new MutationObserver(
				(mutationsList, observer) => {
					console.log(
						'mutation observed on container',
						container,
						' with observer',
						observer
					);
					this.reset();
				}
			);
			mutationObserver.observe(container, mutationObserverConfig);
		});
	}

	get ids(): string[] {
		return Object.keys(this.events || {});
	}

	/** OBSOLETE WAY. Use only when using from popup cause I got no other idea for now.
	 *  Delete selected events by clicking on the trashcan.
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

	/** Set as obsolete.  */
	public remove(event: CalendarEvent) {
		delete this.events[event.eid];
		this.allEvents.remove(event);
		this.allEvents.selectedObsolete();
	}

	/** For all visible events it finds `HTMLElement`s of selected events.
	 *
	 *  Happens e.g. when event is dragged over to another day.
	 *  Ran after load to find events that changed DOM hierarchy e.g. after dragging.
	 *
	 * @returns {boolean} have any elements been found
	 */
	public reset(): boolean {
		console.log('reset()\nbefore:');
		console.log(this.events);

		/* this.calendarEvents.forEach(event => (event.selectable = false)); */

		const allEvents = this.findInDOM();
		let isEventFound = false;

		for (const calendarEvent of this.calendarEvents) {
			const newEvent = allEvents.find(
				HTMLEvent => HTMLEvent.dataset.eventid === calendarEvent.eid
			);
			if (!newEvent) {
				/* Event not found. Was probably deleted or something went wrong. */

				console.error('Event not found on reset. Deleting it.');
				this.remove(calendarEvent);
			} else {
				isEventFound = true;
			}

			/* The old HTMLEvent is replaced with the newly found one. */
			this.events[calendarEvent.eid].element = newEvent;
			this.events[calendarEvent.eid].selected = true;
			this.events[calendarEvent.eid].selectable = true;
		}
		console.log('after:');
		console.log(this.events);

		return isEventFound;
	}

	/**
	 * Sets all `CalendarEvent`s.selected = false.
	 */
	public unselect() {
		this.calendarEvents.forEach(event => (event.selected = false));
		delete this.events;
		this.allEvents.selectedObsolete();
	}
}
