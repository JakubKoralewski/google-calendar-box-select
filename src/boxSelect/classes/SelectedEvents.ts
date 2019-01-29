import { OK_PATH, TRASH_PATH } from '../../config';
import IcalendarEventHTMLElement from '../interfaces/IcalendarEventHTMLElement';
import CalendarEvent from './CalendarEvent';
import CalendarEvents from './CalendarEvents';

class SelectedEvents extends CalendarEvents {
	constructor(selectedEvents?: Set<CalendarEvent> | CalendarEvent[]) {
		super(selectedEvents);
	}

	/** Delete selected events by clicking on the trashcan. */
	public async delete() {

		/* Let popup know when starts and ends for UX animation purposes */
		chrome.runtime.sendMessage({
			action: 'deleteStart'
		});

		console.log('deleting these events:');
		console.log(this.events);

		for (const calendarEvent of this.events) {
			const event = calendarEvent.element;
			event.click();

			/* Wait for trash can to appear. */
			while (!document.querySelector(TRASH_PATH)) {
				await new Promise(r => setTimeout(r, 50));
			}

			/* Click trash can. */
			(document.querySelector(
				TRASH_PATH
			) as IcalendarEventHTMLElement).click();

			/*  What is below is important!
			 *  There are multiple ways a delete process in Google Calendar works.
			 *  If an event is reoccurring there is another popup
			 *  that checks whether you want to delete JUST THIS EVENT || THIS AND NEXT || ALL.
			 *  If there is no popup then goes to next.
			 */
			let i = 0;
			let reoccurringEvent = true;
			while (!document.querySelector(OK_PATH)) {
				if (i > 10) {
					reoccurringEvent = false;
					break;
				}
				await new Promise(r => setTimeout(r, 50));
				i++;
			}
			/* If doesn't require choice of type of deletion then you're done. */
			if (!reoccurringEvent) continue;

			/* Confirm delete. */
			(document.querySelector(
				OK_PATH
			) as IcalendarEventHTMLElement).click();

			/* Wait for ok to disappear */
			while (document.querySelector(OK_PATH)) {
				await new Promise(r => setTimeout(r, 250));
			}

			/* Wait for trash can to disappear */
			while (document.querySelector(TRASH_PATH)) {
				await new Promise(r => setTimeout(r, 350));
			}
			console.log('disappeared');

			this.remove(calendarEvent);
			super.remove(calendarEvent);
		}
		chrome.runtime.sendMessage({
			action: 'deleteEnd'
		});
	}
}

export default SelectedEvents;
