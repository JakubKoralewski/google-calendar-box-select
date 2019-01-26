class CalendarEvents {
	/** CalendarEvent object constructor
	 * @param {CalendarEvent[]} CalendarEventsArray events to populate the class
	 * @type {Object} CalendarEvents.events events
	 */
	constructor(CalendarEventsArray) {
		/** @type {Array} events  */
		this.events = new Set(CalendarEventsArray);
	}
	/** Add to CalendarEvent to CalendarEvents
	 * @param {CalendarEvent} event added event
	 */
	push(event) {
		this.events.add(event);
	}
}

export default CalendarEvents;
