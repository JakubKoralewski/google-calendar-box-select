import CalendarEvent from './CalendarEvent';
class CalendarEvents {
	private _events: Set<CalendarEvent> = new Set();
	/** CalendarEvent object constructor
	 * @param {CalendarEvent[]} CalendarEventsArray events to populate the class
	 * @type {Object} CalendarEvents.events events
	 */
	constructor(CalendarEventsArray?: Set<CalendarEvent>) {
		if (CalendarEventsArray) {
			this._events = new Set(CalendarEventsArray);
		}
	}
	/** Add to CalendarEvent to CalendarEvents
	 * @param {CalendarEvent} event added event
	 */
	public add(event: CalendarEvent) {
		this._events.add(event);
	}

	get events(): Set<CalendarEvent> {
		return this._events;
	}
}

export default CalendarEvents;
