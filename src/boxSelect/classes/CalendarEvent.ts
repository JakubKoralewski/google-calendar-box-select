import { IcalendarEventHTMLElement } from '..';

interface ICalendarEventConstructor {
	eid: string;
	title?: string;
	startDate?: string;
	endDate?: string;
	element?: IcalendarEventHTMLElement;
	selectable?: boolean;
}

export class CalendarEvent {
	public readonly eid: string;
	public title: string;
	public startDate: string;
	public endDate: string;
	public element: IcalendarEventHTMLElement;
	private _selectable: boolean;
	private _selected: boolean;

	/** CalendarEvent object constructor */
	constructor(someObject: ICalendarEventConstructor) {
		this.eid = someObject.eid;
		this.title = someObject.title || null;
		this.startDate = someObject.startDate || null;
		this.endDate = someObject.endDate || null;
		this.element = someObject.element || null;
		this._selectable = someObject.selectable || false;
		this._selected = false;
	}

	/* 	get element(): IcalendarEventHTMLElement {
		return this._element;
	}

	set element(newElement: IcalendarEventHTMLElement) {
		newElement.id = this._selected ? 'selected' : '';
		this._element = newElement;
	} */

	get timespan(): string {
		if (!this.startDate || !this.endDate) {
			console.error(
				`this.startDate: ${this.startDate}; this.endDate: ${
					this.endDate
				}`
			);
			return 'eror';
		}
		return `${this.startDate}/${this.endDate}`;
	}

	set selected(state: boolean) {
		this.element.id = state ? 'selected' : '';
		console.log('setting', this.element, `id to`);
		console.log(state ? 'selected' : '%cEMPTY', state ? '' : 'color: red');
		this._selected = state;
	}

	get selected(): boolean {
		return this._selected;
	}

	set selectable(state: boolean) {
		this._selectable = state;
	}

	get selectable(): boolean {
		return this._selectable;
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
