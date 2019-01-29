/* import { OK_PATH, TRASH_PATH } from '../../config'; */
import IcalendarEventHTMLElement from '../interfaces/IcalendarEventHTMLElement';
import CalendarEvent from './CalendarEvent';
import SelectedEvents from './SelectedEvents';

class CalendarEvents {
	public events: Set<CalendarEvent>;

	public findVisible() {
		let eventsHTMLElements: IcalendarEventHTMLElement[] = Array.from(
			document.querySelectorAll(
				'div[role~="button"], div[role~="presentation"]'
			)
		);
		eventsHTMLElements = eventsHTMLElements.filter(event => {
			return event.dataset.eventid;
		});
		console.log(`Found ${eventsHTMLElements.length} events.`);
		this.events.union(eventsHTMLElements);
	}

	/** Add to CalendarEvent to CalendarEvents
	 * @param {CalendarEvent} event added event
	 */
	public add(event: CalendarEvent) {
		this.events.add(event);
	}

	/** Remove element from ever existing.
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

	get elements(): IcalendarEventHTMLElement[] {
		return [...this.events].map(event => event.element);
	}

	get selected(): CalendarEvents {
		return new SelectedEvents(
			[...this.events].filter((event: CalendarEvent) => {
				return event.selected;
			})
		);
	}

	/* 	set selected(events) {

	} */

	get visible(): CalendarEvents {
		return new SelectedEvents(
			[...this.events].filter((event: CalendarEvent) => {
				return event.visible;
			})
		);
	}
}

export default CalendarEvents;
