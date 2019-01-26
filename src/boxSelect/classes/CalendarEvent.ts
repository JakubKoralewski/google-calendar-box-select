import ICalendarEventHTMLElement from '../interfaces/ICalendarEventHTMLElement';

interface ICalendarEventConstructor {
	eid: string;
	title: string;
	startDate: string;
	endDate: string;
	element?: ICalendarEventHTMLElement;
}

class CalendarEvent {
	public eid: string;
	public title: string;
	public startDate: string;
	public endDate: string;
	public element: ICalendarEventHTMLElement;

	/** CalendarEvent object constructor */
	constructor(someObject: ICalendarEventConstructor) {
		this.eid = someObject.eid;
		this.title = someObject.title;
		this.startDate = someObject.startDate;
		this.endDate = someObject.endDate;
		this.element = someObject.element;
	}

	get timespan() {
		return `${this.startDate}/${this.endDate}`;
	}
}

export default CalendarEvent;
