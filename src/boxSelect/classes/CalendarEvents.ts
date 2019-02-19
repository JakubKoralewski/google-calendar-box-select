/* Google Calendar Box Select | MIT License | Copyright (c) 2019 Jakub Koralewski */
import {
	BRIGHTEN_BY,
	CalendarEvent,
	Events,
	GRADIENT,
	IcalendarEventHTMLElement,
	SelectedEvents
} from '..';
/*
	1. TODO: Update CalendarEvents on load webRequest.
*/
export class CalendarEvents extends Events {
	private _selected: SelectedEvents;
	private _selectedObsolete: boolean = false;

	/** Constructor only supplied when SelectedEvents is created.  */
	constructor() {
		super();
	}

	public updateVisible() {
		this.calendarEvents.forEach(event => (event.selectable = false));

		const eventsHTMLElements = this.findInDOM();

		eventsHTMLElements.forEach((event: IcalendarEventHTMLElement) => {
			const eventId = event.dataset.eventid;
			/* The found ones must be selectable. */
			if (this.events[eventId] == null) {
				this.events[eventId] = new CalendarEvent({
					eid: eventId,
					element: event,
					selectable: true
				});
			} else {
				(this.events[eventId] as CalendarEvent).element = event;
				(this.events[eventId] as CalendarEvent).selectable = true;
			}
		});
		return eventsHTMLElements;
	}

	/** Add a `CalendarEvent` to this instance of `CalendarEvents`.
	 * @param {CalendarEvent} event added event
	 */
	public add(event: CalendarEvent) {
		if (this.events.hasOwnProperty(event.eid)) {
			this.events[event.eid] = Object.assign(
				this.events[event.eid],
				event
			);
		} else {
			this.events[event.eid] = event;
		}
	}
	/** Set as obsolete.
	 *  Ran from SelectedEvents
	 */
	public remove(event: CalendarEvent) {
		delete this.events[event.eid];
	}

	/** Adds gradient animation to indicate the possibility of being selected.
	 *
	 * Only adds gradient to selectable elements.
	 * @param {boolean} state - gradient animation **ON** or **OFF**.
	 */
	public setGradientAnimation(state: boolean): void {
		if (state) {
			this.selectable.forEach((event: CalendarEvent) => {
				const evt = event.element;
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
					/EVT_COLOR/g,
					evtColor
				).replace(/BRIGHTENED_COLOR/g, brColor);

				evt.style.background = backgroundText;
				evt.style.backgroundSize = '400% 400%';
				evt.style.zIndex = '10002';
				evt.classList.add('possible');

				event.element = evt;
			});
		} else {
			this.selectable.forEach((event: CalendarEvent) => {
				const evt = event.element;
				evt.style.background = '';
				evt.style.backgroundColor = evt.oldColor;
				evt.style.zIndex = '4';
				evt.classList.remove('possible');
				event.element = evt;
			});
		}
	}

	/** May be null if no selected events present.
	 *  @returns {SelectedEvents | null} null or SelectedEvents
	 */
	get selected(): SelectedEvents | null {
		/* If no selected already created then create. */
		/* if (!this._selected || this._selected.events === {}) { */
		if (!this._selected || this._selectedObsolete) {
			const newSelectedEvents = this.getSelected();
			if (newSelectedEvents.length === 0) {
				return null;
			}
			this._selected = new SelectedEvents(newSelectedEvents, this);
			this._selectedObsolete = false;
		}
		return this._selected;
	}

	/** The idea is to force a new events.selected instance.  */
	public selectedObsolete() {
		this._selectedObsolete = true;

		/* Should I do this?: */
		/* this._selected = null; */
	}
}
