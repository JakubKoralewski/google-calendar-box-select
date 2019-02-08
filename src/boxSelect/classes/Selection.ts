import { CalendarEvent, CalendarEvents, IcalendarEventHTMLElement } from '..';

export class Selection {
	public static visible: boolean;
	public x: number;
	public y: number;
	public element: HTMLElement;
	public parent: HTMLElement;

	constructor(startX: number, startY: number, parent: HTMLElement) {
		this.x = startX;
		this.y = startY;

		const element = document.createElement('div');
		element.style.left = `${startX}px`;
		element.style.top = `${startY}px`;

		element.id = 'selector';
		this.element = element;

		this.parent = parent;
		Selection.visible = true;

		this.parent.insertBefore(this.element, this.parent.firstChild);
	}

	public display(x: number, y: number) {
		// https://stackoverflow.com/questions/30983000/how-to-workaround-a-negative-height-and-width
		this.element.style.width = Math.abs(x - this.x) + 'px';
		this.element.style.height = Math.abs(y - this.y) + 'px';

		if (y < this.y) {
			this.element.style.top = y + 'px';
			this.element.style.height = Math.abs(y - this.y) + 'px';
		}

		if (x < this.x) {
			this.element.style.left = x + 'px';
			this.element.style.width = Math.abs(x - this.x) + 'px';
		}
	}

	public destroy() {
		this.parent.removeChild(this.element);
		Selection.visible = false;
	}

	public select(events: CalendarEvents) {
		/* //TODO: [#7](https://github.com/JakubKoralewski/google-calendar-box-select/issues/7) */

		// 102px (string) -> 102 (number)
		let left: string | number = this.element.style.left;
		left = parseInt(left.substring(0, left.length - 2), 10);

		let top: string | number = this.element.style.top;
		top = parseInt(top.substring(0, top.length - 2), 10);

		let height: string | number = this.element.style.height;
		height = parseInt(height.substring(0, height.length - 2), 10);

		let width: string | number = this.element.style.width;
		width = parseInt(width.substring(0, width.length - 2), 10);

		const right = left + width;
		const bottom = top + height;

		const calendarEvents = events.selectable;

		calendarEvents.forEach((calendarEvent: CalendarEvent) => {
			const event: IcalendarEventHTMLElement = calendarEvent.element;

			const b = event.getBoundingClientRect();

			const eventsLeftEdgeToTheLeftOfRightEdge = b.left < right;
			const eventsRightEdgeToTheRightOfLeftEdge = b.right > left;
			const eventsTopAboveBottom = b.top < bottom;
			const eventsBottomBelowTop = b.bottom > top;

			// If event overlaps selector
			if (
				eventsLeftEdgeToTheLeftOfRightEdge &&
				eventsRightEdgeToTheRightOfLeftEdge &&
				eventsTopAboveBottom &&
				eventsBottomBelowTop
			) {
				calendarEvent.selected = true;
			}
		});

		events.selectedObsolete();
	}
}
