import { CalendarEvent, IcalendarEventHTMLElement } from '..';

interface IcalendarEvents {
	[index: string]: CalendarEvent;
}

/** This is a parent class of both CalendarEvents and SelectedEvents.  */
export abstract class Events {
	/** This variable is holds all possible events not just the visible HTMLElements.
	 *  This is done for timestamps.
	 */
	protected events: IcalendarEvents | {};

	constructor() {
		this.events = {};
	}

	/** Takes care of the visible property of CalendarEvent's.  */
	protected findInDOM(): IcalendarEventHTMLElement[] {
		/* Assume all elements are invisible.  */
		this.calendarEvents.forEach(calendarEvent => {
			calendarEvent.visible = false;
		});

		const eventsHTMLElements: IcalendarEventHTMLElement[] = Array.from(
			document.querySelectorAll(
				'div[role~="button"], div[role~="presentation"]'
			) as NodeListOf<IcalendarEventHTMLElement>
		).filter((event: IcalendarEventHTMLElement) => {
			return event.dataset.eventid;
		});

		/* Set only the found events as visible. */
		eventsHTMLElements.forEach(event => {
			this.events[event.dataset.eventid].visible = true;
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

	get visible(): CalendarEvent[] {
		return this.calendarEvents.filter(event => event.visible);
	}

	get visibleElements(): IcalendarEventHTMLElement[] {
		return this.visible.map(event => event.element);
	}
}
