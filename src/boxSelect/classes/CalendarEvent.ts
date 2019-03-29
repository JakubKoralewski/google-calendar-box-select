/* Google Calendar Box Select | MIT License | Copyright (c) 2019 Jakub Koralewski */
import { IcalendarEventHTMLElement } from '..';

interface IcalendarEventConstructor {
	eid: string;
	title?: string;
	startDate?: string;
	endDate?: string;
	element?: IcalendarEventHTMLElement;
	selectable?: boolean;
}
interface IcalendarEventAssignment {
	eid?: string;
	title?: string;
	startDate?: string;
	endDate?: string;
	element?: IcalendarEventHTMLElement;
	selectable?: boolean;
}

interface IcalendarEventAssignmentEntries {
	[index: number]: [string, string];
}

enum TYPE {
	HTML_ELEMENT,
	OBJECT
}

export class CalendarEvent {
	public readonly eid: string;
	public readonly title: string;
	public startDate: string;
	public endDate: string;
	public element: IcalendarEventHTMLElement;
	private _selectable: boolean;
	private _selected: boolean;

	/** CalendarEvent object constructor */
	constructor(someObject: IcalendarEventConstructor) {
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

	get timestamp(): string {
		if (!this.startDate || !this.endDate) {
			console.error(
				`this.startDate: ${this.startDate}; this.endDate: ${
					this.endDate
				}`
			);
			return;
		}
		return `${this.startDate}/${this.endDate}`;
	}

	set timestamp(newTimestamp: string) {
		const newTimestamps = newTimestamp.split('/');
		this.startDate = newTimestamps[0];
		this.endDate = newTimestamps[1];
	}

	set selected(state: boolean) {
		console.group(`set selected(state: ${state}`);

		this.element.id = state ? 'selected' : '';
		console.log('setting', this.element, `id to`);
		console.log(state ? 'selected' : '%cEMPTY', state ? '' : 'color: red');
		this._selected = state;

		console.groupEnd();
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

	/** Supply new data to be assigned to the particular event.
	 *  Overrites other data of the same type.
	 */
	public assign(object: IcalendarEventAssignment): void;
	public assign(object: IcalendarEventHTMLElement): void;
	public assign(object: any): any {
		console.group(`CalendarEvent.assign(object: ${object})`);

		let objectType: TYPE;

		if ((object as IcalendarEventHTMLElement).hasOwnProperty('dataset') && (object as IcalendarEventHTMLElement).dataset.hasOwnProperty('eventid')) {
			objectType = TYPE.HTML_ELEMENT;
		} else {
			objectType = TYPE.OBJECT;
			console.log('Not assigning an element, but an object.');
		}

		if (objectType === TYPE.HTML_ELEMENT) {
			this.element = object;
		} else if (objectType === TYPE.OBJECT) {

			for (const entry of Object.entries(
				object as IcalendarEventAssignment
			)) {
				/*
				Where entry[0]: string is the key (e.g.: "eid", "startDate")
				and entry[1]: string is its value
				*/
				this[entry[0] as string] = entry[1] as string;
			}
		}
		console.groupEnd();
	}
}
