import IcalendarEventHTMLElement from '../interfaces/IcalendarEventHTMLElement';

interface ICalendarEventConstructor {
	eid: string;
	title: string;
	startDate: string;
	endDate: string;
	element?: IcalendarEventHTMLElement;
	visible?: boolean;
}

class CalendarEvent {
	public eid: string;
	public title: string;
	public startDate: string;
	public endDate: string;
	public element: IcalendarEventHTMLElement;
	public visible: boolean = false;
	public selected: boolean = false;

	/** CalendarEvent object constructor */
	constructor(someObject: ICalendarEventConstructor) {
		this.eid = someObject.eid;
		this.title = someObject.title;
		this.startDate = someObject.startDate;
		this.endDate = someObject.endDate;
		this.element = someObject.element;
		this.visible = someObject.visible;
	}

	get timespan() {
		return `${this.startDate}/${this.endDate}`;
	}
}

export default CalendarEvent;
