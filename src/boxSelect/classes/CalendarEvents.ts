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
	public _selected: SelectedEvents;

	/** Constructor only supplied when SelectedEvents is created.  */
	constructor() {
		super();
	}

	public updateVisible() {
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

	/** Adds gradient animation to indicate the possibility of being selected.
	 *
	 * Only adds gradient to selectable elements.
	 * @param {boolean} state - gradient animation **ON** or **OFF**.
	 */
	public setGradientAnimation(state: boolean): void {
		if (state) {
			this.selectableElements.forEach((evt: IcalendarEventHTMLElement) => {
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
			});
		} else {
			this.selectableElements.forEach((evt: IcalendarEventHTMLElement) => {
				evt.style.background = '';
				evt.style.backgroundColor = evt.oldColor;
				evt.style.zIndex = '4';
				evt.classList.remove('possible');
			});
		}
	}

	/** May be null if no selected events present.
	 *  @returns {SelectedEvents | null} null or SelectedEvents
	 */
	get selected(): SelectedEvents | null {
		/* If no selected already created then create. */
		if (this._selected == null) {
			const newSelectedEvents = this.getSelected();
			if (newSelectedEvents.length === 0) {
				return null;
			}
			this._selected = new SelectedEvents(newSelectedEvents);
		}
		return this._selected;
	}

	private getSelected(): CalendarEvent[] {
		return this.calendarEvents.filter(event => {
			return event.selected === true;
		});
	}
}
