import { CalendarEvent, IcalendarEventHTMLElement } from '..';

interface IcalendarEvents {
	[index: string]: CalendarEvent;
}

/** This is a parent class of both CalendarEvents and SelectedEvents.  */
export abstract class Events {
	/** This variable is holds all possible events not just the selectable HTMLElements.
	 *  This is done for timestamps.
	 */
	public events: IcalendarEvents | {};

	constructor() {
		this.events = {};
	}

	/** Takes care of the selectable property of CalendarEvent's.  */
	protected findInDOM(): IcalendarEventHTMLElement[] {
		/* Assume all elements are inselectable.  */
		this.calendarEvents.forEach(calendarEvent => {
			calendarEvent.selectable = false;
		});

		const eventsHTMLElements: IcalendarEventHTMLElement[] = Array.from(
			document.querySelectorAll(
				'div[role~="button"], div[role~="presentation"]'
			) as NodeListOf<IcalendarEventHTMLElement>
		).filter((event: IcalendarEventHTMLElement) => {
			return !!event.dataset.eventid;
		});

		console.log(`Found ${eventsHTMLElements.length} events in DOM.`);

		return eventsHTMLElements;
	}

	get calendarEvents(): CalendarEvent[] {
		return Object.values(this.events || {});
	}

	get elements(): IcalendarEventHTMLElement[] {
		return this.calendarEvents.map(event => event.element);
	}

	get selectable(): CalendarEvent[] {
		return this.calendarEvents.filter(event => event.selectable);
	}

	get selectableElements(): IcalendarEventHTMLElement[] {
		return this.selectable.map(event => event.element);
	}
}
