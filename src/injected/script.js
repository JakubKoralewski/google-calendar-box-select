class CalendarEvent {
	constructor(array) {
		this.eid = array[0];
		this.title = array[1];
		this.startDate = array[2];
		this.endDate = array[3];
	}
}

let events = JSON.parse(window.INITIAL_DATA[2][2][0]);
events = events.map(event => new CalendarEvent(JSON.parse(event[1])));

window.dispatchEvent(new CustomEvent('injectedScriptInitialData', { detail: events }));
