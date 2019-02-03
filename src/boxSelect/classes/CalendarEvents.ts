import {
	BRIGHTEN_BY,
	CalendarEvent,
	GRADIENT,
	IcalendarEventHTMLElement,
	SelectedEvents,
	Selection
} from '..';

interface IcalendarEvents {
	[index: string]: CalendarEvent;
}

export class CalendarEvents {
	/** This variable is supposed to hold all possible events not just the visible HTMLElements.  */
	public events: IcalendarEvents | {} = {};
	public _selected: SelectedEvents;

	/** Constructor only supplied when SelectedEvents is created.  */
	constructor(selectedEvents?: CalendarEvent[]) {
		if (selectedEvents != null) {
			for (const event of selectedEvents) {
				this.events[event.eid] = new CalendarEvent(event);
			}
		}
	}

	public getVisible() {
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
		this.calendarEvents.forEach((event: CalendarEvent) => {
			event.visible = false;
		});

		/* FIXME: The following loop cannot be ran in SelectedEvents, as it adds also unselected events. */
		eventsHTMLElements.forEach((event: IcalendarEventHTMLElement) => {
			const eventId = event.dataset.eventid;
			/* The found ones must be visible. */
			if (this.events[eventId] == null) {
				this.events[eventId] = new CalendarEvent({
					eid: eventId,
					element: event,
					visible: true
				});
			} else {
				(this.events[eventId] as CalendarEvent).element = event;
				(this.events[eventId] as CalendarEvent).visible = true;
			}
		});
		return eventsHTMLElements;
	}

	/** Add a `CalendarEvent` to this instance of `CalendarEvents`.
	 * @param {CalendarEvent} event added event
	 */
	public add(event: CalendarEvent) {
		if (this.events[event.eid] == null) {
			this.events[event.eid] = event;
		} else {
			this.events[event.eid] = Object.assign(
				this.events[event.eid],
				event
			);
		}
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
		return Object.values(this.events || {});
	}

	get elements(): IcalendarEventHTMLElement[] {
		return this.calendarEvents.map(event => event.element);
	}

	/* get selected(): SelectedEvents {
		const newSelectedEvents = this.calendarEvents.filter(
			(event: CalendarEvent) => {
				return event.selected === true;
			}
		);
		console.log('newSelectedEvents:', newSelectedEvents);
		return new SelectedEvents(newSelectedEvents);
	} */

	/** May be null if no selected events present.
	 *  @returns {SelectedEvents | null} null or SelectedEvents
	 */
	get selected(): SelectedEvents | null {
		/* If no selected already created then create. */
		if (this._selected == null) {
			const newSelectedEvents = this.findSelected();
			if (newSelectedEvents.length === 0) {
				return null;
			}
			this._selected = new SelectedEvents(newSelectedEvents);
		}
		return this._selected;
	}

	get visibleElements(): IcalendarEventHTMLElement[] {
		return this.visible.map(event => event.element);
	}

	get visible(): CalendarEvent[] {
		return this.calendarEvents.filter(event => event.visible);
	}

	protected findVisible(): IcalendarEventHTMLElement[] {
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
		this.calendarEvents.forEach((event: CalendarEvent) => {
			event.visible = false;
		});

		return eventsHTMLElements;
	}

	private findSelected(): CalendarEvent[] {
		const newSelectedEvents = this.calendarEvents.filter(
			event => {
				return event.selected === true;
			}
		);
		return newSelectedEvents;
	}
}
