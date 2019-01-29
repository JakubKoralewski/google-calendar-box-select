import { OK_PATH, TRASH_PATH } from '../../config';
import IcalendarEventHTMLElement from '../interfaces/ICalendarEventHTMLElement';
import CalendarEvent from './CalendarEvent';

class SelectedEvents {

	constructor(events: Set<CalendarEvent> | CalendarEvent[]) {

	}

	/** Add to CalendarEvent to CalendarEvents
	 * @param {CalendarEvent} event added event
	 */
	public add(event: CalendarEvent) {
		this._events.add(event);
	}

	
}
