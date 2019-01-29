import IcalendarEventHTMLElement from '../interfaces/IcalendarEventHTMLElement';

interface ICalendarEventConstructor {
	eid: string;
	title: string;
	startDate: string;
	endDate: string;
	element: IcalendarEventHTMLElement;
	visible?: boolean;
}

class CalendarEvent {
	public eid: string;
	public title: string;
	public startDate: string;
	public endDate: string;
	public element: IcalendarEventHTMLElement;
	private _visible: boolean;
	private _selected: boolean;

	/** CalendarEvent object constructor */
	constructor(someObject: ICalendarEventConstructor) {
		this.eid = someObject.eid;
		this.title = someObject.title;
		this.startDate = someObject.startDate;
		this.endDate = someObject.endDate;
		this.element = someObject.element;
		this._visible = someObject.visible != null ? someObject.visible : false;
	}

	get timespan(): string {
		return `${this.startDate}/${this.endDate}`;
	}

	set selected(state: boolean) {
		this.element.id = state ? 'selected' : '';
		this._selected = state;
	}

	get selected(): boolean {
		return this._selected;
	}

	set visible(state: boolean) {
		this._visible = state;
	}

	get visible(): boolean {
		return this._visible;
	}
}

export default CalendarEvent;
