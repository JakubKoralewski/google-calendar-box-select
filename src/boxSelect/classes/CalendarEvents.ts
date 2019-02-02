import {
	BRIGHTEN_BY,
	CalendarEvent,
	GRADIENT,
	IcalendarEventHTMLElement,
	SelectedEvents
} from '..';

interface IcalendarEvents {
	[index: string]: CalendarEvent;
}

export class CalendarEvents {
	/** This variable is supposed to hold all possible events not just the visible HTMLElements.  */
	public events: IcalendarEvents;

	constructor() {}

	/** Gets all visible event `HTMLElement`s.
	 *
	 *  Assigns that element to `this.events` or creates a new `CalendarEvent` if one is not found.
	 *
	 * @returns {void} it assigns the found events to `this.events`
	 */
	public findVisible(): IcalendarEventHTMLElement[] {
		let eventsHTMLElements: IcalendarEventHTMLElement[] = Array.from(
			document.querySelectorAll(
				'div[role~="button"], div[role~="presentation"]'
			)
		);

		/* Filter only these events that ocntain the event.dataset.eventid property. */
		eventsHTMLElements = eventsHTMLElements.filter(event => {
			return event.dataset.eventid;
		});

		console.log(`Found ${eventsHTMLElements.length} events.`);

		/* Assume all elements are invisible. */
		this.calendarEvents.forEach(
			(event: CalendarEvent) => (event.visible = false)
		);

		eventsHTMLElements.forEach((event: IcalendarEventHTMLElement) => {
			const eventId = event.dataset.eventid;

			/* The found ones must be visible so set visible as true. */
			if (this.events[eventId].element != null) {
				this.events[eventId].element = event;
				this.events[eventId].visible = true;
			} else {
				this.events[eventId] = new CalendarEvent({
					eid: eventId,
					element: event,
					visible: true
				});
			}
		});

		return eventsHTMLElements;
	}

	/** Add a `CalendarEvent` to this instance of `CalendarEvents`.
	 * @param {CalendarEvent} event added event
	 */
	public add(event: CalendarEvent) {
		this.events[event.eid] = Object.assign(this.events[event.eid], event);
	}

	/** Remove element from ever being able to access it again!
	 *
	 *  **Use only if the element is permanently deleted.**
	 *  @param {string} x - eid of element to delete
	 * 	@param {CalendarEvent} x - CalendarEvent instance to delete
	 */
	public remove(x: string): void {
		if (typeof x === 'string') {
			delete this.events[x];
		}
	}

	/** Adds gradient animation to indicate the possibility of being selected.
	 *
	 * Only adds gradient to visible elements.
	 * @param {boolean} state - gradient animation **ON** or **OFF**.
	 */
	public setGradientAnimation(state: boolean): void {
		this.visibleElements.forEach((evt: IcalendarEventHTMLElement) => {
			if (state) {
				/** example value: 'rgb(202, 189, 191)' */
				const evtColor: string = evt.style.backgroundColor;

				/* Extract numbers from rgb string to create brightened color. */
				let brColor: number[] | string = evtColor
					.match(/\d+/g)
					.map(number =>
						Math.min(parseInt(number, 10) + BRIGHTEN_BY, 255)
					);

				brColor = `rgb(${brColor[0]}, ${brColor[1]}, ${brColor[2]})`;
				evt.oldColor = evtColor;

				const backgroundText = GRADIENT.replace(
					'${evtColor}',
					evtColor
				).replace('${brColor', brColor);

				evt.style.background = backgroundText;
				evt.style.backgroundSize = '400% 400%';
				evt.style.zIndex = '10002';
				evt.classList.add('possible');
			} else {
				evt.style.background = '';
				evt.style.backgroundColor = evt.oldColor;
				evt.style.zIndex = '4';
				evt.classList.remove('possible');
			}
		});
	}

	get calendarEvents(): CalendarEvent[] {
		return Object.values(this.events);
	}

	get elements(): IcalendarEventHTMLElement[] {
		return this.calendarEvents.map(event => event.element);
	}

	get selected(): SelectedEvents {
		return new SelectedEvents(
			this.calendarEvents.filter((event: CalendarEvent) => {
				return event.selected;
			})
		);
	}

	get visibleElements(): IcalendarEventHTMLElement[] {
		return this.calendarEvents
			.filter(event => event.visible)
			.map(event => event.element);
	}
}
