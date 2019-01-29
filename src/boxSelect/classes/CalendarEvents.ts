import {OK_PATH, TRASH_PATH} from '../../config';
import IcalendarEventHTMLElement from '../interfaces/IcalendarEventHTMLElement' ;
import CalendarEvent from './CalendarEvent';
class CalendarEvents {
	public events: Set<CalendarEvent> = new Set();

	/** CalendarEvent object constructor
	 * @param {CalendarEvent[]} calendarEvents events to populate the class
	 * @type {Object} CalendarEvents.events events
	 */
	constructor(calendarEvents: Set<CalendarEvent> | CalendarEvent[]) {
		this.events = new Set(calendarEvents);
	}

	/** Add to CalendarEvent to CalendarEvents
	 * @param {CalendarEvent} event added event
	 */
	public add(event: CalendarEvent) {
		this.events.add(event);
	}
	/** Remove element.
	 *  @param {string} x - eid of element to delete
	 * 	@param {CalendarEvent} x - CalendarEvent instance to delete
	 */
	public remove(x: CalendarEvent | string) {
		let eventToDelete = x;
		if (typeof x === 'string') {
			eventToDelete = [...this.events].find(event => event.eid === x);
		}
		this.events.delete(eventToDelete as CalendarEvent);
	}

	/** Delete events by clicking on the trashcan. */
	public async delete() {
		/* Let popup know when starts and ends for UX animation purposes */
		const events = [...this.selected].map(event => event.element);
		chrome.runtime.sendMessage({
			action: 'deleteStart'
		});
		console.log('deleting these events:');
		console.log(events);

		for (const entry of events) {
			entry.click();

			/* Wait for trash can to appear. */
			while (!document.querySelector(TRASH_PATH)) {
				await new Promise(r => setTimeout(r, 50));
			}

			/* Click trash can. */
			(document.querySelector(
				TRASH_PATH
			) as IcalendarEventHTMLElement).click() ;

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
					reoccurringEvent = false ;
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
		}
		this.setAsSelected(events, false);
		chrome.runtime.sendMessage({
			action: 'deleteEnd'
		});
	}
	public [Symbol.iterator]() {
		return this.events;
	}

	get selected() {
		return new CalendarEvents([...this.events].filter(event => event.selected));
	}

}

export default CalendarEvents;
