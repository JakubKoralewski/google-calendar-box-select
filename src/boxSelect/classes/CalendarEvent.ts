class CalendarEvent {
	/** CalendarEvent object constructor
	 * @param {{eid: string, title: string, startDate: string, endDate: string, element: Element}} someObject
	 * @param {string} someObject.eid eid
	 */
	constructor(someObject) {
		this.eid = someObject.eid;
		this.title = someObject.title;
		this.startDate = someObject.startDate;
		this.endDate = someObject.endDate;
		this.element = someObject.element;
	}

	get fullDate() {
		return `${this.startDate}/${this.endDate}`;
	}
}

export default CalendarEvent;
