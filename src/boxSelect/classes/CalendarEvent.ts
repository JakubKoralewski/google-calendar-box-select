import { IcalendarEventHTMLElement } from '..';

interface ICalendarEventConstructor {
	eid: string;
	title?: string;
	startDate?: string;
	endDate?: string;
	element?: IcalendarEventHTMLElement;
	visible?: boolean;
}
/* interface ICalendarEventAssignment {
	eid?: string;
	title?: string;
	startDate?: string;
	endDate?: string;
	element?: IcalendarEventHTMLElement;
	visible?: boolean;
} */

class CalendarEvent {
	public eid: string;
	public title: string;
	public startDate: string;
	public endDate: string;
	public element: IcalendarEventHTMLElement;
	private _visible: boolean;
	private _selected: boolean = false;

	/** CalendarEvent object constructor */
	constructor(someObject: ICalendarEventConstructor) {
		this.eid = someObject.eid;
		this.title = someObject.title || null;
		this.startDate = someObject.startDate || null;
		this.endDate = someObject.endDate || null;
		this.element = someObject.element || null;
		this._visible = someObject.visible || false;
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

	/* public assign(object: IcalendarEventHTMLElement): void;
	public assign(object: ICalendarEventAssignment): void;
	public assign(object: CalendarEvent): void;

	*/
	/* public assign(object: IcalendarEventHTMLElement): void; */
	/* public static assign(object: ICalendarEventAssignment): void; */
	/* public assign(object: CalendarEvent): CalendarEvent; */
	/** Supply new data to be assigned to the particular event.
	 *  Overrites other data of the same type.
	 */
	public assign(object: IcalendarEventHTMLElement): void {
		if (object.dataset.eventid != null) {
			this.element = object as IcalendarEventHTMLElement;
		}
	}
}

export default CalendarEvent;
